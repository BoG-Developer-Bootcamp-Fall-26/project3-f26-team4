import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const users = db.collection("users");

        // .find() first param: selection filter, second param: projection (what to include (1) and exclude (0), all are included by default)
        const allUsers = await users.find(
            {},
            {
                projection: {
                    password: 0
                }
            }
        ).toArray();
        // returns a cursor not an array so have to convert

        return NextResponse.json(
            { users: allUsers },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error retrieving users:", error);

        return NextResponse.json(
            { message: "Something went wrong while retrieving users." },
            { status: 500 }
        )
    }
}