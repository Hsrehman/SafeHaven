import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import logger from '@/app/utils/logger';

export async function DELETE(request, { params }) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    const client = await clientPromise;
    const db = client.db("communityhelp");
    
    const { id } = params;
    const numericId = parseInt(id, 10);
    
    if (isNaN(numericId)) {
      return NextResponse.json({
        success: false,
        message: "Invalid post ID format"
      }, { status: 400 });
    }
    
    // First find the post to check ownership
    const post = await db.collection("posts").findOne({ id: numericId });
    
    if (!post) {
      return NextResponse.json({
        success: false,
        message: "Post not found"
      }, { status: 404 });
    }
    
    // Check if the user owns this post
    if (userId) {
      const postUserId = post.userId || (post.createdBy && post.createdBy.userId);
      
      if (postUserId && postUserId !== userId) {
        return NextResponse.json({
          success: false,
          message: "Unauthorized. You can only delete your own posts."
        }, { status: 403 });
      }
    }
    
    // Delete the post
    const result = await db.collection("posts").deleteOne({ id: numericId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Post could not be deleted"
      }, { status: 500 });
    }
    
    logger.dev('Post deleted successfully', { postId: numericId });
    
    return NextResponse.json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error) {
    logger.error(error, 'Delete Post API');
    return NextResponse.json({
      success: false,
      message: "Error deleting post"
    }, { status: 500 });
  }
}

