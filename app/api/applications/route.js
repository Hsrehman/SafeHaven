import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import logger from '@/app/utils/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");

    
    const totalCount = await db.collection("applications").countDocuments();
    console.log('Total applications in database:', totalCount);

    
    const applications = await db.collection("applications")
      .find({ 
        $or: [
          { email: email },
          { "userData.email": email }
        ]
      })
      .sort({ submittedAt: -1 })
      .toArray();

    console.log(`Found ${applications.length} applications for email: ${email}`);
    
    
    const applicationsWithShelters = await Promise.all(applications.map(async (app) => {
      const shelter = await db.collection("shelters").findOne({ _id: app.shelterId });
      return {
        _id: app._id,
        shelterId: app.shelterId,
        name: app.name || app.userData?.fullName,
        email: app.email || app.userData?.email,
        phone: app.phone || app.userData?.phone,
        type: app.type,
        urgency: app.urgency,
        status: app.status,
        statusHistory: app.statusHistory,
        submittedAt: app.submittedAt,
        lastUpdated: app.lastUpdated,
        notes: app.notes,
        gender: app.gender || app.userData?.gender,
        dob: app.dob || app.userData?.dob,
        language: app.language || app.userData?.language,
        location: app.location || app.userData?.location,
        sleepingRough: app.sleepingRough || app.userData?.sleepingRough,
        homelessDuration: app.homelessDuration || app.userData?.homelessDuration,
        groupType: app.groupType || app.userData?.groupType,
        groupSize: app.groupSize || app.userData?.groupSize,
        childrenCount: app.childrenCount || app.userData?.childrenCount,
        previousAccommodation: app.previousAccommodation || app.userData?.previousAccommodation,
        reasonForLeaving: app.reasonForLeaving || app.userData?.reasonForLeaving,
        shelterType: app.shelterType || app.userData?.shelterType,
        securityNeeded: app.securityNeeded || app.userData?.securityNeeded,
        curfew: app.curfew || app.userData?.curfew,
        communalLiving: app.communalLiving || app.userData?.communalLiving,
        smoking: app.smoking || app.userData?.smoking,
        foodAssistance: app.foodAssistance || app.userData?.foodAssistance,
        benefitsHelp: app.benefitsHelp || app.userData?.benefitsHelp,
        mentalHealth: app.mentalHealth || app.userData?.mentalHealth,
        substanceUse: app.substanceUse || app.userData?.substanceUse,
        socialServices: app.socialServices || app.userData?.socialServices,
        domesticAbuse: app.domesticAbuse || app.userData?.domesticAbuse,
        medicalConditions: app.medicalConditions || app.userData?.medicalConditions,
        wheelchair: app.wheelchair || app.userData?.wheelchair,
        immigrationStatus: app.immigrationStatus || app.userData?.immigrationStatus,
        benefits: app.benefits || app.userData?.benefits,
        localConnection: app.localConnection || app.userData?.localConnection,
        careLeaver: app.careLeaver || app.userData?.careLeaver,
        veteran: app.veteran || app.userData?.veteran,
        pets: app.pets || app.userData?.pets,
        petDetails: app.petDetails || app.userData?.petDetails,
        womenOnly: app.womenOnly || app.userData?.womenOnly,
        lgbtqFriendly: app.lgbtqFriendly || app.userData?.lgbtqFriendly,
        supportWorkers: app.supportWorkers || app.userData?.supportWorkers,
        supportWorkerDetails: app.supportWorkerDetails || app.userData?.supportWorkerDetails,
        terms: app.terms || app.userData?.terms,
        dataConsent: app.dataConsent || app.userData?.dataConsent,
        contactConsent: app.contactConsent || app.userData?.contactConsent,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        shelterName: shelter?.shelterName || 'Unknown Shelter'
      };
    }));

    if (applicationsWithShelters.length > 0) {
      console.log('Sample application:', {
        _id: applicationsWithShelters[0]._id,
        email: applicationsWithShelters[0].email,
        status: applicationsWithShelters[0].status,
        name: applicationsWithShelters[0].name
      });
    }

    return NextResponse.json({ 
      success: true,
      applications: applicationsWithShelters.map(app => ({
        ...app,
        _id: app._id.toString(),
        shelterId: app.shelterId.toString()
      }))
    });

  } catch (error) {
    console.error('Failed to fetch applications:', error);
    logger.error(error, 'Applications - GET');
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
} 