'use client';

import { useState, useEffect } from 'react';
import PollsSection from '@/app/components/admin/PollsSection';
import ReviewsSection from '@/app/components/admin/ReviewsSection';

export default function FoodbankAdmin() {
  const [activeTab, setActiveTab] = useState('polls');
  const [polls, setPolls] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPolls = async () => {
    try {
      const response = await fetch('/api/foodbank-dashboard/polls');
      const data = await response.json();
      if (data.success) {
        // Ensure polls data is properly formatted
        setPolls(data.polls.map(poll => ({
          ...poll,
          options: poll.options.map(option => 
            typeof option === 'string' ? { text: option, votes: 0 } : option
          )
        })));
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch polls');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/foodbank-dashboard/reviews');
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch reviews');
    }
  };

  useEffect(() => {
    Promise.all([fetchPolls(), fetchReviews()])
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          className={`mr-4 px-4 py-2 ${activeTab === 'polls' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
          onClick={() => setActiveTab('polls')}
        >
          Polls
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {activeTab === 'polls' ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Polls Management</h2>
          <PollsSection polls={polls} onRefresh={fetchPolls} />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Reviews Management</h2>
          <ReviewsSection reviews={reviews} onRefresh={fetchReviews} />
        </div>
      )}
    </div>
  );
}