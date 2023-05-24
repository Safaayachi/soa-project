const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const userProtoPath = "user.proto";
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
});
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;

const userService = {
	getUser: (call, callback) => {
		const user = {
			id: call.request.user_id,
			firstName: "safa",
			lastName: "ayachi",
			email: "safa.ayachi@polytechnicien.tn",
			password: "hello",
		};
		callback(null, { user });
	},
	searchUsers: (call, callback) => {
		const { query } = call.request;

		const users = [
			{
				id: "1",
				firstName: "safa",
				lastName: "ayachi",
				email: "safa.ayachi@polytechnicien.tn",
				password: "hello",
			},
			{
				id: "2",
				firstName: "safa2",
				lastName: "ayachi2",
				email: "safa.ayachi2@polytechnicien.tn",
				password: "hello",
			},
		];
		callback(null, { users });
	},
};

const server = new grpc.Server();
server.addService(userProto.UserService.service, userService);
const port = 50052;
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
console.log(`User microservice running on port ${port}`);
