import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
    try {
        const { db } = await connectToDatabase();

        // Get all animals
        const animals = await db.collection("animals")
            .find()
            .toArray();

        // Get the unique owner IDs
        const ownerIds = [
            ...new Set(animals.map(animal => animal.owner.toString()))
        ].map(id => new ObjectId(id));

        // Find the owners
        const users = await db.collection("users")
            .find({ _id: { $in: ownerIds } })
            .project({ password: 0 })
            .toArray();

        // Attach owner details to each animal
        const animalsWithOwners = animals.map(animal => ({
            ...animal,
            ownerDetails: users.find(
                user => user._id.toString() === animal.owner.toString()
            ) ?? null
        }));

        return NextResponse.json(
            { animals: animalsWithOwners },
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