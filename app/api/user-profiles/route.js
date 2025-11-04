import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Get user profile by ID
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const email = searchParams.get('email');
        
        if (!id && !email) {
            return NextResponse.json({ success: false, message: "User ID or email required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("form-submission");
        
        let query = {};
        if (id) {
            query._id = new ObjectId(id);
        } else if (email) {
            query.email = email;
        }
        
        const profile = await db.collection("user-profiles").findOne(query);
        
        if (!profile) {
            return NextResponse.json({ success: false, message: "User profile not found" }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// Update user profile
export async function PUT(request) {
    try {
        const { id, profileData } = await request.json();
        
        if (!id || !profileData) {
            return NextResponse.json({ success: false, message: "Profile ID and data required" }, { status: 400 });
        }
        
        const client = await clientPromise;
        const db = client.db("form-submission");
        
        const result = await db.collection("user-profiles").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...profileData,
                    lastUpdated: new Date()
                }
            }
        );
        
        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, message: "User profile not found" }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}