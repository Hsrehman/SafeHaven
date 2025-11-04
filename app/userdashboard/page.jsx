'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  Home, 
  Shield, 
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Clipboard,
  LogOut,
  File,
  Check,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const router = useRouter();
  const [editMode, setEditMode] = useState({
    profile: false,
    details: false
  });
  
  const [activeSection, setActiveSection] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    language: "",
    location: "",
    name: "",
    occupation: "",
    bio: "",
    address: "",
    age: "",
    sleepingRough: "",
    homelessDuration: "",
    groupType: "",
    groupSize: "",
    childrenCount: "",
    previousAccommodation: "",
    reasonForLeaving: [],
    shelterType: "",
    securityNeeded: "",
    curfew: "",
    communalLiving: "",
    smoking: "",
    womenOnly: "",
    lgbtqFriendly: "",
    pets: "",
    petDetails: "",
    foodAssistance: "",
    benefitsHelp: "",
    mentalHealth: "",
    substanceUse: "",
    socialServices: "",
    domesticAbuse: "",
    medicalConditions: "",
    wheelchair: "",
    immigrationStatus: "",
    benefits: [],
    localConnection: [],
    careLeaver: "",
    veteran: "",
    supportWorkers: "",
    supportWorkerDetails: "",
    terms: false,
    dataConsent: false,
    contactConsent: false,
    submittedAt: "",
    lastUpdated: "",
    status: ""
  });

  const [editedData, setEditedData] = useState({...userData});
  
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get email from sessionStorage
        const email = sessionStorage.getItem('dashboardEmail');
        
        if (!email) {
          // Redirect to verification page if no email found
          router.push('/dashboard-verify');
          return;
        }

        const response = await fetch(`/api/userForm/get-user-data?email=${encodeURIComponent(email)}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch user data');
        }

        if (result.success && result.data) {
          setUserData(result.data);
          setEditedData(result.data);
        }

        // Fetch user's applications
        const applicationsResponse = await fetch(`/api/shelter-applications/user?email=${encodeURIComponent(email)}`);
        const applicationsResult = await applicationsResponse.json();

        if (applicationsResponse.ok && applicationsResult.success) {
          setApplications(applicationsResult.applications || []);
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const availableBenefits = [
    "Universal Credit",
    "Housing Benefit",
    "ESA",
    "JSA",
    "PIP", 
    "None of these",
    "Other"
  ];

  const toggleBenefit = (benefit) => {
    if (benefit === "None of these") {
      setEditedData({
        ...editedData,
        benefits: editedData.benefits.includes("None of these") ? [] : ["None of these"]
      });
      return;
    }
    
    const newBenefits = [...editedData.benefits];
    const index = newBenefits.indexOf(benefit);
    
    if (index === -1) {
      newBenefits.push(benefit);
      const noneIndex = newBenefits.indexOf("None of these");
      if (noneIndex !== -1) {
        newBenefits.splice(noneIndex, 1);
      }
    } else {
      newBenefits.splice(index, 1);
    }
    
    setEditedData({...editedData, benefits: newBenefits});
  };

  const handleUpdateData = async (section) => {
    try {
      setLoading(true);
      const email = sessionStorage.getItem('dashboardEmail');
      
      if (!email) {
        router.push('/dashboard-verify');
        return;
      }

      // Make API call to update data
      const response = await fetch('/api/userForm/update-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          section,
          data: editedData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update data');
      }

      // Update local state only after successful database update
      if (section === 'profile') {
        setUserData({
          ...userData,
          fullName: editedData.fullName,
          email: editedData.email,
          phone: editedData.phone,
          dob: editedData.dob,
          gender: editedData.gender,
          language: editedData.language,
          name: editedData.name,
          occupation: editedData.occupation,
          bio: editedData.bio
        });
      } else if (section === 'details') {
        setUserData({
          ...userData,
          sleepingRough: editedData.sleepingRough,
          homelessDuration: editedData.homelessDuration,
          groupType: editedData.groupType,
          groupSize: editedData.groupSize,
          childrenCount: editedData.childrenCount,
          shelterType: editedData.shelterType,
          securityNeeded: editedData.securityNeeded,
          communalLiving: editedData.communalLiving,
          smoking: editedData.smoking,
          womenOnly: editedData.womenOnly,
          lgbtqFriendly: editedData.lgbtqFriendly,
          pets: editedData.pets,
          foodAssistance: editedData.foodAssistance,
          benefitsHelp: editedData.benefitsHelp,
          benefits: editedData.benefits,
          mentalHealth: editedData.mentalHealth,
          substanceUse: editedData.substanceUse,
          socialServices: editedData.socialServices,
          domesticAbuse: editedData.domesticAbuse,
          medicalConditions: editedData.medicalConditions,
          wheelchair: editedData.wheelchair,
          immigrationStatus: editedData.immigrationStatus,
          location: editedData.location,
          address: editedData.address
        });
      }
      
      setEditMode({...editMode, [section]: false});
      
    } catch (error) {
      console.error('Error updating data:', error);
      setError('Failed to update data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = (id) => {
    setApplications(applications.filter(app => app.id !== id));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSignOut = () => {
    // Clear the email from sessionStorage
    sessionStorage.removeItem('dashboardEmail');
    // Redirect to the email verification page
    router.push('/dashboard-verify');
  };

  const navigationItems = [
    { name: "Profile", icon: <User size={20} />, id: "profile" },
    { name: "Current Situation", icon: <MapPin size={20} />, id: "situation" },
    { name: "Housing Needs", icon: <Home size={20} />, id: "housing" },
    { name: "Support Needs", icon: <Shield size={20} />, id: "support" },
    { name: "Applications", icon: <Clipboard size={20} />, id: "applications" },
    { name: "Privacy & Consent", icon: <File size={20} />, id: "privacy" }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium text-gray-900">Profile</h2>
              {!editMode.profile ? (
                <button
                  onClick={() => setEditMode({...editMode, profile: true})}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                >
                  <Edit size={16} className="mr-2" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateData('profile')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save size={16} className="mr-2" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedData({...userData});
                      setEditMode({...editMode, profile: false});
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X size={16} className="mr-2" /> Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h3>
                {editMode.profile ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editedData.fullName}
                        onChange={(e) => setEditedData({...editedData, fullName: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Name</label>
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editedData.email}
                        onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editedData.phone}
                        onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.fullName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Preferred Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.name || "Not provided"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.phone}</dd>
                    </div>
                  </dl>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Additional Information</h3>
                {editMode.profile ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={editedData.dob}
                        onChange={(e) => setEditedData({...editedData, dob: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={editedData.gender}
                        onChange={(e) => setEditedData({...editedData, gender: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-Binary</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <input
                        type="text"
                        value={editedData.language}
                        onChange={(e) => setEditedData({...editedData, language: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                      <input
                        type="text"
                        value={editedData.occupation}
                        onChange={(e) => setEditedData({...editedData, occupation: e.target.value})}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={editedData.bio}
                        onChange={(e) => setEditedData({...editedData, bio: e.target.value})}
                        rows="3"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      ></textarea>
                    </div>
                  </div>
                ) : (
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.dob}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Gender</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.gender}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Language</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.language}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Occupation</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.occupation || "Not provided"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Bio</dt>
                      <dd className="mt-1 text-sm text-gray-900">{userData.bio || "Not provided"}</dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'situation':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#154360]">Current Situation</h2>
                {!editMode.details ? (
                  <button
                    onClick={() => setEditMode({...editMode, details: true})}
                    className="flex items-center bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit size={16} className="mr-2" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateData('details')}
                      className="flex items-center bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Save size={16} className="mr-2" /> Save
                    </button>
                    <button
                      onClick={() => {
                        setEditedData({...userData});
                        setEditMode({...editMode, details: false});
                      }}
                      className="flex items-center bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X size={16} className="mr-2" /> Cancel
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#154360] mb-3">Location Information</h3>
                  {editMode.details ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Location</label>
                        <input
                          type="text"
                          value={editedData.location}
                          onChange={(e) => setEditedData({...editedData, location: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Address</label>
                        <input
                          type="text"
                          value={editedData.address}
                          onChange={(e) => setEditedData({...editedData, address: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-gray-600 w-32 text-sm">Location:</span>
                        <span className="text-gray-800">{userData.location}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-32 text-sm">Address:</span>
                        <span className="text-gray-800">{userData.address || "Not provided"}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#154360] mb-3">Housing Status</h3>
                  {editMode.details ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Are you sleeping rough?</label>
                        <select
                          value={editedData.sleepingRough}
                          onChange={(e) => setEditedData({...editedData, sleepingRough: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">How long have you been homeless?</label>
                        <select
                          value={editedData.homelessDuration}
                          onChange={(e) => setEditedData({...editedData, homelessDuration: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Less than 1 week">Less than 1 week</option>
                          <option value="1-4 weeks">1-4 weeks</option>
                          <option value="1-3 months">1-3 months</option>
                          <option value="3-6 months">3-6 months</option>
                          <option value="6-12 months">6-12 months</option>
                          <option value="More than 1 year">More than 1 year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Who needs accommodation?</label>
                        <select
                          value={editedData.groupType}
                          onChange={(e) => {
                            const newGroupType = e.target.value;
                            
                            if (newGroupType === "Just myself") {
                              setEditedData({
                                ...editedData, 
                                groupType: newGroupType, 
                                groupSize: "",
                                childrenCount: ""
                              });
                            } else if (newGroupType !== "Myself and my family") {
                              setEditedData({
                                ...editedData, 
                                groupType: newGroupType,
                                childrenCount: ""
                              });
                            } else {
                              setEditedData({
                                ...editedData, 
                                groupType: newGroupType
                              });
                            }
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Just myself">Just myself</option>
                          <option value="Myself and partner">Myself and partner</option>
                          <option value="Myself and my family">Myself and my family</option>
                          <option value="Myself and a friend/relative">Myself and a friend/relative</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">How many people will come with you?</label>
                        <input
                          type="text"
                          value={editedData.groupSize}
                          onChange={(e) => {
                            
                            const value = e.target.value;
                            if (value === '' || /^[0-9]+$/.test(value)) {
                              setEditedData({...editedData, groupSize: value});
                            }
                          }}
                          disabled={editedData.groupType === "Just myself"}
                          className={`w-full border ${editedData.groupType === "Just myself" ? "bg-gray-100 text-gray-400" : ""} border-gray-300 rounded-md px-3 py-2`}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">How many children are with you?</label>
                        <input
                          type="text"
                          value={editedData.childrenCount}
                          onChange={(e) => {
                            
                            const value = e.target.value;
                            if (value === '' || /^[0-9]+$/.test(value)) {
                              setEditedData({...editedData, childrenCount: value});
                            }
                          }}
                          disabled={editedData.groupType !== "Myself and my family"}
                          className={`w-full border ${editedData.groupType !== "Myself and my family" ? "bg-gray-100 text-gray-400" : ""} border-gray-300 rounded-md px-3 py-2`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Sleeping rough:</span>
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-sm">{userData.sleepingRough}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Homeless duration:</span>
                        <span className="text-gray-800">{userData.homelessDuration}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Accommodation needs:</span>
                        <span className="text-gray-800">{userData.groupType}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Group size:</span>
                        {userData.groupType === "Just myself" ? (
                          <span className="text-gray-500">Not applicable</span>
                        ) : (
                          <span className="text-gray-800">{userData.groupSize || "Not specified"}</span>
                        )}
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Children count:</span>
                        {userData.groupType !== "Myself and my family" ? (
                          <span className="text-gray-500">Not applicable</span>
                        ) : (
                          <span className="text-gray-800">{userData.childrenCount || "Not specified"}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'housing':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#154360]">Housing Needs</h2>
                {!editMode.details ? (
                  <button
                    onClick={() => setEditMode({...editMode, details: true})}
                    className="flex items-center bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit size={16} className="mr-2" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateData('details')}
                      className="flex items-center bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Save size={16} className="mr-2" /> Save
                    </button>
                    <button
                      onClick={() => {
                        setEditedData({...userData});
                        setEditMode({...editMode, details: false});
                      }}
                      className="flex items-center bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X size={16} className="mr-2" /> Cancel
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#154360] mb-3">Accommodation Preferences</h3>
                  {editMode.details ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Shelter type needed</label>
                        <select
                          value={editedData.shelterType}
                          onChange={(e) => setEditedData({...editedData, shelterType: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Emergency (1-2 nights)">Emergency (1-2 nights)</option>
                          <option value="Short-term (few days/weeks)">Short-term (few days/weeks)</option>
                          <option value="Medium-term (1-6 months)">Medium-term (1-6 months)</option>
                          <option value="Long-term (6+ months)">Long-term (6+ months)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Security needed?</label>
                        <select
                          value={editedData.securityNeeded}
                          onChange={(e) => setEditedData({...editedData, securityNeeded: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option><option value="Not important">Not important</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Comfortable with communal living?</label>
                        <select
                          value={editedData.communalLiving}
                          onChange={(e) => setEditedData({...editedData, communalLiving: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Prefer not to">Prefer not to</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Women-only accommodation needed?</label>
                        <select
                          value={editedData.womenOnly}
                          onChange={(e) => setEditedData({...editedData, womenOnly: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Prefer">Prefer, but not essential</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">LGBTQ+ friendly accommodation needed?</label>
                        <select
                          value={editedData.lgbtqFriendly}
                          onChange={(e) => setEditedData({...editedData, lgbtqFriendly: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Prefer">Prefer, but not essential</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Shelter type:</span>
                        <span className="text-gray-800">{userData.shelterType}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Security needed:</span>
                        <span className="text-gray-800">{userData.securityNeeded}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Communal living:</span>
                        <span className="text-gray-800">{userData.communalLiving}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Women-only:</span>
                        <span className="text-gray-800">{userData.womenOnly}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">LGBTQ+ friendly:</span>
                        <span className="text-gray-800">{userData.lgbtqFriendly}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'support':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#154360]">Support Needs</h2>
                {!editMode.details ? (
                  <button
                    onClick={() => setEditMode({...editMode, details: true})}
                    className="flex items-center bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit size={16} className="mr-2" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateData('details')}
                      className="flex items-center bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Save size={16} className="mr-2" /> Save
                    </button><button
                      onClick={() => {
                        setEditedData({...userData});
                        setEditMode({...editMode, details: false});
                      }}
                      className="flex items-center bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X size={16} className="mr-2" /> Cancel
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#154360] mb-3">Support Services</h3>
                  {editMode.details ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Food assistance needed?</label>
                        <select
                          value={editedData.foodAssistance}
                          onChange={(e) => setEditedData({...editedData, foodAssistance: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Benefits help needed?</label>
                        <select
                          value={editedData.benefitsHelp}
                          onChange={(e) => setEditedData({...editedData, benefitsHelp: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Already receiving benefits">Already receiving benefits</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Mental health support needed?</label>
                        <select
                          value={editedData.mentalHealth}
                          onChange={(e) => setEditedData({...editedData, mentalHealth: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Substance use support needed?</label>
                        <select
                          value={editedData.substanceUse}
                          onChange={(e) => setEditedData({...editedData, substanceUse: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${userData.foodAssistance === "Yes" ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className="text-gray-700 text-sm">Food assistance</span>
                        <span className="ml-auto text-gray-800 text-sm">{userData.foodAssistance}</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          userData.benefitsHelp === "Yes" ? "bg-green-500" : 
                          userData.benefitsHelp === "Already receiving benefits" ? "bg-gray-300" : "bg-gray-300"
                        }`}></div>
                        <span className="text-gray-700 text-sm">Benefits help</span>
                        <span className="ml-auto text-gray-800 text-sm">{userData.benefitsHelp}</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${userData.mentalHealth === "Yes" ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className="text-gray-700 text-sm">Mental health support</span>
                        <span className="ml-auto text-gray-800 text-sm">{userData.mentalHealth}</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${userData.substanceUse === "Yes" ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className="text-gray-700 text-sm">Substance use support</span>
                        <span className="ml-auto text-gray-800 text-sm">{userData.substanceUse}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#154360] mb-3">Health Information</h3>
                  {editMode.details ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Medical conditions</label>
                        <textarea
                          value={editedData.medicalConditions}
                          onChange={(e) => setEditedData({...editedData, medicalConditions: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          rows="2"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Wheelchair access needed?</label>
                        <select
                          value={editedData.wheelchair}
                          onChange={(e) => setEditedData({...editedData, wheelchair: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Medical conditions:</span>
                        <span className="text-gray-800">{userData.medicalConditions || "None provided"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Wheelchair access:</span>
                        <span className="text-gray-800">{userData.wheelchair}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#154360] mb-3">Immigration & Benefits</h3>
                  {editMode.details ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Immigration status</label>
                        <select
                          value={editedData.immigrationStatus}
                          onChange={(e) => setEditedData({...editedData, immigrationStatus: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="UK Citizen">UK Citizen</option>
                          <option value="EU Pre-settled/Settled Status">EU Pre-settled/Settled Status</option>
                          <option value="Indefinite Leave to Remain">Indefinite Leave to Remain</option>
                          <option value="Limited Leave to Remain">Limited Leave to Remain</option>
                          <option value="Asylum Seeker">Asylum Seeker</option>
                          <option value="Refugee status">Refugee status</option>
                          <option value="No Recourse to Public Funds -NPRF-">No Recourse to Public Funds -NPRF-</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-600 text-sm mb-1">Benefits receiving</label>
                        <div className={`space-y-2 p-3 border border-gray-200 rounded-md bg-white ${editedData.benefitsHelp !== "Already receiving benefits" ? "opacity-50" : ""}`}>
                          {availableBenefits.map((benefit) => (
                            <div key={benefit} className="flex items-center">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editedData.benefits.includes(benefit)}
                                  onChange={() => toggleBenefit(benefit)}
                                  disabled={editedData.benefitsHelp !== "Already receiving benefits"}
                                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{benefit}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="text-gray-600 w-44 text-sm">Immigration status:</span>
                        <span className="text-gray-800">{userData.immigrationStatus}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Benefits receiving:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {userData.benefits.map((benefit, index) => (
                            <span key={index} className="bg-white border border-indigo-200 px-2 py-1 rounded-full text-gray-800 text-xs">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'applications':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#154360]">Shelter Applications</h2>
              <button className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm">
                <Home size={16} className="mr-2" /> New Application
              </button>
            </div>
            
            <div className="space-y-4">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <div key={app.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#154360]">{app.shelterName}</h3>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center">
                            <span className="text-gray-600 text-sm">Status:</span>
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                              app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="text-gray-600 text-sm">
                            Applied: {app.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 transition-colors text-sm"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-3">You haven't submitted any applications yet.</p>
                  <button className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
                    Find Shelters
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-[#154360] mb-3">Application Status Guide</h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center">
                  <Clock size={16} className="text-yellow-600 mr-2" />
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">Pending</span>
                  <span className="ml-2 text-gray-700 text-sm">Under review</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-green-600 mr-2" />
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">Approved</span>
                  <span className="ml-2 text-gray-700 text-sm">Accepted</span>
                </div>
                <div className="flex items-center">
                  <XCircle size={16} className="text-red-600 mr-2" />
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">Rejected</span>
                  <span className="ml-2 text-gray-700 text-sm">Not accepted</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'privacy':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-[#154360] mb-4">Privacy & Consent</h2>
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-sm mr-3 mt-0.5 flex items-center justify-center ${userData.terms ? "bg-green-500 text-white" : "bg-gray-300"}`}>
                      {userData.terms && "✓"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Terms & Conditions</span>
                      <p className="text-gray-600 text-sm mt-1">You have agreed to our terms and conditions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-sm mr-3 mt-0.5 flex items-center justify-center ${userData.dataConsent ? "bg-green-500 text-white" : "bg-gray-300"}`}>
                      {userData.dataConsent && "✓"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Data Processing</span>
                      <p className="text-gray-600 text-sm mt-1">You have consented to the processing of your personal data</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-sm mr-3 mt-0.5 flex items-center justify-center ${userData.contactConsent ? "bg-green-500 text-white" : "bg-gray-300"}`}>
                      {userData.contactConsent && "✓"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Contact Consent</span>
                      <p className="text-gray-600 text-sm mt-1">You have agreed to be contacted about your applications</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-[#154360] mb-3">System Information</h3>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-gray-600 w-32 text-sm">Profile Status:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-sm">{userData.status}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32 text-sm">Submitted:</span>
                    <span className="text-gray-800 text-sm">{formatDate(userData.submittedAt)}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-32 text-sm">Last Updated:</span>
                    <span className="text-gray-800 text-sm">{formatDate(userData.lastUpdated)}</span>
                  </div>
                </div>
              </div>
              

              <div className="mt-6 flex justify-center">
                <a 
                  href="/reset-password" 
                  className="flex items-center bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Lock size={18} className="mr-2" /> Reset Password
                </a>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{userData.fullName || 'Welcome'}</h1>
                <p className="text-sm text-gray-500">{userData.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Dashboard Navigation</h2>
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm ${
                      activeSection === item.id 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut size={18} className="mr-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Loading your dashboard...</p>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
