import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import logger from '@/app/utils/logger';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const filterType = url.searchParams.get('filterType') || 'recent';
    const category = url.searchParams.get('category') || 'general-tips';
    const userId = url.searchParams.get('userId');
    
    const client = await clientPromise;
    const db = client.db("communityhelp");
    
    const query = { category };
    if (userId) query.userId = userId;
    
    const sortOptions = {
      recent: { createdAt: -1 },
      oldest: { createdAt: 1 }
    };
    
    const posts = await db.collection("posts")
      .find(query)
      .sort(sortOptions[filterType])
      .toArray();
    
    logger.dev('Posts fetched successfully');
    
    return NextResponse.json(posts);
  } catch (error) {
    logger.error(error, 'Get Posts API');
    return NextResponse.json({ 
      success: false, 
      message: "Error fetching posts" 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.title || !data.content || !data.userId) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields: title, content, and userId are required"
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("communityhelp");
    
    const postData = {
      id: Date.now(),
      title: data.title.trim(),
      content: data.content.trim(),
      author: data.isAnonymous ? 'Anonymous' : `${data.firstName} ${data.lastName.charAt(0)}.`,
      category: data.category || 'general-tips',
      isAnonymous: Boolean(data.isAnonymous),
      userId: data.userId,
      createdBy: data.isAnonymous ? null : {
        firstName: data.firstName,
        lastName: data.lastName,
        isAnonymous: data.isAnonymous,
        userId: data.userId
      },
      createdAt: new Date()
    };
    
    const result = await db.collection("posts").insertOne(postData);
    logger.dev('Post created successfully');
    
    return NextResponse.json({
      success: true,
      data: { ...postData, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    logger.error(error, 'Create Post API');
    return NextResponse.json({
      success: false,
      message: "Error creating post"
    }, { status: 500 });
  }
}