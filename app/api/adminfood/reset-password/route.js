import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        const { email, newPassword } = await request.json();
        
        const client = await clientPromise;
        const db = client.db("adminfood_users"); 
        const collection = db.collection("adminfood_users");
        const user = await collection.findOne({ 
            email: email.toLowerCase() 
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await collection.updateOne(
            { email: email.toLowerCase() },
            { 
                $set: { 
                    password: hashedPassword,
                    updatedAt: new Date()
                } 
            }
        );

        return NextResponse.json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error) {
        console.error("Reset Password API Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error: " + error.message },
            { status: 500 }
        );
    }
}