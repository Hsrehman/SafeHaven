import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { text, rating, userId, userName } = await request.json();
    console.log('Received review data:', { text, rating, userId, userName });

    if (!text || !rating || !userId || !userName) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (text.length < 100) {
      return NextResponse.json(
        { success: false, message: 'Review must be at least 100 characters long' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    
    const review = {
      text: text.trim(),
      rating,
      userId,
      userName,
      createdAt: new Date()
    };

    await db.collection('reviews').insertOne(review);
    console.log('Review saved successfully:', review); 

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully'
    });

  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit review' },
      { status: 500 }
    );
  }
}