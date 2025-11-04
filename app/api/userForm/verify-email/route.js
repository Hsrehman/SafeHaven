import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';

export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email parameter is required" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("form-submission");
    
    // Check if user exists in database
    const userData = await db.collection("user-data")
      .findOne(
        { email: email.toLowerCase() },
        { projection: { _id: 1 } }  // Only fetch the ID for efficiency
      );

    logger.dev('Email verification attempt:', sanitizeData({ email, exists: !!userData }));

    return NextResponse.json({
      success: !!userData,
      message: userData ? "Email verified" : "Email not found"
    });

  } catch (error) {
    logger.error(error, 'Verify Email API');
    return NextResponse.json({
      success: false,
      message: "Error verifying email"
    }, { status: 500 });
  }
} 