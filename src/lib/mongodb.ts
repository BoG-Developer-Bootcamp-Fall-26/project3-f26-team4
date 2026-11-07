import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
// process.env is how backend accesses environment vars

if (!uri) {
    throw new Error("URI not found (add it in .env.local)")
}

const client = new MongoClient(uri);
// creates client (like a tool that can access MongoDB database)

const clientPromise = client.connect();

export default clientPromise;