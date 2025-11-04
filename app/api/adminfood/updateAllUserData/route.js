import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function POST(request) {
  let body;
  
  try {
    const text = await request.text();
    console.log("Request body text:", text);
    
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { success: false, message: `Invalid JSON in request body: ${parseError.message}` },
        { status: 400 }
      );
    }
    
    const { oldEmail, newData, emailChanged } = body;

    if (!oldEmail || !newData) {
      return NextResponse.json(
        { success: false, message: 'Old email and new data are required' },
        { status: 400 }
      );
    }
    if (emailChanged) {
      if (!validateEmail(newData.email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    console.log("Updating user data:");
    console.log("Old email:", oldEmail);
    console.log("Email changed:", emailChanged);
    console.log("New email:", newData.email);
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      console.log("Connected to MongoDB");
      if (emailChanged) {
        const testDb = client.db('test');
        const existingFoodBank = await testDb.collection('adminfoods').findOne({ 
          email: newData.email
        });
        const usersDb = client.db('adminfood_users');
        const existingUser = await usersDb.collection('adminfood_users').findOne({ 
          email: newData.email 
        });
        
        if (existingFoodBank || existingUser) {
          return NextResponse.json(
            { success: false, message: 'This email is already in use by another account' },
            { status: 409 }
          );
        }
      }
      const updateData = { ...newData };
      delete updateData._id; 
      const testDb = client.db('test');
      const adminFoodsResult = await testDb.collection('adminfoods').updateOne(
        { email: oldEmail },
        { $set: updateData }
      );
      
      console.log(`adminfoods update result: ${JSON.stringify(adminFoodsResult)}`);
      
      if (adminFoodsResult.matchedCount === 0) {
        return NextResponse.json(
          { success: false, message: 'No food bank found with the provided email' },
          { status: 404 }
        );
      }
      let loginUpdateResult = { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
      
      if (emailChanged) {
        try {
          const usersDb = client.db('adminfood_users');
          loginUpdateResult = await usersDb.collection('adminfood_users').updateOne(
            { email: oldEmail },
            { $set: { email: newData.email } }
          );
          
          console.log(`adminfood_users update result: ${JSON.stringify(loginUpdateResult)}`);
        } catch (loginError) {
          console.error("Error updating login database:", loginError);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'User data updated successfully',
        adminFoodsUpdated: adminFoodsResult.modifiedCount > 0,
        loginUpdated: loginUpdateResult.modifiedCount > 0,
        emailChanged: emailChanged
      });
    } finally {
      await client.close();
      console.log("MongoDB connection closed");
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { success: false, message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}