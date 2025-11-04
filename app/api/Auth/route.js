import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { action, email, password, fullName } = await request.json();
    const client = await clientPromise;
    const db = client.db("safe-haven");
    const users = db.collection("users");
    const admins = db.collection("admins"); // New collection for admin/charity users

    if (action === "register") {
      // Check if user already exists
      const existingUser = await users.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email already registered" },
          { status: 400 }
        );
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      await users.insertOne({
        fullName,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Registration successful",
      });
    }

    if (action === "login") {
      const user = await users.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      });
    }

    if (action === "adminLogin") {
      // Check if admin/charity exists
      const admin = await admins.findOne({ companyEmail });
      if (!admin) {
        // If admin doesn't exist, create a new admin account
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = {
          companyName,
          companyEmail,
          password: hashedPassword,
          createdAt: new Date(),
          role: 'admin',
          status: 'pending' // You might want to add an approval process
        };

        const result = await admins.insertOne(newAdmin);

        return NextResponse.json({
          success: true,
          message: "Admin account created successfully",
          admin: {
            id: result.insertedId,
            companyName,
            companyEmail,
            role: 'admin',
            status: 'pending'
          }
        });
      } else {
        // If admin exists, verify password
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
          return NextResponse.json(
            { success: false, message: "Invalid credentials" },
            { status: 401 }
          );
        }

        return NextResponse.json({
          success: true,
          admin: {
            id: admin._id,
            companyName: admin.companyName,
            companyEmail: admin.companyEmail,
            role: admin.role,
            status: admin.status
          }
        });
      }
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}