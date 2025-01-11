require('dotenv').config({ path: '.backend.env' });
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://dehkai:${process.env.DB_PASSWORD}@voxia.bkbvl.mongodb.net/?retryWrites=true&w=majority&appName=Voxia`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // Add connection timeout settings
    connectTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    // Add automatic reconnect options
    maxPoolSize: 50,
    retryWrites: true,
    retryReads: true
});

async function run() {
  let retries = 3;
  while (retries > 0) {
    try {
      await client.connect();
      await client.db("admin").command({ ping: 1 });
      console.log("Successfully connected to MongoDB!");
      return client; // Return the connected client
    } catch (error) {
      console.error(`Connection attempt failed. Retries left: ${retries-1}`);
      console.error(error);
      retries--;
      if (retries === 0) {
        throw error;
      }
      // Wait for 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Export both the client and the connection function
module.exports = { client, run };
  