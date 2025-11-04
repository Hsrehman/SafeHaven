import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    if (!db) {
      throw new Error('Database connection failed');
    }

    const reviews = await db
      .collection('reviews')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      reviews: reviews || [] 
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: `Failed to fetch reviews: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { text, rating, userId, userName } = await request.json();
    const db = await connectToDatabase();

    if (!text || !rating || !userId || !userName) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const review = {
      text: text.trim(),
      rating: Number(rating),
      userId,
      userName,
      createdAt: new Date()
    };

    const result = await db.collection('reviews').insertOne(review);

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      reviewId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create review' },
      { status: 500 }
    );
  }
}