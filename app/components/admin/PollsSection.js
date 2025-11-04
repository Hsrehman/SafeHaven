'use client';

import React, { useState } from 'react';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export default function PollsSection({ polls, onRefresh }) {
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    active: true
  });
  const [error, setError] = useState('');

  const handleTogglePoll = async (pollId, currentActive) => {
    try {
      const response = await fetch(`/api/foodbank-dashboard/polls/${pollId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      });

      if (!response.ok) throw new Error('Failed to toggle poll');
      onRefresh();
    } catch (err) {
      setError('Failed to toggle poll status');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;

    try {
      const response = await fetch(`/api/foodbank-dashboard/polls/${pollId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete poll');
      onRefresh();
    } catch (err) {
      setError('Failed to delete poll');
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    try {
      // Convert options to simple strings
      const validOptions = newPoll.options
        .filter(opt => opt.trim().length > 0)
        .map(option => option.trim());
      
      if (validOptions.length < 2) {
        setError('At least 2 valid options are required');
        return;
      }

      if (!newPoll.question.trim()) {
        setError('Question is required');
        return;
      }

      const response = await fetch('/api/foodbank-admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newPoll.question.trim(),
          options: validOptions
        })
      });

      if (!response.ok) throw new Error('Failed to create poll');

      const data = await response.json();
      if (data.success) {
        setNewPoll({ question: '', options: ['', ''], active: true });
        setError('');
        onRefresh();
      }
    } catch (err) {
      setError(err.message || 'Failed to create poll');
    }
  };

  return (
    <div>
      {/* Create Poll Form */}
      <div className="mb-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-4">Create New Poll</h3>
        <form onSubmit={handleCreatePoll}>
          <div className="mb-4">
            <label className="block mb-2">Question:</label>
            <input
              type="text"
              value={newPoll.question}
              onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Options:</label>
            {newPoll.options.map((option, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newPoll.options];
                    newOptions[index] = e.target.value;
                    setNewPoll(prev => ({ ...prev, options: newOptions }));
                  }}
                  className="flex-grow p-2 border rounded"
                  required
                />
                {index > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewPoll(prev => ({
                        ...prev,
                        options: prev.options.filter((_, i) => i !== index)
                      }));
                    }}
                    className="ml-2 px-3 py-2 bg-red-500 text-white rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setNewPoll(prev => ({
                ...prev,
                options: [...prev.options, '']
              }))}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            >
              Add Option
            </button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Poll
          </button>
        </form>
      </div>

      {/* Polls List */}
      <div className="space-y-4">
        {Array.isArray(polls) && polls.map((poll) => (
          <div key={poll._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{poll.question}</h3>
                <ul className="mt-2 list-disc list-inside">
                  {Array.isArray(poll.options) && poll.options.map((option, index) => {
                    // Convert option to string, handling both object and string cases
                    const optionText = typeof option === 'object' && option !== null
                      ? String(option.text || '')
                      : String(option || '');

                    // Get votes count, defaulting to 0
                    const votes = typeof option === 'object' && option !== null
                      ? Number(option.votes || 0)
                      : 0;

                    return (
                      <li key={index} className="text-gray-600">
                        {optionText} ({votes} votes)
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTogglePoll(poll._id, poll.active)}
                  className={`p-2 ${poll.active ? 'text-green-500' : 'text-gray-500'}`}
                  title={poll.active ? 'Deactivate Poll' : 'Activate Poll'}
                >
                  {poll.active ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                </button>
                <button
                  onClick={() => handleDeletePoll(poll._id)}
                  className="p-2 text-red-500"
                  title="Delete Poll"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}