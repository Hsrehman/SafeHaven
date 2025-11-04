"use client";
import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { ObjectId } from 'mongodb';

export default function Foodbank() {
  const [polls, setPolls] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await fetch('/api/foodbank-dashboard');
      const data = await response.json();
      if (data.success) {
        setPolls(data.polls);
      } else {
        setError('Failed to fetch polls');
      }
      setLoading(false);
    } catch (err) {
      setError('Error loading polls');
      setLoading(false);
    }
  };

  const handleOptionSelect = (pollId, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [pollId]: typeof option === 'object' ? option.text : option
    }));
  };

  const handlePollSubmit = async (pollId) => {
    if (!selectedOptions[pollId]) {
      setError('Please select an option before submitting');
      return;
    }

    try {
      const payload = {
        pollId,
        selectedOption: selectedOptions[pollId]
      };
      console.log('Sending vote data:', payload);

      const response = await fetch('/api/foodbank-dashboard/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Response from server:', data);

      if (data.success) {
        setMessage('Thank you for your response!');
        setSelectedOptions(prev => {
          const newOptions = { ...prev };
          delete newOptions[pollId];
          return newOptions;
        });
        fetchPolls(); 
      } else {
        setError(data.message || 'Failed to submit response');
      }
    } catch (err) {
      console.error('Vote submission error:', err);
      setError('Error submitting response');
    }
  };


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (review.length < 100) {
      setError('Review must be at least 100 characters long');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: review,
          rating,
          userId: 'user123',
          userName: 'John Doe'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Review submitted successfully!');
        setReview('');
        setRating(0);
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('Error submitting review');
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="absolute top-0 right-0 px-4 py-3"
            aria-label="Close error message"
          >
            ×
          </button>
        </div>
      )}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
          {message}
          <button 
            onClick={() => setMessage('')} 
            className="absolute top-0 right-0 px-4 py-3"
            aria-label="Close success message"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Active Polls</h2>
        {polls.length > 0 ? (
          polls.map((poll) => (
            <div key={`poll-${poll._id}`} className="mb-6 last:mb-0 border-b pb-6">
              <h3 className="font-medium mb-4">{poll.question}</h3>
              <div className="space-y-2">
                {poll.options.map((option, index) => {
                  const optionText = typeof option === 'object' ? option.text : option;
                  
                  return (
                    <div key={`${poll._id}-option-${index}`} className="flex items-center">
                      <input
                        type="radio"
                        id={`${poll._id}-${index}`}
                        name={`poll-${poll._id}`}
                        value={optionText}
                        onChange={() => handleOptionSelect(poll._id, option)}
                        checked={selectedOptions[poll._id] === optionText}
                        className="mr-2"
                      />
                      <label htmlFor={`${poll._id}-${index}`} className="flex-grow">
                        {optionText}
                      </label>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => handlePollSubmit(poll._id)}
                className={`mt-4 px-4 py-2 rounded ${
                  selectedOptions[poll._id]
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!selectedOptions[poll._id]}
              >
                Submit Response
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No active polls at the moment.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex space-x-1 mt-1">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <button
                    type="button"
                    key={ratingValue}
                    className={`text-2xl ${
                      ratingValue <= (hover || rating) 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                    onClick={() => setRating(ratingValue)}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                    aria-label={`Rate ${ratingValue} stars`}
                  >
                    <FaStar />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Your Review</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              placeholder="Share your experience (minimum 100 characters)"
              required
              minLength={100}
            />
            <div className="mt-1 text-sm text-gray-500">
              {review.length}/100 characters minimum
            </div>
          </div>

          <button
            type="submit"
            disabled={review.length < 100 || rating === 0}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white 
              ${review.length < 100 || rating === 0 
                ? 'bg-gray-400' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}