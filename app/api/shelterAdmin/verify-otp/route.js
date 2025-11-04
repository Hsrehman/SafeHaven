import { NextResponse } from 'next/server';
import { TokenManager } from '@/lib/auth/tokenManager';
import clientPromise from '@/lib/mongodb';
import logger from "@/app/utils/logger";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    
    if (!email || !otp) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email and OTP are required' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    
    const user = await db.collection("adminUsers").findOne({ email });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }
    
    
    if (user.otp !== otp) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid OTP' 
      }, { status: 400 });
    }
    
    
    if (user.otpExpiry && new Date(user.otpExpiry) < new Date()) {
      return NextResponse.json({ 
        success: false, 
        message: 'OTP has expired' 
      }, { status: 400 });
    }
    
    
    await db.collection("adminUsers").updateOne(
      { _id: user._id },
      { $unset: { otp: "", otpExpiry: "" } }
    );
    
    
    const { accessToken, refreshToken } = TokenManager.generateTokens(user);
    
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });
    
    
    return TokenManager.setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    logger.error(error, 'OTP Verification API');
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 });
  }
}