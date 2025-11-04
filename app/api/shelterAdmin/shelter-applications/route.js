import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import logger from '@/app/utils/logger';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shelterId = searchParams.get('shelterId');
    
    console.log('API: Fetching applications for shelterId:', shelterId);

    if (!shelterId) {
      console.log('API: No shelterId provided');
      return NextResponse.json({ 
        success: false, 
        error: 'Shelter ID is required' 
      }, { status: 400 });
    }

    
    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    console.log('API: Connected to database, executing query...');
    
    
    const totalCount = await db.collection('applications').countDocuments();
    console.log('Total applications in database:', totalCount);
    
    
    console.log('Executing find query with shelterId:', shelterId);
    
    
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

    console.log('API: Found shelter:', shelter.shelterName);
    
    const applications = await db.collection('applications')
      .find({ 
        shelterId: new ObjectId(shelterId)
      })
      .sort({ submittedAt: -1 })
      .toArray();

    console.log('Found applications for shelter:', applications.length);
    
    
    if (applications.length > 0) {
      console.log('Sample application:', {
        _id: applications[0]._id,
        shelterId: applications[0].shelterId,
        status: applications[0].status,
        name: applications[0].name
      });
    } else {
      console.log('No applications found for this shelter');
    }

    const serializedApplications = applications.map(app => ({
      ...app,
      _id: app._id.toString(),
      shelterId: app.shelterId.toString()
    }));

    return NextResponse.json({ 
      success: true, 
      applications: serializedApplications,
      totalCount: applications.length
    });

  } catch (error) {
    console.error('API Error:', error);
    logger.error(error, 'Shelter Applications - GET');
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch applications' 
    }, { status: 500 });
  }
}