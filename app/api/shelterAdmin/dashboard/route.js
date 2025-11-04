import { NextResponse } from 'next/server';
import { UserService } from "@/lib/auth/userService";
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';

export async function GET(request) {
  try {
    logger.dev('Dashboard API Request');
    
    
    const userId = request.headers.get('X-User-Id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    
    const userData = await UserService.loadUserById(userId);
    
    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'User not found' }, 
        { status: 404 }
      );
    }

    
    const sanitizedUserData = {
      id: userData._id.toString(),
      adminName: userData.adminName,
      email: userData.email,
      phone: userData.phone || null,
      role: userData.role || 'admin',
      shelterId: userData.shelterId.toString(),
      isVerified: userData.isVerified,
      createdAt: userData.createdAt,
      authProvider: userData.authProvider,
      twoFactorEnabled: userData.twoFactorEnabled || false
    };

    logger.dev('Dashboard data:', sanitizeData(sanitizedUserData));
    
    return NextResponse.json({
      success: true,
      data: {
        message: `Welcome to your dashboard, ${sanitizedUserData.adminName}!`,
        user: sanitizedUserData
      }
    });
  } catch (error) {
    logger.error(error, 'Dashboard API');
    return NextResponse.json({
      success: false,
      message: "Error fetching dashboard data"
    }, { status: 500 });
  }
}