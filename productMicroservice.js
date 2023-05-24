const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const productProtoPath = "product.proto";
const productProtoDefinition = protoLoader.loadSync(productProtoPath, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
});
const productProto = grpc.loadPackageDefinition(productProtoDefinition).product;
const uri = process.env.MONGO_DB_URI;
const client = new MongoClient(uri);
// gRPC service implementations
const productService = {
	getProduct: async (call, callback) => {
		const productId = call.request.product_id;
		try {
			const product = await client
				.db()
				.collection("products")
				.findOne({ id: productId });
			callback(null, { product });
		} catch (err) {
			callback(err);
		}
	},
	searchProducts: async (call, callback) => {
		const query = call.request.query;
		try {
			const products = await client
				.db()
				.collection("products")
				.find({ $text: { $search: query } })
				.toArray();
			callback(null, { products });
		} catch (err) {
			callback(err);
		}
	},
	createProduct: async (call, callback) => {
		const { title, description, price } = call.request;
		const product = {
			title: title,
			description: description,
			price: price,
		};
		try {
			const result = await client
				.db()
				.collection("products")
				.insertOne(product);
			callback(null, { product });
		} catch (err) {
			callback(err);
		}
	},
};

// Create a new gRPC server
const server = new grpc.Server();
server.addService(productProto.ProductService.service, productService);

// Connect to MongoDB and start the gRPC server
async function startServer() {
	try {
		// Connect to MongoDB
		const client = new MongoClient(uri);
		await client.connect();
		console.log("Connected to MongoDB");

		// Bind the gRPC server to a port
		const port = 50051;
		server.bindAsync(
			`0.0.0.0:${port}`,
			grpc.ServerCredentials.createInsecure(),
			(err, port) => {
				if (err) {
					console.error("Failed to bind server:", err);
					return;
				}
				console.log(`Server is running on port ${port}`);
				server.start();
			}
		);
		console.log(`Product microservice running on port ${port}`);
	} catch (err) {
		console.error("Failed to start the server:", err);
	}
}

// Start the gRPC server
startServer();
