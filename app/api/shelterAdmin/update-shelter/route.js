import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';
import { ObjectId } from 'mongodb';

export async function PUT(request) {
  try {
    const userId = request.headers.get('X-User-Id');
    const updateData = await request.json();
    const { shelterId, ...shelterFields } = updateData;

    if (!userId || !shelterId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized or missing shelterId' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('shelterDB');

    const sanitizedData = sanitizeData(shelterFields);

    const result = await db.collection('shelters').updateOne(
      { _id: new ObjectId(shelterId) },
      { $set: sanitizedData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Shelter not found' },
        { status: 404 }
      );
    }

    logger.dev('Shelter updated:', sanitizedData);

    return NextResponse.json({
      success: true,
      message: 'Shelter settings updated successfully'
    });
  } catch (error) {
    logger.error(error, 'Update Shelter API');
    return NextResponse.json({
      success: false,
      message: 'Error updating shelter settings'
    }, { status: 500 });
  }
}