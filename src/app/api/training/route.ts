import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
    try {
        // Get the userId from the URL
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        // Validate
        if (!userId || !ObjectId.isValid(userId)) {
            return NextResponse.json(
                { message: "Invalid or missing userId." },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        // Find user training logs
        const trainingLogs = await db.collection("trainingLogs")
            .find({ user: new ObjectId(userId) })
            .sort({ date: -1 })
            .toArray();

        const animalIds = [
            ...new Set(trainingLogs.map(log => log.animal.toString()))
        ].map(id => new ObjectId(id));

        const animals = await db.collection("animals")
            .find({ _id: { $in: animalIds } })
            .project({ name: 1, breed: 1 })
            .toArray();

        // Match each training log with its animal
        const logsWithAnimals = trainingLogs.map(log => ({
            ...log,
            animalDetails: animals.find(
                animal => animal._id.toString() === log.animal.toString()
            ) ?? null
        }));

        return NextResponse.json(
            { trainingLogs: logsWithAnimals },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error retrieving training logs:", error);

        return NextResponse.json(
            { message: "Something went wrong retrieving training logs." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {

        const body = await request.json();

        const {
            userId,
            animalId,
            title,
            description,
            hours
        } = body;

        // validate if any fields are empty / invalid
        if (
            typeof userId !== "string" ||
            typeof animalId !== "string" ||
            typeof title !== "string" ||
            typeof description !== "string" ||
            typeof hours !== "number" ||
            !Number.isFinite(hours) ||
            hours <= 0 ||
            !title.trim() ||
            !description.trim()
        ) {
            return NextResponse.json(
                { message: "Invalid or missing fields." },
                { status: 400 }
            );
        }

        // check if object ids are valid
        if (
            !ObjectId.isValid(userId) ||
            !ObjectId.isValid(animalId)
        ) {
            return NextResponse.json(
            { message: "Invalid user or animal ID." },
            { status: 400 }
            );
        }
        
        const { db } = await connectToDatabase();
        
        const animals = db.collection("animals");
        
        // check for animal / ownership
        const animal = await animals.findOne({
            _id: new ObjectId(animalId),
            owner: new ObjectId(userId)
        });
        
        if (!animal) {
            return NextResponse.json(
                { message: "Animal not found or does not belong to this user." },
                { status: 404 }
            );
        }

        const trainingLog = {
            // no need to assign _id because MongoDB does it automatically
            user: new ObjectId(userId),
            animal: new ObjectId(animalId),
            title: title.trim(),
            date: new Date(),
            description: description.trim(),
            hours: hours
        };

        // if all is good, add to the database!
        const trainingLogs = db.collection("trainingLogs");

        const result = await trainingLogs.insertOne(trainingLog);
        
        // call PATCH request
        const url = new URL(request.url);
        const baseUrl = url.origin;

        // for future ref, updating it directly is more effective (prevents needing to do another HTTP req), but proj description specifically asks for it
        const response = await fetch(`${baseUrl}/api/animal`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                animalId,
                hours
            })
        });

        if (!response.ok) {
            throw new Error("Failed to update animal hours.");
        }    
        // FOR FUTURE IMPROVEMENT (if I have time): make it such that if animal update fails training log fails too (don't want them to be mismatched)

        return NextResponse.json(
            {
            message: "Training log created successfully!",
            trainingLogId: result.insertedId
            },
            // apparently 201 is normally used for successful POST, but the README says to use 200
            { status: 200 }
        );

    } catch (error) {
        console.error("Error creating training log:", error);

        return NextResponse.json(
            { message: "Something went wrong creating the training log." },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { trainingLogId } = body;

        if (!ObjectId.isValid(trainingLogId)) {
            return NextResponse.json(
            { message: "Invalid training log ID." },
            { status: 400 }
            );
        }

        const { db } = await connectToDatabase();
        const trainingLogs = db.collection("trainingLogs");

        const result = await trainingLogs.findOne(
            { _id: new ObjectId(trainingLogId) }
        );

        if (!result) {
            return NextResponse.json(
                { message: "Training log not found." },
                { status: 400 }
            );
        }

        // call PATCH request
        const url = new URL(request.url);
        const baseUrl = url.origin;

        // for future ref, updating it directly is more effective (prevents needing to do another HTTP req), but proj description specifically asks for it
        const response = await fetch(`${baseUrl}/api/animal`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                animalId: result.animal.toString(),
                hours: -result.hours
            })
        });

        if (!response.ok) {
            throw new Error("Failed to update animal hours.");
        }    

        const deleteResult = await trainingLogs.deleteOne({
            _id: new ObjectId(trainingLogId)
        });
        
        if (deleteResult.deletedCount !== 1) {
            throw new Error("Failed to delete training log.");
        }

        return NextResponse.json(
            { message: "Training log deleted successfully!" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting training log:", error);

        return NextResponse.json(
            { message: "Something went wrong deleting the training log." },
            { status: 500 }
        );
    }
}