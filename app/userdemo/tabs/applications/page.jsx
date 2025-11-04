'use client';
import { useState } from 'react';
import { 
  Search, Building2, CheckCircle, XCircle, Clock, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Download, Eye, RefreshCw, AlertCircle, Calendar,
  MessageSquare, FileText, User
} from 'lucide-react';
import { FaFileAlt, FaEye, FaDownload } from 'react-icons/fa';

export default function ApplicationsTab() {
  const [searchEmail, setSearchEmail] = useState('');
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchApplications = async (email, showRefreshIndicator = false) => {
    if (!email) return;
    
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/applications?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications');
      }
      
      setApplications(data.applications || []);
      applyFilters(data.applications || [], statusFilter);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch applications. Please try again.');
      setApplications([]);
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchApplications(searchEmail);
  };

  const applyFilters = (apps, status) => {
    let filtered = [...apps];
    
    if (status !== 'all') {
      filtered = filtered.filter(app => app.status === status);
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'oldest':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'name-az':
          return a.shelterName.localeCompare(b.shelterName);
        case 'name-za':
          return b.shelterName.localeCompare(a.shelterName);
        default:
          return new Date(b.submittedAt) - new Date(a.submittedAt);
      }
    });
    
    setFilteredApplications(filtered);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} years ago`;
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'waitlisted':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);

  const DocumentsSection = ({ documents }) => {
    if (!documents || documents.length === 0) {
      return (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Submitted Documents</h3>
          <p className="text-gray-500">No documents submitted yet.</p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Submitted Documents</h3>
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <FaFileAlt className="text-blue-500 text-xl" />
                <div>
                  <p className="font-medium text-gray-900">{doc.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {doc.documentType} • {formatDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(doc.url, '_blank')}
                  className="p-2 text-blue-500 hover:text-blue-600"
                  title="View Document"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => window.open(doc.url, '_blank')}
                  className="p-2 text-blue-500 hover:text-blue-600"
                  title="Download Document"
                >
                  <FaDownload />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-sm text-gray-600">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Applications</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (selectedApplication) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedApplication(null)}
            className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            <ChevronLeft size={16} className="mr-1" /> Back to Applications
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center"
            >
              <Download size={14} className="mr-1" /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white lg:col-span-2 rounded-xl shadow-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedApplication.shelterName}
                </h2>
                <div className="flex items-center mt-2">
                  <span className={getStatusBadge(selectedApplication.status)}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 ml-3">
                    ID: {selectedApplication._id}
                  </span>
                </div>
              </div>
            </div>

                        <div className="space-y-6">
                            <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-gray-800">{selectedApplication.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="text-gray-800">{selectedApplication.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-gray-800">{selectedApplication.dob}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Language</p>
                    <p className="text-gray-800">{selectedApplication.language}</p>
                  </div>
                </div>
              </div>

                            <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Application Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Application Type</p>
                    <p className="text-gray-800">{selectedApplication.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Urgency Level</p>
                    <p className="text-gray-800">{selectedApplication.urgency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Location</p>
                    <p className="text-gray-800">{selectedApplication.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sleeping Rough</p>
                    <p className="text-gray-800">{selectedApplication.sleepingRough}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration of Homelessness</p>
                    <p className="text-gray-800">{selectedApplication.homelessDuration}</p>
                  </div>
                </div>
              </div>

                            <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Group Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Group Type</p>
                    <p className="text-gray-800">{selectedApplication.groupType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Group Size</p>
                    <p className="text-gray-800">{selectedApplication.groupSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Number of Children</p>
                    <p className="text-gray-800">{selectedApplication.childrenCount}</p>
                  </div>
                </div>
              </div>

                            <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Accommodation History
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Previous Accommodation</p>
                    <p className="text-gray-800">{selectedApplication.previousAccommodation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reason for Leaving</p>
                    <p className="text-gray-800">{selectedApplication.reasonForLeaving}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Preferred Shelter Type</p>
                    <p className="text-gray-800">{selectedApplication.shelterType}</p>
                  </div>
                </div>
              </div>

                            <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Requirements & Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Security Needed</p>
                    <p className="text-gray-800">{selectedApplication.securityNeeded}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Curfew Preference</p>
                    <p className="text-gray-800">{selectedApplication.curfew}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Communal Living</p>
                    <p className="text-gray-800">{selectedApplication.communalLiving}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Smoking</p>
                    <p className="text-gray-800">{selectedApplication.smoking}</p>
                  </div>
                </div>
              </div>

                            <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Support Needs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Food Assistance</p>
                    <p className="text-gray-800">{selectedApplication.foodAssistance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Benefits Help</p>
                    <p className="text-gray-800">{selectedApplication.benefitsHelp}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mental Health Support</p>
                    <p className="text-gray-800">{selectedApplication.mentalHealth}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Substance Use Support</p>
                    <p className="text-gray-800">{selectedApplication.substanceUse}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Social Services</p>
                    <p className="text-gray-800">{selectedApplication.socialServices}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Domestic Abuse Support</p>
                    <p className="text-gray-800">{selectedApplication.domesticAbuse}</p>
                  </div>
                </div>
              </div>

                            <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Health & Accessibility
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Medical Conditions</p>
                    <p className="text-gray-800">{selectedApplication.medicalConditions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Wheelchair Access</p>
                    <p className="text-gray-800">{selectedApplication.wheelchair}</p>
                  </div>
                </div>
              </div>

                            <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Benefits & Immigration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Immigration Status</p>
                    <p className="text-gray-800">{selectedApplication.immigrationStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Benefits</p>
                    <p className="text-gray-800">
                      {Array.isArray(selectedApplication.benefits) 
                        ? selectedApplication.benefits.join(', ') 
                        : selectedApplication.benefits}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Local Connection</p>
                    <p className="text-gray-800">
                      {Array.isArray(selectedApplication.localConnection)
                        ? selectedApplication.localConnection.join(', ')
                        : selectedApplication.localConnection}
                    </p>
                  </div>
                </div>
              </div>

                            <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  Special Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Care Leaver</p>
                    <p className="text-gray-800">{selectedApplication.careLeaver}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Veteran</p>
                    <p className="text-gray-800">{selectedApplication.veteran}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Women Only Services</p>
                    <p className="text-gray-800">{selectedApplication.womenOnly}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">LGBTQ+ Friendly</p>
                    <p className="text-gray-800">{selectedApplication.lgbtqFriendly}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Support Workers</p>
                    <p className="text-gray-800">{selectedApplication.supportWorkers}</p>
                  </div>
                  {selectedApplication.supportWorkerDetails && (
                    <div>
                      <p className="text-sm text-gray-500">Support Worker Details</p>
                      <p className="text-gray-800">{selectedApplication.supportWorkerDetails}</p>
                    </div>
                  )}
                </div>
              </div>

                            {selectedApplication.pets === 'Yes' && (
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="text-md font-semibold text-gray-700 mb-3">
                    Pet Information
                  </h3>
                  <p className="text-gray-800">{selectedApplication.petDetails || 'Details not provided'}</p>
                </div>
              )}

                            <DocumentsSection documents={selectedApplication.documents} />
            </div>
          </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4">
                Application Timeline
              </h3>
              <div className="relative border-l-2 border-gray-300 ml-3 pl-6 space-y-6">
                <div className="relative">
                  <div className="absolute -left-8 w-4 h-4 rounded-full bg-blue-500 border-4 border-white"></div>
                  <p className="text-sm font-medium text-gray-800">Application Submitted</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(selectedApplication.submittedAt)} ({getTimeSince(selectedApplication.submittedAt)})
                  </p>
                </div>
                
                {selectedApplication.status !== 'pending' && (
                  <div className="relative">
                    <div className={`absolute -left-8 w-4 h-4 rounded-full border-4 border-white ${
                      selectedApplication.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <p className="text-sm font-medium text-gray-800">
                      Application {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(selectedApplication.lastUpdated)} ({getTimeSince(selectedApplication.lastUpdated)})
                    </p>
                  </div>
                )}
              </div>
            </div>

                        <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-left flex items-center">
                  <MessageSquare className="mr-3 text-blue-500" size={16} />
                  <span className="text-gray-800">Contact Shelter</span>
                </button>
                
                <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-left flex items-center">
                  <FileText className="mr-3 text-purple-500" size={16} />
                  <span className="text-gray-800">Upload Documents</span>
                </button>
                
                <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-left flex items-center">
                  <Calendar className="mr-3 text-green-500" size={16} />
                  <span className="text-gray-800">Schedule Visit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
            <form onSubmit={handleSearch} className="mb-8">
        <div className="max-w-md mx-auto">
          <label htmlFor="email-search" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your email to view applications
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                id="email-search"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {applications.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchEmail
              ? 'No applications were found for this email address'
              : 'Enter your email address to view your applications'}
          </p>
        </div>
      ) : (
        <>
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    applyFilters(applications, e.target.value);
                  }}
                  className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    applyFilters(applications, statusFilter);
                  }}
                  className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Date (Newest First)</option>
                  <option value="oldest">Date (Oldest First)</option>
                  <option value="name-az">Shelter Name (A-Z)</option>
                  <option value="name-za">Shelter Name (Z-A)</option>
                </select>
              </div>

              <button
                onClick={() => fetchApplications(searchEmail, true)}
                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors ml-auto"
                disabled={isRefreshing}
              >
                <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

                        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shelter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map(application => (
                      <tr key={application._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                              <Building2 size={16} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {application.shelterName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(application.status)}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{formatDate(application.submittedAt)}</div>
                          <div className="text-xs opacity-70">{getTimeSince(application.submittedAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button 
                            onClick={() => setSelectedApplication(application)}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg text-xs"
                          >
                            <Eye size={12} className="mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

                        {filteredApplications.length > itemsPerPage && (
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(filteredApplications.length, indexOfFirstItem + 1)}-{Math.min(indexOfLastItem, filteredApplications.length)} of {filteredApplications.length} applications
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-lg flex items-center ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <ChevronLeft size={16} />
                    <span className="ml-1">Previous</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredApplications.length / itemsPerPage)))}
                    disabled={currentPage >= Math.ceil(filteredApplications.length / itemsPerPage)}
                    className={`px-3 py-1 rounded-lg flex items-center ${
                      currentPage >= Math.ceil(filteredApplications.length / itemsPerPage)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="mr-1">Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 