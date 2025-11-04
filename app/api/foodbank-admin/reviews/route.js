import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const db = await connectToDatabase();
    const { title, content, rating } = await request.json();

    if (!title || !content || !rating) {
      return NextResponse.json(
        { success: false, message: 'Title, content and rating are required' },
        { status: 400 }
      );
    }

    if (title.length < 2 || content.length < 5) {
      return NextResponse.json(
        { success: false, message: 'Title and content are too short' },
        { status: 400 }
      );
    }

    const review = {
      title,
      content,
      rating: Number(rating),
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