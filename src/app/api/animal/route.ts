import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        const {
            animalId,
            hours
        } = body;

        if (!animalId ||
            !hours ||
            typeof hours !== "number" ||
            !Number.isFinite(hours) ||
            hours === 0 ||
            !ObjectId.isValid(animalId)
        ) {
            return (NextResponse.json(
                { message: "Invalid animalId or hours" },
                { status: 400 }
            ))
        };

        const { db } = await connectToDatabase();

        const animals = db.collection("animals");

        const animalObjectId = new ObjectId(animalId)

        // updateOne first argument: which document to update, second argument: what to change
        const updateResult = await animals.updateOne(
            { 
                _id: animalObjectId,
                ...(hours < 0 ? { hoursTrained: { $gte: -hours } } : {})
                // adds condition to make sure we're not subtracting to make hours negative
            },
            { $inc: { hoursTrained: hours } }
        )

        // updateResult.matchedCount returns number of animals that matched first parameter
        if (updateResult.matchedCount !== 1) {
            return NextResponse.json(
                { message: "Animal not found or insufficient training hours." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Animal training hours updated successfully!" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating animal training hours:", error);

        return NextResponse.json(
            { message: "Something went wrong while updating animal training hours" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId || !ObjectId.isValid(userId)) {
            return NextResponse.json(
                { message: "Invalid or missing userId." },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        const animals = await db.collection("animals")
            .find({ owner: new ObjectId(userId) })
            .toArray();

        return NextResponse.json(
            { animals },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error retrieving animals:", error);

        return NextResponse.json(
            { message: "Something went wrong retrieving animals." },
            { status: 500 }
        );
    }
}