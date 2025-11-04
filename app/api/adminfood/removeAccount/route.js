import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      console.log("Connected to MongoDB");
      
      let testDbResult = { deletedCount: 0 };
      let usersDbResult = { deletedCount: 0 };
      let errors = [];
      try {
        const testDb = client.db('test');
        console.log(`Attempting to delete from test/adminfoods with email: ${email}`);
        testDbResult = await testDb.collection('adminfoods').deleteOne({ email });
        console.log(`test/adminfoods delete result: ${JSON.stringify(testDbResult)}`);
      } catch (testError) {
        console.error("Error deleting from test/adminfoods:", testError);
        errors.push(`test/adminfoods: ${testError.message}`);
      }
      try {
        const usersDb = client.db('adminfood_users');
        console.log(`Attempting to delete from adminfood_users/adminfood_users with email: ${email}`);
        usersDbResult = await usersDb.collection('adminfood_users').deleteOne({ email });
        console.log(`adminfood_users/adminfood_users delete result: ${JSON.stringify(usersDbResult)}`);
      } catch (usersError) {
        console.error("Error deleting from adminfood_users/adminfood_users:", usersError);
        errors.push(`adminfood_users/adminfood_users: ${usersError.message}`);
      }
      
      const totalDeleted = testDbResult.deletedCount + usersDbResult.deletedCount;
      
      if (totalDeleted === 0) {
        console.log("No accounts found to delete");
        return NextResponse.json(
          { 
            success: false, 
            message: 'No accounts found with the provided email',
            errors: errors.length > 0 ? errors : undefined
          },
          { status: 404 }
        );
      }
      
      console.log(`Account deleted successfully (${totalDeleted} documents)`);
      return NextResponse.json({
        success: true,
        message: `Account deleted successfully (${totalDeleted} documents)`,
        testDbDeleted: testDbResult.deletedCount > 0,
        usersDbDeleted: usersDbResult.deletedCount > 0,
        errors: errors.length > 0 ? errors : undefined
      });
    } finally {
      await client.close();
      console.log("MongoDB connection closed");
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return DELETE(request);
}