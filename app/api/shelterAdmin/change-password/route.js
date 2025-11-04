import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import logger from "@/app/utils/logger";

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    
    
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: "Not authenticated" 
      }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    
    const user = await db.collection("adminUsers").findOne({ 
      _id: new ObjectId(userId)
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    
    if (!user.password) {
      return NextResponse.json({ 
        success: false, 
        message: "Cannot change password for Google-authenticated accounts" 
      }, { status: 400 });
    }

    
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ 
        success: false, 
        message: "Current password is incorrect" 
      }, { status: 400 });
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    
    await db.collection("adminUsers").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          tokenVersion: (user.tokenVersion || 0) + 1
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    logger.error(error, 'Change Password API');
    return NextResponse.json({
      success: false,
      message: "Error changing password"
    }, { status: 500 });
  }
} 