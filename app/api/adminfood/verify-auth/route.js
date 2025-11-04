import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
    try {
        const { email, authAnswer } = await request.json();
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
        let isValid = false;
        
        if (user.authType === "date") {
            const storedDate = new Date(user.authAnswer).toISOString().split('T')[0];
            const providedDate = new Date(authAnswer).toISOString().split('T')[0];
            isValid = storedDate === providedDate;
        } else {
            isValid = user.authAnswer.toLowerCase() === authAnswer.toLowerCase();
        }

        if (!isValid) {
            return NextResponse.json(
                { success: false, message: "Incorrect answer" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Authentication successful"
        });

    } catch (error) {
        console.error("Verify Auth API Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error: " + error.message },
            { status: 500 }
        );
    }
}