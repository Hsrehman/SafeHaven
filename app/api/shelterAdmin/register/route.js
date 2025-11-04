import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { TokenManager } from "@/lib/auth/tokenManager";
import logger from "@/app/utils/logger";
import { sanitizeData } from "@/app/utils/sanitizer";
import { validateForm } from '@/app/utils/shelterFormValidation';
import { shelterFormQuestions } from '@/app/utils/shelterFormQuestions';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const shelterData = await request.json();
    logger.dev('Registration request:', sanitizeData(shelterData));

    const client = await clientPromise;
    const db = client.db("shelterDB");

    
    const validationQuestions = shelterData.authProvider === 'google' 
      ? shelterFormQuestions.filter(q => !['email', 'password', 'adminName'].includes(q.id))
      : shelterFormQuestions;

    
    const shouldShowField = (question, formData) => {
      const conditions = {
        customHours: () => formData.operatingHours === "Custom Hours",
        holidayHours: () => formData.openOnHolidays === "Limited hours (please specify)",
        medicalDetails: () => formData.hasMedical === "Yes",
        mentalHealthDetails: () => formData.hasMentalHealth === "Yes",
        maxFamilySize: () => formData.hasFamily === "Yes",
        nrpfDetails: () => formData.acceptNRPF === "In certain circumstances (please specify)",
        allowedReligions: () => formData.allowAllReligions === "No",
        referralDetails: () => formData.referralRoutes?.includes("Agency referrals") || 
                              formData.referralRoutes?.includes("Other (please specify)"),
        serviceCharges: () => formData.housingBenefitAccepted?.startsWith("Yes"),
      };
      return conditions[question.id] ? conditions[question.id]() : true;
    };

    const visibleQuestions = validationQuestions.filter(q => shouldShowField(q, shelterData));
    
    
    const { isValid, errors } = validateForm(shelterData, visibleQuestions);
    if (!isValid) {
      logger.error({ message: 'Validation failed', errors }, 'Registration Validation');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid data', 
        errors 
      }, { status: 400 });
    }

    
    const existingUser = await db.collection("adminUsers").findOne({ email: shelterData.email });
    if (existingUser) {
      if (shelterData.authProvider === 'google' && existingUser.authProvider !== 'google') {
        return NextResponse.json({ 
          success: false, 
          message: "Email already registered with a different method" 
        }, { status: 400 });
      }
      if (!shelterData.isGoogleUser) {
        return NextResponse.json({ 
          success: false, 
          message: "Email already exists" 
        }, { status: 400 });
      }
    }

    
    const shelterId = new ObjectId();
    const adminId = new ObjectId();

    
    const {
      email,
      adminName,
      phone,
      password,
      terms,
      infoAccuracy,
      contactConsent,
      ...shelterOnlyData
    } = shelterData;

    const adminDoc = {
      _id: adminId,
      email,
      adminName,
      phone,
      shelterId: shelterId,
      authProvider: shelterData.authProvider || 'email',
      isVerified: shelterData.isGoogleUser,
      registrationDate: new Date(),
      lastLogin: new Date()
    };

    if (!shelterData.isGoogleUser) {
      adminDoc.password = await bcrypt.hash(password, 10);
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      adminDoc.verificationToken = verificationToken;

      
      const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: { user: process.env.BREVO_USER, pass: process.env.BREVO_PASS }
      });

      await transporter.sendMail({
        from: "verify.safehaven@gmail.com",
        to: shelterData.email,
        subject: "Verify Your Shelter Account",
        html: `<p>Hello ${shelterData.adminName},</p><p>Your verification code is: <strong>${verificationToken}</strong></p>`
      });
    }
    
    const shelterDoc = {
      _id: shelterId,
      ...shelterOnlyData,
      adminId: adminId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection("shelters").insertOne(shelterDoc);
    const adminResult = await db.collection("adminUsers").insertOne(adminDoc);

    
    if (shelterData.isGoogleUser) {
      const tokenPayload = {
        _id: adminResult.insertedId,
        email: adminDoc.email,
        adminName: adminDoc.adminName,
        shelterId: adminDoc.shelterId,
        isVerified: true,
        authProvider: 'google'
      };

      logger.dev('Google registration:', sanitizeData({ tokenPayload }));

      const { accessToken, refreshToken } = TokenManager.generateTokens(tokenPayload);
      const response = NextResponse.json({ 
        success: true, 
        message: "Registration successful",
        redirect: '/shelterPortal/dashboard'
      });
      
      return TokenManager.setAuthCookies(response, accessToken, refreshToken);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Registration successful, please verify your email" 
    });

  } catch (error) {
    logger.error(error, 'Registration API');
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Registration failed",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}