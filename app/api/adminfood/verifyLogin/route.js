import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        const client = await clientPromise;
        const db = client.db("adminfood_users");
        
        const user = await db.collection("adminfood_users").findOne({ email });

        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "User not found" 
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        return NextResponse.json({
            success: true,
            userData: {
                email: user.email,
                charityName: user.charityName,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login verification error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
}