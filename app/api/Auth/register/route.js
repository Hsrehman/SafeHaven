import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { name, email, password, ...userData } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("safehaven"); // Use your actual database name
    
    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      ...userData,
      role: "user", // Default role
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Return success but don't include the password
    return NextResponse.json({
      success: true,
      user: {
        id: result.insertedId,
        name,
        email,
        role: "user",
      },
      message: "User registered successfully"
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}