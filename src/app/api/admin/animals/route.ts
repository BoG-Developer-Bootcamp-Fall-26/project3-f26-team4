import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const animals = db.collection("animals");

        const allAnimals = await animals.find().toArray();

        return NextResponse.json(
            { animals: allAnimals },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error retrieving animals:", error);

        return NextResponse.json(
            { message: "Something went wrong while retrieving animals." },
            { status: 500 }
        );
    }
}