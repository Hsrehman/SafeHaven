'use client';
import React from 'react';
import { FaStar, FaTrash } from 'react-icons/fa';

export default function ReviewsSection({ reviews, onRefresh }) {
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const response = await fetch(`/api/foodbank-admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  return (
    <div className="space-y-4">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{review.userName}</div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`${
                        index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-gray-600">{review.text}</p>
                <div className="text-sm text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDeleteReview(review._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
                title="Delete Review"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No reviews available.</p>
      )}
    </div>
  );
}