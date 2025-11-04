import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import logger from "@/app/utils/logger";


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.json({ 
        success: false, 
        message: "Email and verification code are required" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    const user = await db.collection("adminUsers").findOne({ 
      email
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    
    if (user.verificationToken !== token) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid verification code" 
      }, { status: 400 });
    }

    
    await db.collection("adminUsers").updateOne(
      { _id: user._id }, 
      { 
        $set: { isVerified: true },
        $unset: { verificationToken: "" }
      }
    );

    
    return NextResponse.json({
      success: true,
      message: "Email verified successfully"
    });
    
  } catch (error) {
    logger.error(error, 'Email Verification API');
    return NextResponse.json({
      success: false,
      message: "Email verification failed"
    }, { status: 500 });
  }
}


export async function POST(request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ 
        success: false, 
        message: "Email and verification code are required" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    const user = await db.collection("adminUsers").findOne({ 
      email
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    
    if (user.verificationToken !== token) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid verification code" 
      }, { status: 400 });
    }

    
    await db.collection("adminUsers").updateOne(
      { _id: user._id }, 
      { 
        $set: { isVerified: true },
        $unset: { verificationToken: "" }
      }
    );

    return NextResponse.json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    logger.error(error, 'Email Verification API');
    return NextResponse.json({
      success: false,
      message: "Email verification failed"
    }, { status: 500 });
  }
}