import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';

export async function POST(request) {
  try {
    const { email } = await request.json();
    logger.dev('Checking email availability:', sanitizeData({ email }));

    if (!email?.trim()) {
      return NextResponse.json({ 
        success: false,
        available: false, 
        message: "Email required" 
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    const exists = await db.collection("adminUsers").findOne({ email: normalizedEmail });
    
    return NextResponse.json({ 
      success: true,
      available: !exists,
      message: exists ? "Email is already registered" : "Email is available" 
    });
  } catch (error) {
    logger.error(error, 'Check Email API');
    return NextResponse.json({
      success: false,
      available: false,
      message: "Error checking email availability"
    }, { status: 500 });
  }
}