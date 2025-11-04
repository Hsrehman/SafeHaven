import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

export async function POST(request) {
  let client;
  
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!uri) {
      console.error('MONGODB_URI is not defined in environment variables');
      return NextResponse.json(
        { success: false, message: 'Database configuration error' },
        { status: 500 }
      );
    }

    client = new MongoClient(uri, options);
    await client.connect();
    const db = client.db('adminfood_users');
    const collection = db.collection('adminfood_users');
    const existingUser = await collection.findOne({ email: email.toLowerCase() });

    return NextResponse.json({
      success: true,
      exists: !!existingUser
    });
    
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  } finally {
    
    if (client) {
      await client.close();
    }
  }
}