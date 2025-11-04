import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        
       

        if (!email) {
            console.log("API - No email provided");
            return NextResponse.json({ 
                success: false, 
                message: "Email is required" 
            });
        }

        const client = await clientPromise;
        const regDb = client.db("test");
        const regData = await regDb.collection("adminfoods").findOne({ email });
        
       
        
        
        if (!regData) {
            console.log("API - Registration data not found");
            return NextResponse.json({ 
                success: false, 
                message: "Registration data not found" 
            });
        }

        const userData = {
            ...regData,
            seatingArrangement: regData.seatingArrangement || { 
                hasSeating: "", 
                seatingCapacity: null 
            },
            religionPolicy: regData.religionPolicy || { 
                allowAllReligions: "", 
                allowedReligions: [] 
            }
        };

       
        return NextResponse.json({
            success: true,
            userData: userData
        });

    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Internal server error",
            error: error.message
        });
    }
}