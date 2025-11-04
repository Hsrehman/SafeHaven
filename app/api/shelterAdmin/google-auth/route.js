import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { TokenManager } from "@/lib/auth/tokenManager";
import clientPromise from "@/lib/mongodb";
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request) {
  try {
    const data = await request.json();
    logger.dev('Google auth attempt:', sanitizeData(data));

    const { access_token } = data;

    if (!access_token) {
      return NextResponse.json({ success: false, message: "Missing access token" }, { status: 400 });
    }

    
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    
    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const userInfo = await userInfoResponse.json();
    const { email, name, email_verified } = userInfo;

    if (!email_verified) {
      return NextResponse.json({ success: false, message: "Google email not verified" }, { status: 401 });
    }

    const db = (await clientPromise).db("shelterDB");
    const existingUser = await db.collection("adminUsers").findOne({ email });

    if (existingUser) {
      if (existingUser.authProvider !== 'google') {
        return NextResponse.json({ 
          success: false, 
          message: "Email already registered with a different method" 
        }, { status: 400 });
      }
      
      const { accessToken, refreshToken } = TokenManager.generateTokens(existingUser);
      const response = NextResponse.json({ success: true });
      return TokenManager.setAuthCookies(response, accessToken, refreshToken);
    }

    return NextResponse.json({ 
      success: true, 
      message: "complete_registration", 
      email,
      name,
      provider: 'google' 
    });
  } catch (error) {
    logger.error(error, 'Google Auth API');
    return NextResponse.json({ success: false, message: "Google authentication failed" }, { status: 500 });
  }
}