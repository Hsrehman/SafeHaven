import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import logger from '@/app/utils/logger';

export async function POST(request) {
  try {
    const { email, resetCode, newPassword } = await request.json();
    
    if (!email || !resetCode || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    const user = await db.collection("adminUsers").findOne({ 
      email, 
      resetCode, 
      resetCodeExpiry: { $gt: new Date() } 
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid or expired reset code" 
      }, { status: 400 });
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    
    await db.collection("adminUsers").updateOne(
      { email },
      { 
        $set: { 
          password: hashedPassword, 
          tokenVersion: (user.tokenVersion || 0) + 1 
        }, 
        $unset: { 
          resetCode: "", 
          resetCodeExpiry: "" 
        } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Password reset successfully" 
    });
  } catch (error) {
    logger.error(error, 'Reset Password API');
    return NextResponse.json({
      success: false,
      message: "Error resetting password"
    }, { status: 500 });
  }
}