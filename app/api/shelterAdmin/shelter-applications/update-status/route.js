import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import logger from '@/app/utils/logger';
import { ObjectId } from 'mongodb';

export async function PUT(request) {
  try {
    const { applicationId, shelterId, newStatus } = await request.json();

    if (!applicationId || !shelterId || !newStatus) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    const result = await db.collection('applications').updateOne(
      { 
        _id: new ObjectId(applicationId),
        shelterId: new ObjectId(shelterId)
      },
      { 
        $set: { 
          status: newStatus,
          lastUpdated: new Date().toISOString()
        },
        $push: {
          statusHistory: {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: `Status updated to ${newStatus}`
          }
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Application not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Application status updated successfully'
    });

  } catch (error) {
    logger.error(error, 'Update Application Status');
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update application status' 
    }, { status: 500 });
  }
}
