import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request, { params }) {
  try {
    const { pollId } = params;
    const { active } = await request.json();
    
    if (!ObjectId.isValid(pollId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection('polls').updateOne(
      { _id: new ObjectId(pollId) },
      { $set: { active } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Poll not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Poll updated successfully'
    });
  } catch (error) {
    console.error('Error updating poll:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update poll' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { pollId } = params;
    
    if (!ObjectId.isValid(pollId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection('polls').deleteOne({
      _id: new ObjectId(pollId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Poll not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting poll:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete poll' },
      { status: 500 }
    );
  }
}