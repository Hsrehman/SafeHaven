import { NextResponse } from "next/server";
import { TokenManager } from "@/lib/auth/tokenManager";
import { UserService } from "@/lib/auth/userService";
import logger from "@/app/utils/logger";

export async function POST(request) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json({ success: false, message: "No refresh token" }, { status: 401 });
    }

    const { valid, decoded } = TokenManager.verifyRefreshToken(refreshToken);
    if (!valid || !decoded) {
      return NextResponse.json({ success: false, message: "Invalid refresh token" }, { status: 401 });
    }

    const user = await UserService.loadUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }
    
    if (user.tokenVersion !== decoded.tokenVersion) {
      return NextResponse.json({ success: false, message: "Token version mismatch" }, { status: 401 });
    }

    const tokens = TokenManager.generateTokens(user);
    const response = NextResponse.json({ success: true });
    return TokenManager.setAuthCookies(response, tokens.accessToken, tokens.refreshToken);
  } catch (error) {
    logger.error(error, 'Refresh Token API');
    return NextResponse.json({ 
      success: false, 
      message: "Token refresh failed" 
    }, { status: 500 });
  }
}