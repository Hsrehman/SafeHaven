import { NextResponse } from "next/server";
import { UserService } from "@/lib/auth/userService";
import { TokenManager } from "@/lib/auth/tokenManager";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import logger from "@/app/utils/logger";

export async function POST(request) {
  try {
    const { email, password, googleCredential } = await request.json();
    const client = await UserService.clientPromise;
    const db = client.db("shelterDB");

    if (googleCredential) {
      const response = await fetch(`${request.headers.get('origin')}/api/shelterAdmin/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: googleCredential })
      });
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json({ success: false, message: data.message || "Google auth failed" }, { status: 401 });
      }
      return NextResponse.json(data);
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }

    const user = await UserService.loadUserByEmail(email);
    if (!user || !await bcrypt.compare(password, user.password) || !user.isVerified) {
      return NextResponse.json({ success: false, message: "Invalid credentials or unverified account" }, { status: 401 });
    }

    if (user.twoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      await db.collection("adminUsers").updateOne(
        { _id: user._id },
        { 
          $set: { 
            otp, 
            otpExpiry: new Date(Date.now() + (15 * 60 * 1000)) 
          } 
        }
      );
      
      const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: { user: process.env.BREVO_USER, pass: process.env.BREVO_PASS }
      });
      
      await transporter.sendMail({
        from: "verify.safehaven@gmail.com",
        to: email,
        subject: "Your OTP for Login",
        html: `<p>Hello ${user.adminName || ''},</p><p>Your OTP is: <strong>${otp}</strong>. It expires in 15 minutes.</p>`
      });

      const response = NextResponse.json({ success: true, message: "Enter OTP" });
      response.cookies.set("tempToken", TokenManager.generateOTPToken(user, otp), { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: "lax", 
        maxAge: 15 * 60 
      });

      return response;
    } else {
      const { accessToken, refreshToken } = TokenManager.generateTokens(user);
      const response = NextResponse.json({ success: true });
      return TokenManager.setAuthCookies(response, accessToken, refreshToken);
    }
  } catch (error) {
    logger.error(error, 'Login API');
    return NextResponse.json({ 
      success: false, 
      message: "An error occurred during login" 
    }, { status: 500 });
  }
}