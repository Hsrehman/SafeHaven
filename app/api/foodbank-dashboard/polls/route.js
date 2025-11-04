import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {ObjectId} from 'mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    if (!db) {
      throw new Error('Database connection failed');
    }

    const polls = await db
      .collection('polls')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      polls: polls || [] 
    });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch polls: ${error.message}` },
      { status: 500 }
    );
  }
}
export async function POST(request) {
  try {
    const { pollId, selectedOption } = await request.json();
    console.log('Received vote:', { pollId, selectedOption }); // Debug log

    const db = await connectToDatabase();
    
    if (!db) {
      throw new Error('Database connection failed');
    }

    // Find the poll and update the votes for the selected option
    const result = await db.collection('polls').updateOne(
      { 
        "_id": new ObjectId(pollId),
        "options.text": selectedOption 
      },
      { 
        $inc: { "options.$.votes": 1 }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Poll or option not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record vote' },
      { status: 500 }
    );
  }
}