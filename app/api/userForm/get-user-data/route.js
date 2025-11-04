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
    
    // Find the most recent form submission for this email
    const userData = await db.collection("user-data")
      .findOne(
        { email: email.toLowerCase() },
        { sort: { createdAt: -1 } }
      );

    if (!userData) {
      return NextResponse.json({ 
        success: false, 
        message: "User data not found" 
      }, { status: 404 });
    }

    logger.dev('User data fetched:', sanitizeData({ email }));

    return NextResponse.json({
      success: true,
      data: userData
    });

  } catch (error) {
    logger.error(error, 'Get User Form Data API');
    return NextResponse.json({
      success: false,
      message: "Error fetching user data"
    }, { status: 500 });
  }
} 