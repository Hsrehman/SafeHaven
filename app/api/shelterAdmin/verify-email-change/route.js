import { NextResponse } from "next/server";
import { UserService } from "@/lib/auth/userService";
import logger from "@/app/utils/logger";

export async function POST(request) {
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { verificationCode, action } = await request.json();
    const user = await UserService.loadUserById(userId);

    
    if (action === 'cancel') {
      await UserService.updateUser(userId, {
        pendingEmailChange: null
      });
      return NextResponse.json({
        success: true,
        message: "Email change cancelled"
      });
    }


    if (!user.pendingEmailChange) {
      return NextResponse.json({ 
        success: false, 
        message: "No pending email change found" 
      }, { status: 400 });
    }

    if (user.pendingEmailChange.verificationToken !== verificationCode) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid verification code" 
      }, { status: 400 });
    }

    
    await UserService.updateUser(userId, {
      email: user.pendingEmailChange.newEmail,
      isVerified: true,
      pendingEmailChange: null
    });

    return NextResponse.json({
      success: true,
      message: "Email updated successfully"
    });
  } catch (error) {
    logger.error(error, 'Verify Email Change API');
    return NextResponse.json({
      success: false,
      message: "Failed to process email change request"
    }, { status: 500 });
  }
}
