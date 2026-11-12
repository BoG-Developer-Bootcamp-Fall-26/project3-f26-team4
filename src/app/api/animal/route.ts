import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            name,
            breed,
            owner,
            hoursTrained,
            profilePicture
        } = body;

        if (
            !name ||
            !breed ||
            !owner ||
            typeof name !== "string" ||
            typeof breed !== "string" ||
            typeof owner !== "string" ||
            !ObjectId.isValid(owner)
        ) {
            return NextResponse.json(
                { message: "Missing or invalid required fields." },
                { status: 400 }
            );
        }

        if (
            hoursTrained !== undefined &&
            (typeof hoursTrained !== "number" ||
            !Number.isFinite(hoursTrained) ||
            hoursTrained < 0)
        ) {
            return NextResponse.json(
                { message: "Invalid hoursTrained value." },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        const users = db.collection("users");
        const animals = db.collection("animals");

        const userExists = await users.findOne({
            _id: new ObjectId(owner)
        });

        if (!userExists) {
            return NextResponse.json(
                { message: "Owner user does not exist." },
                { status: 400 }
            );
        }

        const newAnimal = {
            name: name.trim(),
            breed: breed.trim(),
            owner: new ObjectId(owner),
            hoursTrained: hoursTrained ?? 0,
            profilePicture: profilePicture || ""
        };

        const result = await animals.insertOne(newAnimal);

        return NextResponse.json(
            {
                animal: {
                    ...newAnimal,
                    _id: result.insertedId
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating animal:", error);

        return NextResponse.json(
            { message: "Something went wrong creating the animal." },
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

        const animals = await db.collection("animals").aggregate([
            {
                $match: { owner: new ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                // normally returns an array, unwind makes it into an object
                $unwind: "$owner"
            },
            {
                $project: {
                    name: 1,
                    breed: 1,
                    hoursTrained: 1,
                    profilePicture: 1,
                    "owner.fullName": 1,
                    "owner.email": 1
                }
            }
        ]).toArray();

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

export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        const { animalId, hours } = body;

        if (
            !animalId ||
            typeof hours !== "number" ||
            !Number.isFinite(hours) ||
            hours === 0 ||
            !ObjectId.isValid(animalId)
        ) {
            return NextResponse.json(
                { message: "Invalid animalId or hours." },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        const animals = db.collection("animals");

        const updateResult = await animals.updateOne(
            {
                _id: new ObjectId(animalId),
                ...(hours < 0 ? { hoursTrained: { $gte: -hours } } : {})
            },
            { $inc: { hoursTrained: hours } }
        );

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
            { message: "Something went wrong while updating animal training hours." },
            { status: 500 }
        );
    }
}

/*
import dbConnect from "../../lib/dbConnect";
import Animal from "../../models/Animal";
import User from "../../models/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { name, breed, owner, hoursTrained, profilePicture } = req.body;

      if (!name || !breed || !owner) {
        return res.status(400).json({ error: "Missing required fields (name, breed, owner)." });
      }

      const userExists = await User.findById(owner);
      if (!userExists) {
        return res.status(400).json({ error: "Owner user does not exist." });
      }

      const animal = await Animal.create({
        name,
        breed,
        owner,
        hoursTrained: hoursTrained || 0,
        profilePicture: profilePicture || "",
      });

      return res.status(200).json(animal);
    } catch (error) {
      return res.status(500).json({ error: error.message || "Internal server error." });
    }
  }

  if (req.method === "GET") {
    try {
      const animals = await Animal.find({}).populate("owner", "fullName email");
      return res.status(200).json(animals);
    } catch (error) {
      return res.status(500).json({ error: error.message || "Internal server error." });
    }
  }

  res.setHeader("Allow", ["POST", "GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
*/