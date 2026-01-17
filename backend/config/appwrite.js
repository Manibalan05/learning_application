const sdk = require('node-appwrite');

const client = new sdk.Client();

// Initialize Appwrite Client
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new sdk.Users(client);
const databases = new sdk.Databases(client);

module.exports = { client, databases, users };
