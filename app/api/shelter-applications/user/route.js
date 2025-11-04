import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';

export async function GET(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email parameter is required" 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shelterDB");
    
    // Find all applications for this email
    const applications = await db.collection("applications")
      .find({ email: email.toLowerCase() })
      .sort({ submittedAt: -1 })
      .project({
        _id: 1,
        shelterId: 1,
        status: 1,
        submittedAt: 1,
        name: 1
      })
      .toArray();

    // Get shelter names for the applications
    const shelterIds = applications.map(app => app.shelterId);
    const shelters = await db.collection("shelters")
      .find({ _id: { $in: shelterIds } })
      .project({ _id: 1, name: 1 })
      .toArray();

    // Create a map of shelter IDs to names
    const shelterMap = shelters.reduce((map, shelter) => {
      map[shelter._id.toString()] = shelter.name;
      return map;
    }, {});

    // Add shelter names to applications
    const formattedApplications = applications.map(app => ({
      id: app._id.toString(),
      shelterName: shelterMap[app.shelterId.toString()] || 'Unknown Shelter',
      status: app.status,
      date: app.submittedAt.toISOString().split('T')[0]
    }));

    logger.dev('User applications fetched:', sanitizeData({ email, count: applications.length }));

    return NextResponse.json({
      success: true,
      applications: formattedApplications
    });

  } catch (error) {
    logger.error(error, 'Get User Applications API');
    return NextResponse.json({
      success: false,
      message: "Error fetching user applications"
    }, { status: 500 });
  }
} 