import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
// process.env is how backend accesses environment vars

if (!uri || !dbName) {
    throw new Error("Missing MongoDB environment variables");
}

const client = new MongoClient(uri);
// client is like a tool that access MongoDB

let clientPromise: Promise<MongoClient>;

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
    // new global variable (so it can be accessed) that holds either a promise or undefined (if not created yet)
}

// if node in development mode might cause unnecessary reconnections
if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
        global._mongoClientPromise = client.connect();
        // client.connect() takes some time so it's a promise
    }
    clientPromise = global._mongoClientPromise;
} else {
    clientPromise = client.connect();
}

export async function connectToDatabase() {
    const connectedClient = await clientPromise;
    const db = connectedClient.db(dbName);
    // .db selects the database

    return { client: connectedClient, db };
}