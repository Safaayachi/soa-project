

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');


const userProtoPath = 'user.proto';
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
    
    const tv_show = {
      id: call.request.tv_show_id,
      title: 'Example TV Show',
      description: 'This is an example TV show.',
     
    };
    callback(null, {tv_show});
  },
  searchUsers: (call, callback) => {
    const { query } = call.request;
  
    const users = [
      {
        id: '1',
        title: 'Example TV Show 1',
        description: 'This is the first example TV show.',
      },
      {
        id: '2',
        title: 'Example TV Show 2',
        description: 'This is the second example TV show.',
      },
    ];
    callback(null, { users });
  },

};

const server = new grpc.Server();
server.addService(userProto.UserService.service, userService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
  
    console.log(`Server is running on port ${port}`);
    server.start();
  });
console.log(`User microservice running on port ${port}`);
