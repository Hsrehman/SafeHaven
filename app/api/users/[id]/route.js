import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
    try {
        const id = params.id;
        
        if (!id) {
            return NextResponse.json(
                { success: false, message: "User ID is required" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("form-submission");
        
        // Convert string ID to ObjectId
        let objectId;
        try {
            objectId = new ObjectId(id);
        } catch (error) {
            return NextResponse.json(
                { success: false, message: "Invalid user ID format" },
                { status: 400 }
            );
        }
        
        // Find user by ID
        const user = await db.collection("user-data").findOne({ _id: objectId });
        
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        
        return NextResponse.json({ 
            success: true, 
            user 
        });
        
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}