'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageSquare, 
  AlertTriangle, 
  User, 
  Clock, 
  Filter, 
  Plus, 
  Send,
  UserPlus,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Key,
  Copy,
  Shield
} from 'lucide-react';

const CommunityHelpPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general-tips');
  const [posts, setPosts] = useState([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    firstName: '',
    lastName: '',
    isLoggedIn: false,
    userId: ''
  });
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general-tips',
    isAnonymous: false,
    firstName: '',
    lastName: '',
    userId: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('recent');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [enteredUserId, setEnteredUserId] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  
  useEffect(() => {
    const generateUserId = () => {
     
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const length = 12;
      
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      setCurrentUser(prevUser => ({
        ...prevUser,
        userId: result
      }));
    };
    
    generateUserId();
  }, []);
  
  
  useEffect(() => {
    if (enteredUserId && enteredUserId.trim() !== '') {
      setCurrentUser(prevUser => ({
        ...prevUser,
        userId: enteredUserId
      }));
    }
  }, [enteredUserId]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/posts?filterType=${filterType}&category=${activeTab}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch posts');
        }
        
        const data = await response.json();
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError(error.message || 'Failed to load posts. Please try again later.');
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [filterType, activeTab]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(currentUser.userId);
    setShowCopiedMessage(true);
    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 2000);
  };

  const handleCreatePost = async (postData) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const newPost = await response.json();
      setPosts(prevPosts => [newPost.data, ...prevPosts]);
      setIsCreatingPost(false);
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.message || 'Failed to create post. Please try again.');
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    
    if (!currentUser.userId || currentUser.userId.trim() === '') {
      alert("Please enter a User ID before creating a post.");
      return;
    }
    
    const currentDate = new Date().toISOString();
    const formattedName = newPost.isAnonymous ? "Anonymous" : `${newPost.firstName} ${newPost.lastName.charAt(0)}.`;
    
    const postId = Date.now();
    
    const newPostWithDetails = {
      id: postId,
      ...newPost,
      author: formattedName, 
      createdAt: currentDate,
      userId: currentUser.userId, 
      createdBy: {
        firstName: newPost.firstName,
        lastName: newPost.lastName,
        isAnonymous: newPost.isAnonymous,
        userId: currentUser.userId
      }
    };
    
    await handleCreatePost(newPostWithDetails);
  };

  const handleCancelPost = () => {
    setIsCreatingPost(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name === 'isAnonymous' && type === 'checkbox') {
      setNewPost({
        ...newPost,
        isAnonymous: checked,
        firstName: checked ? '' : currentUser.isLoggedIn ? currentUser.firstName : newPost.firstName,
        lastName: checked ? '' : currentUser.isLoggedIn ? currentUser.lastName : newPost.lastName
      });
    } else {
      setNewPost({
        ...newPost,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleDeletePost = async (postId, userId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }

      const data = await response.json();
      if (data.success) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        alert('Post deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error.message || 'Failed to delete post. Please try again.');
    }
  };

  const filteredPosts = posts.sort((a, b) => {
    if (filterType === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt); 
    } else if (filterType === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt); 
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="text-blue-600 mr-3" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Your User ID</h3>
                <p className="text-blue-700 text-sm">Keep this ID secure. It's used to identify your posts. <span className="font-medium">If you already have a userID, ignore this.</span></p>
              </div>
            </div>
            <div className="flex items-center bg-white border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
              <Key className="text-blue-500 mr-2" size={16} />
              <code className="font-mono text-gray-700 mr-2">{currentUser.userId}</code>
              <button 
                onClick={handleCopyUserId}
                className="text-blue-500 hover:text-blue-700"
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
          {showCopiedMessage && (
            <div className="mt-2 text-sm text-green-600 text-right">
              ✓ Copied to clipboard
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-[#154360] mb-6 text-center">Community Tips</h1>
          
          <div className="flex flex-wrap mb-6 border-b">
            <button 
              onClick={() => handleTabChange('general-tips')}
              className="mr-4 pb-3 px-1 border-b-2 font-medium border-[#3B82C4] text-[#3B82C4]"
            >
              General Tips
            </button>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <Filter className="mr-2 text-gray-400" size={18} />
                <select 
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <Key className="text-gray-400 mr-2" size={16} />
                <input
                  type="text"
                  placeholder="Paste your User ID here"
                  value={enteredUserId}
                  onChange={(e) => setEnteredUserId(e.target.value)}
                  className="border-none focus:outline-none text-gray-700 w-48"
                />
              </div>
            </div>
            <button 
              onClick={() => setShowCreatePost(true)}
              className="bg-[#3B82C4] text-white py-2 px-4 rounded-lg shadow hover:bg-[#1A5276] transition-colors flex items-center"
            >
              <Plus size={18} className="mr-1" /> Create Post
            </button>
          </div>

          {showCreatePost && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Create a New Post</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!currentUser.userId?.trim()) {
                      alert("Please enter a User ID before creating a post.");
                      return;
                    }

                    const postData = {
                      title: newPost.title.trim(),
                      content: newPost.content.trim(),
                      category: newPost.category || 'general-tips',
                      isAnonymous: newPost.isAnonymous,
                      firstName: currentUser.firstName,
                      lastName: currentUser.lastName,
                      userId: currentUser.userId,
                    };

                    if (!postData.title || !postData.content) {
                      alert("Please fill in all required fields.");
                      return;
                    }

                    await handleCreatePost(postData);
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3B82C4]"
                          placeholder="Enter post title"
                          required
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content *
                        </label>
                        <textarea
                          value={newPost.content}
                          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3B82C4] min-h-[150px]"
                          placeholder="Share your thoughts..."
                          required
                          maxLength={1000}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="anonymous"
                          checked={newPost.isAnonymous}
                          onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                          className="rounded text-[#3B82C4] focus:ring-[#3B82C4]"
                        />
                        <label htmlFor="anonymous" className="text-sm text-gray-700">
                          Post anonymously
                        </label>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCreatePost(false)}
                        className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#3B82C4] text-white rounded-md hover:bg-[#1A5276] transition-colors"
                      >
                        Create Post
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Try Again
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82C4]"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white border rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-[#154360] mb-1">{post.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="flex items-center mr-3">
                          {post.isAnonymous ? (
                            <UserPlus size={14} className="mr-1" />
                          ) : (
                            <User size={14} className="mr-1" />
                          )}
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center mr-3">
                          <Clock size={14} className="mr-1" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                        <div className="px-2 py-0.5 rounded-full text-xs uppercase bg-gray-100">
                          Tips
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  <div className="flex items-center justify-end border-t pt-3">
                    {((post.userId && post.userId === currentUser.userId) || 
                      (post.createdBy && post.createdBy.userId === currentUser.userId)) && (
                      <button
                        onClick={() => handleDeletePost(post.id, currentUser.userId)}
                        className="flex items-center text-red-500 hover:text-red-700 transition-colors text-sm"
                        title="Delete this post"
                      >
                        <Trash2 size={14} className="mr-1" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-center py-4">
                <button className="flex items-center text-[#3B82C4] hover:text-[#1A5276] transition-colors">
                  <RefreshCw size={16} className="mr-2" /> Load More
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No posts available. Be the first to share!
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#154360] mb-4">Community Guidelines</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-3">
                <MessageSquare className="text-[#3B82C4]" size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-[#154360]">Be Respectful</h3>
                <p>Treat others with kindness and respect. Hate speech, personal attacks, and harassment will not be tolerated.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-3">
                <User className="text-[#3B82C4]" size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-[#154360]">Protect Privacy</h3>
                <p>Do not share personally identifiable information about yourself or others. You can choose to post anonymously.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-3">
                <Shield className="text-[#3B82C4]" size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-[#154360]">Keep Your UserID Secure</h3>
                <p>Your UserID is your identity in this community. Never share it with others and keep it secure to maintain control of your posts.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1 mr-3">
                <AlertTriangle className="text-[#3B82C4]" size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-[#154360]">Quality Content</h3>
                <p>Focus on providing helpful, accurate information. Share your experiences and tips in a constructive way.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHelpPage;