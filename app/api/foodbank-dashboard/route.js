import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

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
    const { question, options } = await request.json();
    const db = await connectToDatabase();

    if (!db) {
      throw new Error('Database connection failed');
    }

    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Question and at least 2 options are required' },
        { status: 400 }
      );
    }

    const newPoll = {
      question: question.trim(),
      options: options.map(option => ({
        text: option.trim(),
        votes: 0
      })),
      active: true,
      createdAt: new Date()
    };

    const result = await db.collection('polls').insertOne(newPoll);

    return NextResponse.json({
      success: true,
      message: 'Poll created successfully',
      pollId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create poll' },
      { status: 500 }
    );
  }
}