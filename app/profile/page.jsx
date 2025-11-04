'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import UserProfile from '../components/UserProfile';
import Link from 'next/link';

export default function ProfilePage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('id');
    const [error, setError] = useState(null);
    
    if (!userId) {
        return <UsersList />;
    }
    
    return <UserProfile userId={userId} />;
}

// Component to display list of all users when no ID is provided
function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/users');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                
                const data = await response.json();
                
                // Add display IDs to each user (User 1, User 2, etc.)
                const usersWithDisplayIds = (data.users || []).map((user, index) => ({
                    ...user,
                    displayId: `User ${index + 1}`
                }));
                
                setUsers(usersWithDisplayIds);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-10 px-4">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">User Profiles</h1>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((index) => (
                            <div key={index} className="animate-pulse border rounded-lg p-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto py-10 px-4">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">User Profiles</h1>
                    <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
                        <p>Error: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">User Profiles</h1>
                    <Link 
                        href="/userForm" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Profile
                    </Link>
                </div>
                
                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="mt-4 text-xl text-gray-600">No user profiles found</p>
                        <p className="mt-2 text-gray-500">Create a new profile to get started</p>
                        <Link 
                            href="/userForm" 
                            className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Create Your First Profile
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map(user => (
                            <div key={user._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="bg-gray-50 p-4 border-b">
                                    {/* Display the unique ID badge */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                            {user.displayId}
                                        </span>
                                        {user.status && (
                                            <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                {user.status}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-800">{user.name || 'Unnamed User'}</h3>
                                    <p className="text-gray-600 text-sm truncate">{user.email || 'No email provided'}</p>
                                </div>
                                <div className="p-4 flex flex-col">
                                    {user.phone && (
                                        <p className="text-sm text-gray-600 mb-1">📱 {user.phone}</p>
                                    )}
                                    {user.occupation && (
                                        <p className="text-sm text-gray-600 mb-1">💼 {user.occupation}</p>
                                    )}
                                    <div className="mt-auto pt-4 flex justify-end">
                                        <Link 
                                            href={`/profile?id=${user._id}`}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-sm"
                                        >
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}