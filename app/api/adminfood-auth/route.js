import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        const { action, email, password, charityName, authType, authAnswer } = await request.json();
        const client = await clientPromise;
        const db = client.db("adminfood_users"); 
        const collection = db.collection("adminfood_users"); 

        switch (action) {
            case "register":
                const existingUser = await collection.findOne({ email });

                if (existingUser) {
                    return NextResponse.json(
                        { success: false, message: "Email already registered" },
                        { status: 400 }
                    );
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                await collection.insertOne({
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    authType,
                    authAnswer,
                    role: "adminfood",
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                return NextResponse.json({
                    success: true,
                    message: "Registration successful"
                });

            case "login":
                const loginUser = await collection.findOne({ 
                    email: email.toLowerCase()
                });

                if (!loginUser) {
                    return NextResponse.json(
                        { success: false, message: "User is not registered" },
                        { status: 401 }
                    );
                }
                const isPasswordValid = await bcrypt.compare(password, loginUser.password);

                if (!isPasswordValid) {
                    return NextResponse.json(
                        { success: false, message: "Invalid email or password" },
                        { status: 401 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    user: {
                        email: loginUser.email,
                        role: loginUser.role
                    }
                });

                case "forgotPassword":
                    const userExists = await collection.findOne({ 
                        email: email.toLowerCase()
                    });
                
                    if (!userExists) {
                        return NextResponse.json(
                            { success: false, message: "Email not found" },
                            { status: 404 }
                        );
                    }
                return NextResponse.json({
                    success: true,
                    message: "Email verified",
                    user: {
                            email: userExists.email,
                            authType: userExists.authType
                            }
                    });
            default:
                return NextResponse.json(
                    { success: false, message: "Invalid action" },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error("Adminfood Auth API Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error: " + error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
      success: true,
      message: "This is the adminfood-auth API. Use POST requests to interact with it.",
    });
}