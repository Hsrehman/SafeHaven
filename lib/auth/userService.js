import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import logger from "@/app/utils/logger";

export class UserService {
  static async loadUserByEmail(email) {
    const client = await clientPromise;
    const db = client.db("shelterDB");
    return await db.collection("adminUsers").findOne({ email });
  }

  static async loadUserById(userId) {
    try {
      const client = await clientPromise;
      const db = client.db("shelterDB");
      
      const user = await db.collection("adminUsers").findOne(
        { _id: new ObjectId(userId) }
      );

      if (!user) {
        logger.error(`User not found: ${userId}`);
        return null;
      }

      return user;
    } catch (error) {
      logger.error(error, 'UserService - loadUserById');
      throw error;
    }
  }

  static async updateUser(userId, updateData) {
    try {
      const client = await clientPromise;
      const db = client.db("shelterDB");
      
      const result = await db.collection("adminUsers").findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) return null;

      const updatedUser = {
        id: result._id.toString(),
        adminName: result.adminName,
        email: result.email,
        phone: result.phone || null,
        role: result.role || 'admin',
        shelterId: result.shelterId.toString(),
        isVerified: result.isVerified,
        createdAt: result.createdAt,
        authProvider: result.authProvider
      };

      return updatedUser;
    } catch (error) {
      logger.error(error, 'UserService - updateUser');
      throw error;
    }
  }

  static async storePendingEmailChange(userId, changeData) {
    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    await db.collection("adminUsers").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { pendingEmailChange: changeData } }
    );
  }

  static get clientPromise() {
    return clientPromise;
  }
}