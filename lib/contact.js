import clientPromise from "./mongodb";
import logger from "@/app/utils/logger";

export class Contact {
  static async saveSubmission(formData) {
    try {
      const client = await clientPromise;
      const db = client.db("contactpage");
      const collection = db.collection("info");
      
      const submission = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        message: formData.message,
        reason: formData.reason || 'general',
        status: 'new',
        createdAt: new Date()
      };
      
      const result = await collection.insertOne(submission);
      
      logger.dev(`Contact form saved to contactpage.info with ID: ${result.insertedId}`);
      
      return {
        success: true,
        id: result.insertedId,
        submission
      };
    } catch (error) {
      logger.error(error, 'Contact - saveSubmission');
      throw error;
    }
  }
}