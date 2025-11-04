import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";
import logger from "@/app/utils/logger";


export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email required" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    const user = await db.collection("adminUsers").findOne({ email });
    
    
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: "If email exists, reset code sent" 
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); 
    
    await db.collection("adminUsers").updateOne(
      { email }, 
      { 
        $set: { 
          resetCode, 
          resetCodeExpiry 
        } 
      }
    );

    
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: { 
        user: process.env.BREVO_USER, 
        pass: process.env.BREVO_PASS 
      }
    });
    
    await transporter.sendMail({
      from: "verify.safehaven@gmail.com",
      to: email,
      subject: "Password Reset",
      html: `
        <p>Your reset code is: <strong>${resetCode}</strong>.</p>
        <p>It expires in 15 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `
    });

    return NextResponse.json({ 
      success: true, 
      message: "Reset code sent" 
    });
  } catch (error) {
    logger.error(error, 'Forgot Password API');
    return NextResponse.json({
      success: false,
      message: "Error sending reset code"
    }, { status: 500 });
  }
}