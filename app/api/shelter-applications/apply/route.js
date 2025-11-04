import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import logger from '@/app/utils/logger';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { shelterId, formId, userData } = await request.json();
    
    console.log('API: Received application submission for shelterId:', shelterId);
    
    if (!shelterId || !userData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    console.log('API: Connected to database, verifying shelter...');
    
    
    const shelter = await db.collection("shelters").findOne({ 
      _id: new ObjectId(shelterId) 
    });

    if (!shelter) {
      console.log('API: Shelter not found for ID:', shelterId);
      return NextResponse.json({ 
        success: false, 
        error: 'Shelter not found' 
      }, { status: 404 });
    }

    console.log('API: Shelter found, creating application...');
    const now = new Date();
    const application = {
      _id: new ObjectId(),
      shelterId: new ObjectId(shelterId),
      formId,
      
      
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        timestamp: now,
        note: 'Initial application submission'
      }],
      urgency: determineUrgency(userData),
      submittedAt: now,
      lastUpdated: now,
      
      
      name: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      type: determineApplicationType(userData),
      gender: userData.gender,
      dob: userData.dob,
      language: userData.language,
      notes: userData.additionalInfo,
      
      
      location: userData.location,
      
      
      sleepingRough: userData.sleepingRough,
      homelessDuration: userData.homelessDuration,
      groupType: userData.groupType,
      groupSize: parseInt(userData.groupSize) || 0,
      childrenCount: parseInt(userData.childrenCount) || 0,
      previousAccommodation: userData.previousAccommodation,
      reasonForLeaving: userData.reasonForLeaving,
      shelterType: userData.shelterType,
      
      
      securityNeeded: userData.securityNeeded,
      curfew: userData.curfew,
      communalLiving: userData.communalLiving,
      smoking: userData.smoking,
      
      
      foodAssistance: userData.foodAssistance,
      benefitsHelp: userData.benefitsHelp,
      mentalHealth: userData.mentalHealth,
      substanceUse: userData.substanceUse,
      socialServices: userData.socialServices,
      domesticAbuse: userData.domesticAbuse,
      
      
      medicalConditions: userData.medicalConditions,
      wheelchair: userData.wheelchair,
      
      
      immigrationStatus: userData.immigrationStatus,
      benefits: userData.benefits,
      localConnection: userData.localConnection,
      
      
      careLeaver: userData.careLeaver,
      veteran: userData.veteran,
      pets: userData.pets,
      petDetails: userData.petDetails,
      womenOnly: userData.womenOnly,
      lgbtqFriendly: userData.lgbtqFriendly,
      supportWorkers: userData.supportWorkers,
      supportWorkerDetails: userData.supportWorkerDetails,
      
      
      terms: userData.terms,
      dataConsent: userData.dataConsent,
      contactConsent: userData.contactConsent,
      
      
      createdAt: now,
      updatedAt: now,
      matchScore: null, 
      notes: [], 
      documents: [], 
    };

    const result = await db.collection("applications").insertOne(application);

    console.log('API: Application created with ID:', result.insertedId);
    logger.info(`Application created with ID: ${result.insertedId}`, {
      applicationId: result.insertedId,
      shelterId: shelterId,
      applicationType: application.type,
      urgency: application.urgency
    });

    return NextResponse.json({ 
      success: true, 
      applicationId: result.insertedId,
      message: "Application submitted successfully"
    });

  } catch (error) {
    console.error('API Error:', error);
    logger.error(error, 'Shelter Application - Apply');
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to submit application' 
    }, { status: 500 });
  }
}

function determineUrgency(userData) {
  if (userData.sleepingRough === 'Yes' || 
      userData.domesticAbuse === 'Yes') {
    return 'URGENT';
  }
  
  if (userData.homelessDuration === 'Less than 1 week' || 
      parseInt(userData.childrenCount) > 0 ||
      userData.medicalConditions === 'Yes') {
    return 'HIGH';
  }
  
  if (userData.homelessDuration === '1-4 weeks' || 
      userData.mentalHealth === 'Yes' ||
      userData.substanceUse === 'Yes') {
    return 'MEDIUM';
  }
  
  return 'LOW';
}

function determineApplicationType(userData) {
  if (userData.groupType === 'Myself and my family' || parseInt(userData.childrenCount) > 0) {
    return 'Family';
  }
  if (userData.groupType === 'Myself and my partner') {
    return 'Couple';
  }
  return 'Single Adult';
}
