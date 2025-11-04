import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import logger from "@/app/utils/logger";
import { calculateShelterMatch } from "@/app/utils/shelterMatching";


export async function POST(request) {
  try {
    const userData = await request.json();
    console.log('🔍 User Form Data Received:', {
      groupType: userData.groupType,
      gender: userData.gender,
      dob: userData.dob,
      pets: userData.pets,
      shelterType: userData.shelterType,
      localConnection: userData.localConnection,
      womenOnly: userData.womenOnly
    });

    const client = await clientPromise;
    const db = client.db("shelterDB");

    if (!userData.gender) {
      return NextResponse.json({ 
        success: false, 
        message: "Gender information is required for matching"
      }, { status: 400 });
    }
    
    const allShelters = await db.collection("shelters").find({}).toArray();
    console.log(`📊 Found ${allShelters.length} total shelters in database`);
    
    const genderPolicies = allShelters.reduce((acc, shelter) => {
      acc[shelter.genderPolicy] = (acc[shelter.genderPolicy] || 0) + 1;
      return acc;
    }, {});
    console.log('Gender Policies Distribution:', genderPolicies);
    
    const matches = [];
    for (const shelter of allShelters) {
      try {
        if (!shelter.genderPolicy) {
          console.log(`⚠️ Shelter ${shelter._id} missing gender policy`);
          continue;
        }

        const match = calculateShelterMatch(userData, shelter);
        if (match) {
          console.log(`✅ Match found for shelter ${shelter._id} with gender policy ${shelter.genderPolicy}`);
          matches.push(match);
        } else {
          console.log(`❌ No match for shelter ${shelter._id} with gender policy ${shelter.genderPolicy}`);
        }
      } catch (error) {
        console.error(`🚨 Error matching shelter ${shelter._id}:`, error);
      }
    }
    
    const matchedGenderPolicies = matches.reduce((acc, match) => {
      acc[match.shelterInfo.genderPolicy] = (acc[match.shelterInfo.genderPolicy] || 0) + 1;
      return acc;
    }, {});
    console.log('Matched Shelters Gender Distribution:', matchedGenderPolicies);
    
    matches.sort((a, b) => b.percentageMatch - a.percentageMatch);
    
    return NextResponse.json({
      success: true,
      matches: matches.slice(0, 10),
      debug: {
        totalShelters: allShelters.length,
        matchedShelters: matches.length,
        genderPolicies,
        matchedGenderPolicies
      }
    });

  } catch (error) {
    console.error('🚨 Error in shelter matching:', error);
    logger.error(error, 'Shelter Matching API');
    return NextResponse.json({ 
      success: false, 
      message: "Failed to find matching shelters",
      error: error.message
    }, { status: 500 });
  }
}