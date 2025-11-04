import { NextResponse } from 'next/server';
import { Contact } from '@/lib/contact';
import { Email } from '@/lib/email';
import logger from '@/app/utils/logger';

export async function POST(request) {
  try {
    // Parse the request body
    const formData = await request.json();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'message'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Save submission to database
    const savedSubmission = await Contact.saveSubmission(formData);
    
    // Send emails
    try {
      // Send auto-reply email to the user
      await Email.sendAutoReply(formData);
      
      // Send notification email to the team
      await Email.sendTeamNotification(formData);
    } catch (emailError) {
      // Log the error but don't fail the request
      logger.error(emailError, 'Contact API - Email Sending');
      // We continue even if email sending fails, as we already saved to database
    }
    
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: savedSubmission.id
    });
    
  } catch (error) {
    logger.error(error, 'Contact API');
    
    return NextResponse.json(
      { success: false, error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}