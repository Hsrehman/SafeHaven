import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const { db } = await connectToDatabase();
    const user = await db.collection("adminfood_users").findOne({ email });

    if (!user) {
      return Response.json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return Response.json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const { password: _, ...userData } = user;

    return Response.json({
      success: true,
      message: "Login successful",
      userData
    });

  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ 
      success: false, 
      message: "An error occurred during login" 
    });
  }
}