import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter is required' },
        { status: 400 }
      );
    }
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      const testDb = client.db('test');
      const adminFoodsUser = await testDb.collection('adminfoods').findOne({ email });
      const usersDb = client.db('adminfood_users');
      const loginUser = await usersDb.collection('adminfood_users').findOne({ email });
      
      const exists = !!adminFoodsUser || !!loginUser;
      
      return NextResponse.json({
        success: true,
        exists: exists
      });
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error checking email existence:', error);
    return NextResponse.json(
      { success: false, message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}