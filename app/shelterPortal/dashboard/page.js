'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';
import {
  Bell, Menu, Search, User, Home, Settings, LogOut,
  FileText, Users, MessageSquare, LayoutDashboard,
  AlertCircle, ListOrdered, Moon, Sun, UserPlus, 
  FileCheck, RefreshCw, BarChart2, Calendar
} from 'lucide-react';

const getTimeSince = (date) => {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const submittedDate = new Date(date);
  const seconds = Math.floor((now - submittedDate) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + (interval === 1 ? ' year ago' : ' years ago');
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + (interval === 1 ? ' month ago' : ' months ago');
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + (interval === 1 ? ' day ago' : ' days ago');
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + (interval === 1 ? ' hour ago' : ' hours ago');
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + (interval === 1 ? ' minute ago' : ' minutes ago');
  
  return 'Just now';
};

import AdminProfile from './tabs/AdminProfile';
import Applications from './tabs/Applications';
import ShelterSettings from './tabs/ShelterSettings';

const DashboardPage = () => {
  const [data, setData] = useState(null); 
  const [shelterData, setShelterData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  
  useEffect(() => {
    const handleApplicationsUpdate = (event) => {
      const { applications, pendingCount } = event.detail;
      setData(prev => ({
        ...prev,
        applications: applications,
        pendingApplicationsCount: pendingCount
      }));
    };

    window.addEventListener('applicationsUpdate', handleApplicationsUpdate);

    return () => {
      window.removeEventListener('applicationsUpdate', handleApplicationsUpdate);
    };
  }, []);

  const fetchApplicationsCount = async (shelterId) => {
    try {
      const applicationsResponse = await fetch(`/api/shelterAdmin/shelter-applications?shelterId=${shelterId}`);
      const applicationsData = await applicationsResponse.json();
      
      if (applicationsResponse.ok) {
        const pendingCount = applicationsData.applications.filter(app => app.status === 'pending').length;
        setData(prev => ({
          ...prev,
          applications: applicationsData.applications,
          pendingApplicationsCount: pendingCount
        }));
      }
    } catch (error) {
      logger.error(error, 'Dashboard - fetchApplicationsCount');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        logger.dev('Fetching dashboard data...');
        setIsLoading(true);

        const userResponse = await fetch('/api/shelterAdmin/dashboard', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        logger.dev('Dashboard response status:', userResponse.status);

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            logger.dev('Authentication failed, redirecting to login...');
            router.push('/shelterPortal/login');
            throw new Error('Please log in to access the dashboard');
          }
          const errorData = await userResponse.json();
          throw new Error(errorData.message || 'Failed to load dashboard');
        }

        const userResponseData = await userResponse.json();
        logger.dev('Dashboard data received:', sanitizeData(userResponseData));

        if (!userResponseData.success) {
          throw new Error(userResponseData.message || 'Failed to load dashboard data');
        }

        setData(userResponseData);

        if (userResponseData.data?.user?.shelterId) {
          await fetchApplicationsCount(userResponseData.data.user.shelterId);
          await fetchShelterData(userResponseData.data.user.shelterId, userResponseData.data.user.id);
        }
      } catch (error) {
        logger.error(error, 'Dashboard - fetchDashboardData');
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const fetchShelterData = async (shelterId, userId) => {
    try {
      logger.dev('Fetching shelter data for shelterId:', shelterId);
      const shelterResponse = await fetch(`/api/shelterAdmin/get-shelter?shelterId=${shelterId}`, {
        method: 'GET',
        headers: { 'X-User-Id': userId, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
  
      if (!shelterResponse.ok) {
        const errorData = await shelterResponse.json();
        throw new Error(errorData.message || 'Failed to fetch shelter data');
      }
  
      const shelterResponseData = await shelterResponse.json();
      logger.dev('Shelter data received:', sanitizeData(shelterResponseData));
  
      if (shelterResponseData.success) {
        const realShelterData = shelterResponseData.data;
        const stubbedShelterData = {
          ...realShelterData,
          name: realShelterData.shelterName || 'Safe Haven Shelter',
          capacity: realShelterData.maxCapacity || 45,
          currentOccupancy: realShelterData.currentOccupancy || 32,
          availableBeds: realShelterData.availableBeds || 13,
          occupancyRate: realShelterData.occupancyRate || 71,
          location: {
            address: realShelterData.location || '123 Main Street, London',
            coordinates: realShelterData.location_coordinates || { lat: 51.5074, lng: -0.1278 }
          },
          phone: realShelterData.phone || '07123456789',
          openingHours: realShelterData.operatingHours || '24/7',
          genderPolicy: realShelterData.genderPolicy || 'All Genders',
          
          bedDistribution: {
            maleBeds: { total: 25, occupied: 18 },
            femaleBeds: { total: 15, occupied: 10 },
            familyUnits: { total: 5, occupied: 4 }
          },
          applications: {
            total: 48,
            pending: 12,
            accepted: 28,
            rejected: 8,
            recent: [
              { id: 1, name: 'John Smith', type: 'Single Adult', urgency: 'URGENT', timeAgo: '2 hours ago' },
              { id: 2, name: 'Maria Johnson', type: 'Family of 3', urgency: 'FAMILY', timeAgo: '1 day ago' },
              { id: 3, name: 'Robert Williams', type: 'Single Adult', urgency: '', timeAgo: '2 days ago' }
            ]
          },
          waitlist: {
            total: 8,
            urgentPriority: 3,
            regular: 5,
            oldestApplication: '12 days'
          },
          departures: {
            total: 4,
            next24Hours: 1,
            next7Days: 3,
            upcoming: [
              { id: 1, name: 'Emily Davis', type: 'Single Adult', checkInDate: 'Jan 15, 2025', departureDate: 'Tomorrow', status: 'Confirmed' },
              { id: 2, name: 'Michael Thompson', type: 'Single Adult', checkInDate: 'Dec 10, 2024', departureDate: 'Mar 3, 2025', status: 'Pending Confirmation' }
            ]
          }
        };
        setShelterData(stubbedShelterData);
      } else {
        throw new Error(shelterResponseData.message || 'Failed to load shelter data');
      }
    } catch (error) {
      logger.error(error, 'Dashboard - fetchShelterData');
      setError(error.message || 'Error fetching shelter data');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/shelterAdmin/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        router.push('/shelterPortal/login');
      } else {
        logger.error(new Error('Logout failed'), 'Dashboard - handleLogout');
      }
    } catch (error) {
      logger.error(error, 'Dashboard - handleLogout');
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const formatDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const handleQuickAction = (action) => alert(`Action triggered: ${action}`);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h3>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Error</h3>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/shelterPortal/login')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
        strategy="lazyOnload"
      />
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-gradient-to-b from-[#3B82C4] to-[#1A5276]'} ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 shadow-xl h-screen overflow-y-auto`}>
          <div className="p-4 flex items-center justify-between">
            {isSidebarOpen && <div className="text-white font-bold text-xl">Safe Haven UK</div>}
            <button onClick={toggleSidebar} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-600 bg-opacity-20 hover:bg-opacity-30'} text-white`}>
              <Menu size={20} />
            </button>
          </div>
          <div className="mt-2">
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" isOpen={isSidebarOpen} isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} darkMode={darkMode} />
            <SidebarItem 
              icon={<FileText size={20} />} 
              text="Applications" 
              isOpen={isSidebarOpen} 
              isActive={activeTab === 'applications'} 
              onClick={() => setActiveTab('applications')} 
              badge={data?.pendingApplicationsCount || 0}
              darkMode={darkMode} 
            />
            <SidebarItem icon={<ListOrdered size={20} />} text="Waitlist" isOpen={isSidebarOpen} isActive={activeTab === 'waitlist'} onClick={() => setActiveTab('waitlist')} badge={shelterData?.waitlist?.total || 0} darkMode={darkMode} />
            <SidebarItem icon={<Users size={20} />} text="Resident Management" isOpen={isSidebarOpen} isActive={activeTab === 'residents'} onClick={() => setActiveTab('residents')} darkMode={darkMode} />
            <SidebarItem icon={<Home size={20} />} text="Shelter Settings" isOpen={isSidebarOpen} isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} darkMode={darkMode} />
            <SidebarItem icon={<MessageSquare size={20} />} text="Messages" isOpen={isSidebarOpen} isActive={activeTab === 'messages'} onClick={() => setActiveTab('messages')} badge={3} darkMode={darkMode} />
            <div className="border-t border-blue-400 border-opacity-30 my-2"></div>
            <SidebarItem icon={<User size={20} />} text="Admin Profile" isOpen={isSidebarOpen} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} darkMode={darkMode} />
            <SidebarItem icon={<Bell size={20} />} text="Notifications" isOpen={isSidebarOpen} isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge={5} darkMode={darkMode} />
            <div className="mt-auto p-4">
              <div className={`flex items-center text-gray-100 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-600 hover:bg-opacity-20'} p-2 rounded-lg`} onClick={handleLogout}>
                <LogOut size={20} />
                {isSidebarOpen && <div className="ml-3">Logout</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-md z-10`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input type="text" placeholder="Search residents, applications..." className={`pl-10 pr-4 py-2 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2 w-64`} />
                  <Search className={`absolute left-3 top-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} size={18} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} relative`} onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className={`p-2 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} relative`}>
                  <MessageSquare size={20} />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-[#3B82C4]'} flex items-center justify-center text-white`}>
                    <User size={18} />
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{data?.data?.user?.adminName || 'Admin User'}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{data?.data?.user?.role || 'Administrator'}</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {showNotifications && (
            <div className={`absolute right-16 top-16 w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg rounded-xl z-20 overflow-hidden border`}>
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <button className="text-sm text-blue-500">Mark all as read</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                        <AlertCircle size={16} />
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Urgent Application Received</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>John Smith requires immediate review</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className={`p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer`}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                        <MessageSquare size={16} />
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>New Message</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Support team: "Weekly meeting reminder"</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 text-center border-t">
                <button className="text-sm text-blue-500 hover:text-blue-700">View all notifications</button>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === 'dashboard' && (
              <DashboardTab 
                data={data} 
                shelterData={shelterData} 
                darkMode={darkMode} 
                formatDate={formatDate} 
                handleQuickAction={handleQuickAction}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'profile' && <AdminProfile userData={data?.data?.user} darkMode={darkMode} />}
            {activeTab === 'applications' && <Applications shelterId={data?.data?.user?.shelterId} darkMode={darkMode} />}
            {activeTab === 'waitlist' && (
              <div className="text-center py-20">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Waitlist Management</h2>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>This feature is coming soon!</p>
              </div>
            )}
            {activeTab === 'residents' && (
              <div className="text-center py-20">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Resident Management</h2>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>This feature is coming soon!</p>
              </div>
            )}
            {activeTab === 'settings' && <ShelterSettings shelterData={shelterData} userData={data?.data?.user} darkMode={darkMode} />}
            {activeTab === 'messages' && (
              <div className="text-center py-20">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Messages</h2>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>This feature is coming soon!</p>
              </div>
            )}
            {activeTab === 'notifications' && (
              <div className="text-center py-20">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Notifications</h2>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>This feature is coming soon!</p>
              </div>
            )}
          </main>

          <div className="fixed bottom-6 right-6">
            <button className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'} text-white p-3 rounded-full shadow-lg transition-colors`} onClick={toggleDarkMode}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarItem = ({ icon, text, isOpen, isActive, onClick, badge, darkMode }) => (
  <div className={`flex items-center p-4 cursor-pointer transition-colors relative ${isActive ? (darkMode ? 'bg-gray-700 text-white' : 'bg-blue-600 bg-opacity-30 text-white') : (darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-100 hover:bg-blue-600 hover:bg-opacity-20')}`} onClick={onClick}>
    <div>{icon}</div>
    {isOpen && <div className="ml-3">{text}</div>}
    {isOpen && badge > 0 && <div className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</div>}
    {!isOpen && badge > 0 && <div className="absolute top-0 right-0 mt-2 mr-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{badge}</div>}
  </div>
);

const DashboardTab = ({ data, shelterData, darkMode, formatDate, handleQuickAction, setActiveTab }) => (
  <>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Welcome back, {data?.data?.user?.adminName || 'Admin'}! Here's what's happening today.</p>
      </div>
      <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{formatDate()}</div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Total Applications</h3>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-2`}>
              {data?.applications?.length || 0}
            </p>
          </div>
          <div className={`p-3 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-lg`}>
            <FileText className={darkMode ? 'text-blue-300' : 'text-blue-600'} size={24} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={`${darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50'} rounded-lg p-2`}>
            <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-600'}`}>Pending</p>
            <p className={`font-bold ${darkMode ? 'text-yellow-100' : 'text-yellow-800'}`}>
              {data?.applications?.filter(app => app.status === 'pending').length || 0}
            </p>
          </div>
          <div className={`${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-50'} rounded-lg p-2`}>
            <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-600'}`}>Accepted</p>
            <p className={`font-bold ${darkMode ? 'text-green-100' : 'text-green-800'}`}>
              {data?.applications?.filter(app => app.status === 'approved').length || 0}
            </p>
          </div>
          <div className={`${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50'} rounded-lg p-2`}>
            <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-600'}`}>Rejected</p>
            <p className={`font-bold ${darkMode ? 'text-red-100' : 'text-red-800'}`}>
              {data?.applications?.filter(app => app.status === 'rejected').length || 0}
            </p>
          </div>
        </div>
      </div>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Shelter Occupancy</h3>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-2`}>{shelterData?.currentOccupancy || 0}/{shelterData?.capacity || 0}</p>
          </div>
          <div className={`p-3 ${darkMode ? 'bg-purple-900' : 'bg-purple-100'} rounded-lg`}>
            <Users className={darkMode ? 'text-purple-300' : 'text-purple-600'} size={24} />
          </div>
        </div>
        <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-4 mt-2`}>
          <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${shelterData?.occupancyRate || 0}%` }}></div>
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>{shelterData?.occupancyRate || 0}% Occupied</p>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{shelterData?.availableBeds || 0} beds available</p>
      </div>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Waitlist</h3>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-2`}>{shelterData?.waitlist?.total || 0}</p>
          </div>
          <div className={`p-3 ${darkMode ? 'bg-yellow-900' : 'bg-yellow-100'} rounded-lg`}>
            <ListOrdered className={darkMode ? 'text-yellow-300' : 'text-yellow-600'} size={24} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full ${darkMode ? 'bg-red-500' : 'bg-red-500'} mr-2`}></span>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Urgent Priority: <span className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{shelterData?.waitlist?.urgentPriority || 0}</span></p>
          </div>
          <div className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full ${darkMode ? 'bg-yellow-500' : 'bg-yellow-500'} mr-2`}></span>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Regular: <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{shelterData?.waitlist?.regular || 0}</span></p>
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Oldest application: {shelterData?.waitlist?.oldestApplication || 'N/A'}</div>
        </div>
      </div>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Upcoming Departures</h3>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mt-2`}>{shelterData?.departures?.total || 0}</p>
          </div>
          <div className={`p-3 ${darkMode ? 'bg-green-900' : 'bg-green-100'} rounded-lg`}>
            <Calendar className={darkMode ? 'text-green-300' : 'text-green-600'} size={24} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Next 24 hours</p>
            <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{shelterData?.departures?.next24Hours || 0}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Next 7 days</p>
            <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{shelterData?.departures?.next7Days || 0}</p>
          </div>
          <div className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-500'} mt-2`}>{shelterData?.departures?.total || 0} beds becoming available soon</div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Quick Actions</h3>
        <div className="space-y-3">
          <button onClick={() => handleQuickAction('Add New Resident')} className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center">
            <UserPlus size={18} className="mr-2" /> Add New Resident
          </button>
          <button onClick={() => handleQuickAction('Review Pending Applications')} className="w-full px-4 py-2 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600 transition-colors flex items-center justify-center">
            <FileCheck size={18} className="mr-2" /> Review Pending Applications
          </button>
          <button onClick={() => handleQuickAction('View Waitlist')} className="w-full px-4 py-2 bg-purple-500 text-white rounded-xl shadow-md hover:bg-purple-600 transition-colors flex items-center justify-center">
            <ListOrdered size={18} className="mr-2" /> View Waitlist
          </button>
          <button onClick={() => handleQuickAction('Update Shelter Availability')} className="w-full px-4 py-2 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center justify-center">
            <RefreshCw size={18} className="mr-2" /> Update Shelter Availability
          </button>
        </div>
      </div>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Recent Applications</h3>
        <div className="space-y-3">
          {data?.applications?.slice(0, 3).map((application, index) => (
            <div 
              key={application._id || application.id || `application-${index}`} 
              className={`flex items-start p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer`}
            >
              <div className="flex-shrink-0 mr-3">
                <div className={`w-8 h-8 rounded-full ${
                  application.urgency === 'URGENT' ? (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-500') 
                  : application.type?.includes('Family') ? (darkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-500') 
                  : (darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-500')
                } flex items-center justify-center`}>
                  {application.urgency === 'URGENT' ? <AlertCircle size={16} /> 
                   : application.type?.includes('Family') ? <Users size={16} /> 
                   : <User size={16} />}
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {application.name} 
                  {application.urgency === 'URGENT' && 
                    <span className={`text-xs font-bold ml-2 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                      URGENT
                    </span>
                  }
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Applied {getTimeSince(application.submittedAt)} • {application.type}
                </p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('applications');
                }}
                className={`ml-auto ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'} px-2 py-1 rounded text-xs hover:opacity-90 transition-opacity`}
              >
                Review
              </button>
            </div>
          ))}
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setActiveTab('applications')}
              className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-500'} hover:${darkMode ? 'text-blue-300' : 'text-blue-700'} transition-colors`}
            >
              View all applications →
            </button>
          </div>
        </div>
      </div>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Upcoming Departures</h3>
        <div className="space-y-3">
          {shelterData?.departures?.upcoming?.map(departure => (
            <div key={departure.id} className={`flex items-start p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer`}>
              <div className="flex-shrink-0 mr-3">
                <div className={`w-8 h-8 rounded-full ${departure.departureDate === 'Tomorrow' ? (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-500') : (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600')} flex items-center justify-center`}>
                  <Calendar size={16} />
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{departure.name}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Departing: {departure.departureDate}</p>
              </div>
              <span className={`ml-auto px-2 py-1 text-xs rounded-full ${departure.status === 'Confirmed' ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600') : (darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-600')}`}>{departure.status}</span>
            </div>
          ))}
          <div className="flex justify-center mt-4">
            <button className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-500'} hover:${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>View all departures →</button>
          </div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Occupancy Trends</h3>
          <select className={`text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-700'} border rounded-lg px-2 py-1`}>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
          </select>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            <div className="text-center">
              <BarChart2 className={`mx-auto ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`} size={48} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Occupancy Rate Chart</p>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mt-2`}>(In a real implementation, this would be a live chart)</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Application Types</h3>
          <select className={`text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-700'} border rounded-lg px-2 py-1`}>
            <option value="month">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="3months">Last 3 Months</option>
          </select>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Single Adults</span>
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>65%</span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Families</span>
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>25%</span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Youth (18-24)</span>
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>8%</span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '8%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Elderly</span>
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>2%</span>
            </div>
            <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '2%' }}></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 text-center`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Urgent Cases</p>
            <p className={`font-bold text-xl ${darkMode ? 'text-red-400' : 'text-red-500'}`}>18%</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 text-center`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg. Processing Time</p>
            <p className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>2.4 days</p>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default DashboardPage;