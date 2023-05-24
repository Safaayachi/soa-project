const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const productProtoPath = "product.proto";
const userProtoPath = "user.proto";
const resolvers = require("./resolvers");
const typeDefs = require("./schema");

const app = express();
app.use(bodyParser.json());

const productProtoDefinition = protoLoader.loadSync(productProtoPath, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
});
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
});
const productProto = grpc.loadPackageDefinition(productProtoDefinition).product;
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;
const clientProducts = new productProto.ProductService(
	"localhost:50051",
	grpc.credentials.createInsecure()
);
const clientUsers = new userProto.UserService(
	"localhost:50052",
	grpc.credentials.createInsecure()
);

const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
	app.use(cors(), bodyParser.json(), expressMiddleware(server));
});

app.get("/products", (req, res) => {
	clientProducts.searchProducts({}, (err, response) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json(response.products);
		}
	});
});

app.post("/product", (req, res) => {
	const { id, title, description } = req.body;
	clientProducts.createProduct(
		{ product_id: id, title: title, description: description },
		(err, response) => {
			if (err) {
				res.status(500).send(err);
			} else {
				res.json(response.product);
			}
		}
	);
});

app.get("/products/:id", (req, res) => {
	const id = req.params.id;
	clientProducts.getProduct({ productId: id }, (err, response) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json(response.product);
		}
	});
});

app.get("/users", (req, res) => {
	clientUsers.searchUsers({}, (err, response) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json(response.users);
		}
	});
});

app.get("/users/:id", (req, res) => {
	const id = req.params.id;
	clientUsers.getUser({ userId: id }, (err, response) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.json(response.user);
		}
	});
});

const port = 3000;
app.listen(port, () => {
	console.log(`API Gateway running on port ${port}`);
});
