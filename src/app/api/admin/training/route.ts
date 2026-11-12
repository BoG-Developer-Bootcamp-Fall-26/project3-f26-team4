
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
    try {
        const { db } = await connectToDatabase();

        // Get all training logs
        const trainingLogs = await db.collection("trainingLogs")
            .find()
            .sort({ date: -1 })
            .toArray();

        // Get all unique user IDs and animal IDs from the logs
        const userIds = [
            ...new Set(trainingLogs.map(log => log.user.toString()))
        ].map(id => new ObjectId(id));

        const animalIds = [
            ...new Set(trainingLogs.map(log => log.animal.toString()))
        ].map(id => new ObjectId(id));

        // Find the users associated with those logs
        const users = await db.collection("users")
            .find({ _id: { $in: userIds } })
            .project({ password: 0 })
            .toArray();

        // Find the animals associated with those logs
        const animals = await db.collection("animals")
            .find({ _id: { $in: animalIds } })
            .toArray();

        // Attach user and animal information to each log
        const logsWithDetails = trainingLogs.map(log => ({
            ...log,
            userDetails: users.find(
                user => user._id.toString() === log.user.toString()
            ) ?? null,
            animalDetails: animals.find(
                animal => animal._id.toString() === log.animal.toString()
            ) ?? null
        }));

        return NextResponse.json(
            { trainingLogs: logsWithDetails },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error retrieving training logs:", error);

        return NextResponse.json(
            { message: "Something went wrong while retrieving training logs." },
            { status: 500 }
        );
    }
}
