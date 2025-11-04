'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserProfile({ userId }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/users/${userId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }
                
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.message || 'Failed to load profile');
                }
                
                // Get user index to create display ID
                const allUsersResponse = await fetch('/api/users');
                const allUsersData = await allUsersResponse.json();
                const users = allUsersData.users || [];
                
                // Find the index of this user in the list
                const userIndex = users.findIndex(u => u._id === userId);
                const displayId = userIndex !== -1 ? `User ${userIndex + 1}` : `User`;
                
                // Add display ID to profile
                setProfile({
                    ...data.user,
                    displayId
                });
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-32 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        <p>Error: {error}</p>
                    </div>
                    <div className="mt-6">
                        <Link 
                            href="/profile" 
                            className="text-blue-600 hover:underline"
                        >
                            Back to Users List
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <p className="text-gray-700">User not found</p>
                    <div className="mt-6">
                        <Link 
                            href="/profile" 
                            className="text-blue-600 hover:underline"
                        >
                            Back to Users List
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
                    <Link 
                        href="/profile" 
                        className="text-blue-600 hover:underline flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Users List
                    </Link>
                </div>
                
                <div className="mb-8">
                    <div className="flex items-center mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mr-2">
                            {profile.displayId}
                        </span>
                        {profile.status && (
                            <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                                {profile.status}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">{profile.name || 'Unnamed User'}</h2>
                    </div>
                    <p className="text-gray-600 mt-1">{profile.email || 'No email provided'}</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Details</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h4>
                            <p className="text-gray-800">{profile.phone || 'Not provided'}</p>
                        </div>
                        
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Age</h4>
                            <p className="text-gray-800">{profile.age || 'Not provided'}</p>
                        </div>
                        
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Occupation</h4>
                            <p className="text-gray-800">{profile.occupation || 'Not provided'}</p>
                        </div>
                    </div>
                    
                    {profile.address && (
                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Address</h4>
                            <p className="text-gray-800">{profile.address}</p>
                        </div>
                    )}
                </div>
                
                {profile.bio && (
                    <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Biography</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                )}
                
                <div className="flex justify-between border-t pt-6 mt-8">
                    <div className="text-sm text-gray-500">
                        {profile.createdAt && (
                            <p>Created: {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</p>
                        )}
                        {profile.lastUpdated && (
                            <p>Last Updated: {new Date(profile.lastUpdated).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                        )}
                    </div>
                    
                    <Link 
                        href={`/userForm?id=${userId}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                    </Link>
                </div>
            </div>
        </div>
    );
}