import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';
import { GridFSBucket } from 'mongodb';
import logger from '@/app/utils/logger';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const applicationId = formData.get('applicationId');
    const requestId = formData.get('requestId');
    const userEmail = formData.get('userEmail');
    const files = formData.getAll('files');
    const documentTypes = formData.getAll('documentTypes');

    if (!applicationId || !files || files.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    
    const bucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });

    
    const application = await db.collection("applications").findOne({ 
      _id: new ObjectId(applicationId) 
    });

    if (!application) {
      return NextResponse.json({ 
        success: false, 
        error: 'Application not found' 
      }, { status: 404 });
    }

    const now = new Date();
    
    
    const fileIds = await Promise.all(files.map(async (file, index) => {
      const fileName = file.name;
      const fileType = file.type;
      const fileSize = file.size;
      const documentType = documentTypes[index];
      
      
      const buffer = await file.arrayBuffer();
      
      
      const uploadStream = bucket.openUploadStream(fileName, {
        metadata: {
          applicationId: applicationId,
          contentType: fileType,
          uploadedBy: userEmail,
          documentType: documentType,
          uploadedAt: now,
          fileSize: fileSize
        }
      });
      
      
      const fileId = uploadStream.id;
      uploadStream.write(Buffer.from(buffer));
      uploadStream.end();
      
      return fileId;
    }));

    
    await db.collection("applications").updateOne(
      { _id: new ObjectId(applicationId) },
      { 
        $push: { 
          documentIds: { $each: fileIds } 
        },
        $set: { 
          updatedAt: now 
        }
      }
    );

    
    if (requestId) {
      await db.collection("documentRequests").updateOne(
        { _id: new ObjectId(requestId) },
        { 
          $set: { 
            status: 'completed',
            completedAt: now
          }
        }
      );
    }

    logger.info(`Documents uploaded for application: ${applicationId}`, {
      applicationId,
      documentCount: files.length
    });

    return NextResponse.json({ 
      success: true, 
      fileIds,
      message: "Documents uploaded successfully"
    });

  } catch (error) {
    logger.error(error, 'Document Upload');
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload documents' 
    }, { status: 500 });
  }
}


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const metadata = searchParams.get('metadata') === 'true';
    const fileIds = searchParams.get('fileIds')?.split(',');

    const client = await clientPromise;
    const db = client.db("shelterDB");
    const bucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });

    
    if (fileIds) {
      const objectIds = fileIds.map(id => new ObjectId(id));
      const files = await bucket.find({ _id: { $in: objectIds } }).toArray();
      
      return NextResponse.json({
        success: true,
        files: files.map(file => ({
          _id: file._id.toString(),
          filename: file.filename,
          metadata: file.metadata
        }))
      });
    }

    
    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    const _id = new ObjectId(fileId);

    if (metadata) {
      const file = await bucket.find({ _id }).next();
      if (!file) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, file });
    }

    
    const file = await bucket.find({ _id }).next();
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const downloadStream = bucket.openDownloadStream(_id);
    const chunks = [];
    
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.metadata?.contentType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${file.filename}"`,
      },
    });

  } catch (error) {
    logger.error(error, 'Document Upload - GET');
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
  }
} 