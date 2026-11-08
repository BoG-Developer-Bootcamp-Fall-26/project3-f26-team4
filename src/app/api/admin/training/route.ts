import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const trainingLogs = db.collection("trainingLogs");

        const allTrainingLogs = await trainingLogs.find().toArray();

        return NextResponse.json(
            { trainingLogs: allTrainingLogs },
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