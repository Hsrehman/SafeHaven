import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';
import logger from '@/app/utils/logger';

export async function POST(request) {
  try {
    const { applicationId, documentTypes, message } = await request.json();
    
    if (!applicationId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    
    const [applicationData] = await db.collection("applications")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(applicationId)
          }
        },
        {
          $lookup: {
            from: "shelters",
            localField: "shelterId",
            foreignField: "_id",
            as: "shelter"
          }
        },
        {
          $unwind: "$shelter"
        }
      ]).toArray();

    if (!applicationData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Application not found' 
      }, { status: 404 });
    }

    const now = new Date();
    const documentRequest = {
      _id: new ObjectId(),
      applicationId: new ObjectId(applicationId),
      userId: applicationData.email,
      documentTypes: documentTypes || ['ID Proof'],
      message: message || 'Please upload the required documents',
      status: 'pending',
      requestedAt: now,
      updatedAt: now,
      
      shelterId: applicationData.shelterId
    };

    
    await db.collection("documentRequests").insertOne(documentRequest);

    
    await db.collection("applications").updateOne(
      { _id: new ObjectId(applicationId) },
      { 
        $push: { 
          documentRequests: documentRequest._id 
        },
        $set: { 
          updatedAt: now 
        }
      }
    );

    logger.info(`Document request created for application: ${applicationId}`);

    return NextResponse.json({ 
      success: true, 
      requestId: documentRequest._id,
      message: "Document request sent successfully"
    });

  } catch (error) {
    logger.error(error, 'Document Request - Create');
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send document request' 
    }, { status: 500 });
  }
}


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    
    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    
    const requests = await db.collection("documentRequests")
      .aggregate([
        {
          $sort: { requestedAt: -1 }
        },
        {
          
          $lookup: {
            from: "applications",
            localField: "applicationId",
            foreignField: "_id",
            as: "application"
          }
        },
        {
          $unwind: "$application"
        },
        {
          
          $lookup: {
            from: "shelters",
            localField: "application.shelterId",
            foreignField: "_id",
            as: "shelter"
          }
        },
        {
          $unwind: "$shelter"
        },
        {
          
          $project: {
            _id: 1,
            applicationId: 1,
            userId: 1,
            documentTypes: 1,
            message: 1,
            status: 1,
            requestedAt: 1,
            updatedAt: 1,
            shelterName: "$shelter.shelterName",
            shelterLogo: "$shelter.logo",
            shelterId: "$application.shelterId"
          }
        }
      ]).toArray();
    
    console.log(`Found ${requests.length} document requests in database`);
    
    return NextResponse.json({ 
      success: true, 
      requests 
    });

  } catch (error) {
    logger.error(error, 'Document Request - Get');
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch document requests' 
    }, { status: 500 });
  }
} 