import { NextResponse } from "next/server";
import { UserService } from "@/lib/auth/userService";
import nodemailer from "nodemailer";
import logger from "@/app/utils/logger";
import { sanitizeData } from "@/app/utils/sanitizer";

export async function PUT(request) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const updateData = await request.json();
    const currentUser = await UserService.loadUserById(userId);
    
    if (updateData.email && updateData.email !== currentUser.email) {
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      
      await UserService.storePendingEmailChange(userId, {
        newEmail: updateData.email,
        verificationToken,
        requestedAt: new Date()
      });

      const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: { user: process.env.BREVO_USER, pass: process.env.BREVO_PASS }
      });

      await transporter.sendMail({
        from: "verify.safehaven@gmail.com",
        to: updateData.email,
        subject: "Verify Your New Email Address",
        html: `<p>Hello ${currentUser.adminName},</p>
              <p>Your verification code to confirm your new email is: <strong>${verificationToken}</strong></p>`
      });

      delete updateData.email;
    }

    if (typeof updateData.twoFactorEnabled === 'boolean') {
      await UserService.updateUser(userId, { 
        twoFactorEnabled: updateData.twoFactorEnabled 
      });

      return NextResponse.json({
        success: true,
        message: updateData.twoFactorEnabled ? 
          'Two-factor authentication enabled successfully' : 
          'Two-factor authentication disabled successfully'
      });
    }

    const sanitizedData = sanitizeData({
      adminName: updateData.adminName,
      phone: updateData.phone
    });

    const updatedUser = await UserService.updateUser(userId, sanitizedData);
    
    return NextResponse.json({
      success: true,
      message: updateData.email ? 
        'Profile updated. Please verify your new email address.' : 
        'Profile updated successfully',
      user: updatedUser,
      emailPending: !!updateData.email
    });
  } catch (error) {
    logger.error(error, 'Update Profile API');
    return NextResponse.json({
      success: false,
      message: "Error updating profile"
    }, { status: 500 });
  }
}
