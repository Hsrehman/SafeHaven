// app/api/foodbank-admin/polls/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const polls = await db
      .collection('polls')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, polls });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch polls' },
      { status: 500 }
    );
  }
}