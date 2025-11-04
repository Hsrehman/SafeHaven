import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const userId = request.headers.get('X-User-Id');
    const { searchParams } = new URL(request.url);
    const shelterId = searchParams.get('shelterId');

    if (!userId || !shelterId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized or missing shelterId' }, 
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('shelterDB');
    
    
    const shelter = await db.collection('shelters').findOne({ _id: new ObjectId(shelterId) });
    
    if (!shelter) {
      return NextResponse.json(
        { success: false, message: 'Shelter not found' }, 
        { status: 404 }
      );
    }

    
    const admin = await db.collection('adminUsers').findOne(
      { _id: shelter.adminId },
      { projection: { email: 1, adminName: 1, phone: 1 } }
    );

    
    const combinedData = {
      ...shelter,
      adminEmail: admin?.email,
      adminName: admin?.adminName,
      adminPhone: admin?.phone
    };

    const sanitizedShelterData = sanitizeData(combinedData);

    logger.dev('Shelter data fetched:', sanitizedShelterData);

    return NextResponse.json({
      success: true,
      data: sanitizedShelterData
    });
  } catch (error) {
    logger.error(error, 'Get Shelter API');
    return NextResponse.json({
      success: false,
      message: 'Error fetching shelter data'
    }, { status: 500 });
  }
}