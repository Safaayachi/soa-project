const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const productProtoPath = "product.proto";
const userProtoPath = "user.proto";
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

const resolvers = {
	Query: {
		product: (_, { id }) => {
			return new Promise((resolve, reject) => {
				clientProducts.getProduct(
					{ productId: id },
					(err, response) => {
						if (err) {
							reject(err);
						} else {
							resolve(response.product);
						}
					}
				);
			});
		},
		products: () => {
			return new Promise((resolve, reject) => {
				clientProducts.searchProducts({}, (err, response) => {
					if (err) {
						reject(err);
					} else {
						resolve(response.products);
					}
				});
			});
		},
		user: (_, { id }) => {
			return new Promise((resolve, reject) => {
				clientUsers.getUser({ userId: id }, (err, response) => {
					if (err) {
						reject(err);
					} else {
						resolve(response.user);
					}
				});
			});
		},
		users: () => {
			return new Promise((resolve, reject) => {
				clientUsers.searchUsers({}, (err, response) => {
					if (err) {
						reject(err);
					} else {
						resolve(response.users);
					}
				});
			});
		},
	},
	Mutation: {
		createProduct: (_, { title, description, price }) => {
			return new Promise((resolve, reject) => {
				clientProducts.createProduct(
					{ title: title, description: description, price: price },
					(err, response) => {
						if (err) {
							reject(err);
						} else {
							resolve(response.product);
						}
					}
				);
			});
		},
	},
};

module.exports = resolvers;
