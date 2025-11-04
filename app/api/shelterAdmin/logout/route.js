import { NextResponse } from "next/server";
import { TokenManager } from "@/lib/auth/tokenManager";
import logger from "@/app/utils/logger";

export async function POST(request) {
  try {
    
    const response = NextResponse.json({ 
      success: true,
      message: "Logged out successfully"
    });
    
    return TokenManager.clearAuthCookies(response);
  } catch (error) {
    logger.error(error, 'Logout API');
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}