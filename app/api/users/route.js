import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("form-submission");
        
        // Fetch all users from user-data collection
        
        const users = await db.collection("user-data")
            .find({})
            .project({ name: 1, email: 1, createdAt: 1 })
            .sort({ createdAt: -1 })
            .toArray();
        
        return NextResponse.json({ 
            success: true, 
            users 
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}