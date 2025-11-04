import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const updateData = await request.json();
    
    if (!updateData.email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email is required" 
      });
    }
    
    const client = await clientPromise;
    const db = client.db("test");
    const { _id, ...dataToUpdate } = updateData;
    
    const result = await db.collection("adminfoods").updateOne(
      { email: updateData.email },
      { $set: dataToUpdate }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No changes made or document not found" 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Data updated successfully" 
    });
  } catch (error) {
    console.error("Error updating registration data:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
}