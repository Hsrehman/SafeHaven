import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
 
    const polls = await db
      .collection('polls')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      polls 
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
    const body = await request.json();
    console.log('Received request body:', body); // Debug incoming data

    const { question, options } = body;
    
    // Validate request data
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Question and at least 2 options are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      throw new Error('Database connection failed');
    }

    const newPoll = {
      question,
      options: options.map(option => ({
        text: option,
        votes: 0
      })),
      active: true,
      createdAt: new Date(),
      totalVotes: 0
    };

    const result = await db.collection('polls').insertOne(newPoll);

    return NextResponse.json({
      success: true,
      message: 'Poll created successfully',
      pollId: result.insertedId,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create poll: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { pollId } = params;
    const { active } = await request.json();
    
    const db = await connectToDatabase();

    if (!ObjectId.isValid(pollId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

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
    const db = await connectToDatabase();
    
    if (!ObjectId.isValid(pollId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid poll ID format' },
        { status: 400 }
      );
    }

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