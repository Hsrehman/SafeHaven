import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';

export async function PUT(request) {
  try {
    const { email, section, data } = await request.json();
    
    if (!email || !section || !data) {
      return NextResponse.json({ 
        success: false, 
        message: "Email, section, and data are required" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("form-submission");
    
    // Prepare update object based on section
    let updateData = {};
    
    if (section === 'profile') {
      updateData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        gender: data.gender,
        language: data.language,
        name: data.name,
        occupation: data.occupation,
        bio: data.bio
      };
    } else if (section === 'details') {
      updateData = {
        sleepingRough: data.sleepingRough,
        homelessDuration: data.homelessDuration,
        groupType: data.groupType,
        groupSize: data.groupSize,
        childrenCount: data.childrenCount,
        previousAccommodation: data.previousAccommodation,
        reasonForLeaving: data.reasonForLeaving,
        shelterType: data.shelterType,
        securityNeeded: data.securityNeeded,
        communalLiving: data.communalLiving,
        smoking: data.smoking,
        womenOnly: data.womenOnly,
        lgbtqFriendly: data.lgbtqFriendly,
        pets: data.pets,
        petDetails: data.petDetails
      };
    }
    
    // Update the document
    const result = await db.collection("user-data").updateOne(
      { email: email.toLowerCase() },
      { 
        $set: {
          ...updateData,
          lastUpdated: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    logger.dev('User data updated:', sanitizeData({ email, section }));

    return NextResponse.json({
      success: true,
      message: "Data updated successfully"
    });

  } catch (error) {
    logger.error(error, 'Update User Data API');
    return NextResponse.json({
      success: false,
      message: "Error updating user data"
    }, { status: 500 });
  }
} 