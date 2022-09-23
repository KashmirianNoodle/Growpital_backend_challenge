import { MongoClient } from "mongodb";
export async function connectToDatabase(url) {
    let mongoClient;

    try {
        mongoClient = new MongoClient(url);
        console.log('Connecting to MongoDB');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB!');
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB failed!', error);
        process.exit();
    }
}

