import { NextResponse } from 'next/server';
import * as jose from 'jose';
import logger from '@/app/utils/logger';


function debugLog(...args) {
  logger.dev('Middleware:', ...args);
}


async function verifyToken(token) {
  if (!token) {
    return { valid: false, decoded: null };
  }

  try {
    
    const publicKeyPem = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');
    
    
    const publicKey = await jose.importSPKI(publicKeyPem, 'RS256');
    
    
    const { payload } = await jose.jwtVerify(token, publicKey);
    
    return { valid: true, decoded: payload };
  } catch (error) {
    logger.error(error, 'Middleware - Token Verification');
    return { valid: false, decoded: null };
  }
}

export async function middleware(request) {
  
  debugLog('Path:', request.nextUrl.pathname);
  
  
  const protectedPaths = [
    '/shelterPortal/dashboard',
    '/api/shelterAdmin/dashboard',
    '/shelterPortal/change-password',
    '/api/shelterAdmin/change-password',
    '/api/shelterAdmin/update-profile',
    '/api/shelterAdmin/verify-email-change'
  ];
  
  
  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + '/')
  );
  
  if (!isProtected) {
    debugLog('Not protected, skipping');
    return NextResponse.next();
  }
  
  debugLog('Protected path, checking auth');
  
  
  const accessToken = request.cookies.get('accessToken')?.value;
  
  if (!accessToken) {
    debugLog('No access token found');
    return redirectToLogin(request);
  }
  
  try {
    
    const { valid, decoded } = await verifyToken(accessToken);
    
    if (!valid || !decoded) {
      debugLog('Token invalid');
      return redirectToLogin(request);
    }
    
    debugLog('Token decoded:', decoded.userId);
    
    
    const response = NextResponse.next();
    
    
    response.headers.set('X-User-Id', decoded.userId || '');
    response.headers.set('X-Shelter-Id', decoded.shelterId || '');
    response.headers.set('X-User-Role', decoded.role || 'admin');
    response.headers.set('X-Is-Verified', String(decoded.isVerified || false));
    response.headers.set('X-Admin-Name', decoded.adminName || '');
    
    debugLog('Headers set from token data');
    
    return response;
  } catch (error) {
    debugLog('Verification failed:', error.message);
    return redirectToLogin(request);
  }
}

function redirectToLogin(request) {
  
  if (request.nextUrl.pathname.startsWith('/api/')) {
    debugLog('API route unauthorized, returning 401');
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  
  debugLog('Redirecting to login');
  const loginUrl = new URL('/shelterPortal/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/shelterPortal/dashboard',
    '/api/shelterAdmin/dashboard',
    '/shelterPortal/dashboard/:path*',
    '/api/shelterAdmin/dashboard/:path*',
    '/shelterPortal/change-password',
    '/api/shelterAdmin/change-password',
    '/api/shelterAdmin/update-profile',
    '/api/shelterAdmin/verify-email-change'
  ]
};