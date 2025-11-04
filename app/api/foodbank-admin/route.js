import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Poll from '@/app/models/Poll';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("safe-haven");
    const polls = await db.collection("polls").find({}).toArray();
    
    return NextResponse.json({
      success: true,
      polls
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("safe-haven");

    if (body.type === 'poll') {
      const newPoll = {
        question: body.question,
        options: body.options,
        results: {},
        createdAt: new Date(),
        active: true
      };
      
      const result = await db.collection("polls").insertOne(newPoll);
      return NextResponse.json({
        success: true,
        poll: { ...newPoll, _id: result.insertedId }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid request type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}   