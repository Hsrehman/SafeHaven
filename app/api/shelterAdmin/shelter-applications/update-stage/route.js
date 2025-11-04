import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import logger from '@/app/utils/logger';
import { ObjectId } from 'mongodb';


const APPLICATION_STAGES = {
  INITIAL: 'initial_review',
  DOCUMENTS_REQUESTED: 'documents_requested',
  DOCUMENTS_RECEIVED: 'documents_received',
  FINAL_REVIEW: 'final_review',
  COMPLETED: 'completed'
};

export async function PUT(request) {
  try {
    const { applicationId, shelterId, stage } = await request.json();

    
    if (!applicationId || !shelterId || !stage) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    
    if (!Object.values(APPLICATION_STAGES).includes(stage)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid application stage' 
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
          stage: stage,
          lastUpdated: new Date().toISOString()
        },
        $push: {
          stageHistory: {
            stage: stage,
            timestamp: new Date().toISOString(),
            note: `Stage updated to ${stage}`
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
      message: 'Application stage updated successfully',
      stage: stage
    });

  } catch (error) {
    logger.error(error, 'Update Application Stage');
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update application stage' 
    }, { status: 500 });
  }
}


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const shelterId = searchParams.get('shelterId');

    if (!applicationId || !shelterId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing applicationId or shelterId' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    const application = await db.collection('applications').findOne(
      { 
        _id: new ObjectId(applicationId),
        shelterId: new ObjectId(shelterId)
      },
      { projection: { stage: 1, stageHistory: 1 } }
    );

    if (!application) {
      return NextResponse.json({ 
        success: false, 
        error: 'Application not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      currentStage: application.stage,
      stageHistory: application.stageHistory || []
    });

  } catch (error) {
    logger.error(error, 'Get Application Stage');
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve application stage' 
    }, { status: 500 });
  }
} 