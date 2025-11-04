import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { message, sender, sessionId } = await request.json();
    
    if (!message || !sender) {
      return NextResponse.json(
        { success: false, message: "Message and sender are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("form-submission");
    
    // Insert the message into the chat_messages collection
    const result = await db.collection("chat_messages").insertOne({
      sessionId: sessionId || 'anonymous',
      message,
      sender, // 'user' or 'bot'
      timestamp: new Date()
    });
    
    return NextResponse.json({
      success: true,
      messageId: result.insertedId
    });
    
  } catch (error) {
    console.error("Error saving chat message:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}