// utils/deleteadminfood.js
import { MongoClient } from 'mongodb';

export async function deleteAdminFoodAccount(email) {
  if (!email) {
    throw new Error('Email is required');
  }

  const uri = process.env.MONGODB_URI;
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  let adminClient = null;
  let testClient = null;

  try {
    // Connect to the admin database
    adminClient = new MongoClient(uri, options);
    await adminClient.connect();
    const adminDb = adminClient.db('admin');
    const adminUsersCollection = adminDb.collection('adminfood_users');

    // Connect to the test database
    testClient = new MongoClient(uri, options);
    await testClient.connect();
    const testDb = testClient.db('test');
    const adminFoodsCollection = testDb.collection('adminfoods');

    // Delete the user from the adminfood_users collection
    const adminDeleteResult = await adminUsersCollection.deleteOne({ email });

    // Delete the user from the adminfoods collection
    const testDeleteResult = await adminFoodsCollection.deleteOne({ email });

    return {
      success: true,
      message: 'Account deleted successfully',
      adminDeleted: adminDeleteResult.deletedCount > 0,
      testDeleted: testDeleteResult.deletedCount > 0,
      anyDeleted: adminDeleteResult.deletedCount > 0 || testDeleteResult.deletedCount > 0
    };
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new Error(`Failed to delete account: ${error.message}`);
  } finally {
    // Close database connections
    if (adminClient) await adminClient.close();
    if (testClient) await testClient.close();
  }
}