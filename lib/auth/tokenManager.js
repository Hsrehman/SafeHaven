import jwt from 'jsonwebtoken';
import logger from "@/app/utils/logger";

export class TokenManager {
  
  static #getPrivateKey() {
    if (!process.env.PRIVATE_KEY) {
      throw new Error('RSA private key not found in environment variables');
    }
    return process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  static #getPublicKey() {
    if (!process.env.PUBLIC_KEY) {
      throw new Error('RSA public key not found in environment variables');
    }
    return process.env.PUBLIC_KEY.replace(/\\n/g, '\n');
  }

  
  static #getTokenExpiry() {
    return parseInt(process.env.TOKEN_EXPIRY) || 900; 
  }

  static #getRefreshTokenExpiry() {
    return parseInt(process.env.REFRESH_TOKEN_EXPIRY) || 604800; 
  }

  static #getOtpExpiry() {
    return parseInt(process.env.OTP_EXPIRY) || 900; 
  }

    static #signToken(payload, expiresIn) {
    try {
      const privateKey = this.#getPrivateKey();
      return jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn
      });
    } catch (error) {
      logger.error(error, 'Token Signing');
      throw new Error(`Failed to sign token: ${error.message}`);
    }
  }

    static verifyToken(token) {
    if (!token) {
      return { valid: false, decoded: null, error: 'No token provided' };
    }

    try {
      const publicKey = this.#getPublicKey();
      const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
      return { valid: true, decoded, error: null };
    } catch (error) {
      let errorMessage = 'Invalid token';
      if (error.name === 'TokenExpiredError') {
        errorMessage = 'Token has expired';
      } else if (error.name === 'JsonWebTokenError') {
        errorMessage = `JWT error: ${error.message}`;
      }
      
      logger.error(new Error(errorMessage), 'Token Verification');
      return { valid: false, decoded: null, error: errorMessage };
    }
  }

    static verifyAccessToken(token) {
    const result = this.verifyToken(token);
    if (result.valid && result.decoded.tokenType !== 'access') {
      return { valid: false, decoded: null, error: 'Not an access token' };
    }
    return result;
  }

    static verifyRefreshToken(token) {
    const result = this.verifyToken(token);
    if (result.valid && result.decoded.tokenType !== 'refresh') {
      return { valid: false, decoded: null, error: 'Not a refresh token' };
    }
    return result;
  }

    static generateOTPToken(user, otp) {
    if (!user || !user._id) {
      throw new Error('Invalid user object for OTP token generation');
    }
    
    const expiresIn = this.#getOtpExpiry();
    
    return this.#signToken({
      userId: user._id.toString(),
      email: user.email,
      otp,
      tokenType: 'otp'
    }, expiresIn);
  }

    static generateTokens(user) {
    if (!user || !user._id) {
      throw new Error('Invalid user object for token generation');
    }

    const accessExpiresIn = this.#getTokenExpiry();
    const refreshExpiresIn = this.#getRefreshTokenExpiry();
    
    
    const accessToken = this.#signToken({
      userId: user._id.toString(),
      email: user.email,
      adminName: user.adminName || '',
      shelterId: user.shelterId?.toString() || '',
      isVerified: user.isVerified || false,
      role: user.role || 'admin',
      authProvider: user.authProvider || 'email',
      tokenType: 'access'
    }, accessExpiresIn);
    
    
    const refreshToken = this.#signToken({
      userId: user._id.toString(),
      tokenVersion: user.tokenVersion || 0,
      tokenType: 'refresh'
    }, refreshExpiresIn);
    
    return { accessToken, refreshToken };
  }
  
    static setAuthCookies(response, accessToken, refreshToken) {
    const tokenExpiry = this.#getTokenExpiry();
    const refreshTokenExpiry = this.#getRefreshTokenExpiry();
    
    
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenExpiry
    });
    
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: refreshTokenExpiry
    });
    
    return response;
  }

    static clearAuthCookies(response) {
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });
    
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });
    
    return response;
  }

    static getTokensFromCookies(req) {
    const accessToken = req.cookies.get('accessToken')?.value || null;
    const refreshToken = req.cookies.get('refreshToken')?.value || null;
    
    return { accessToken, refreshToken };
  }

    static generateOTP() {
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.#getOtpExpiry());
    
    return {
      code: otp,
      expiresAt
    };
  }

    static validateOTP(otpData, submittedOTP) {
    if (!otpData || !otpData.code || !otpData.expiresAt) {
      return false;
    }
    
    
    const now = new Date();
    const expiryDate = new Date(otpData.expiresAt);
    
    if (now > expiryDate) {
      return false;
    }
    
    
    return otpData.code === submittedOTP;
  }

    static generateEmailVerificationToken(userId, email) {
    
    const verificationToken = this.#signToken({
      userId: userId.toString(),
      email,
      purpose: 'email_verification',
      tokenType: 'verification'
    }, 86400); 
    
    return verificationToken;
  }

    static verifyEmailVerificationToken(token) {
    const result = this.verifyToken(token);
    if (result.valid && result.decoded.purpose !== 'email_verification') {
      return { valid: false, decoded: null, error: 'Invalid token purpose' };
    }
    return result;
  }

    static generatePasswordResetToken(userId, email) {
    
    const resetToken = this.#signToken({
      userId: userId.toString(),
      email,
      purpose: 'password_reset',
      tokenType: 'reset'
    }, 3600); 
    
    return resetToken;
  }

    static generateResetCode() {
    
    let code = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
  
    static getUserIdFromRequest(req) {
    const { accessToken } = this.getTokensFromCookies(req);
    if (!accessToken) {
      return null;
    }
    
    const { valid, decoded } = this.verifyToken(accessToken);
    if (!valid || !decoded) {
      return null;
    }
    
    return decoded.userId;
  }
  
    static isSessionValid(req) {
    const { accessToken } = this.getTokensFromCookies(req);
    if (!accessToken) {
      return false;
    }
    
    const { valid } = this.verifyToken(accessToken);
    return valid;
  }
  
    static getUserDataFromToken(token) {
    const { valid, decoded } = this.verifyAccessToken(token);
    if (!valid || !decoded) {
      return null;
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      adminName: decoded.adminName,
      shelterId: decoded.shelterId,
      isVerified: decoded.isVerified,
      role: decoded.role,
      authProvider: decoded.authProvider
    };
  }
}