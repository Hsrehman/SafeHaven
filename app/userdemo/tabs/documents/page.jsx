'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, FileText, Send, Upload, CheckCircle, X, Clock, RefreshCw, AlertTriangle, Info } from 'lucide-react';

export default function DocumentsTab() {
  const [showNotification, setShowNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [documentRequests, setDocumentRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [requestForm, setRequestForm] = useState({
    documentType: '',
    files: []
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [userData, setUserData] = useState({
    id: "user123",
    email: "demo@example.com",
    name: "Demo User"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("No requests yet");
  const fileInputRef = useRef(null);

  
  const fetchDocumentRequests = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching document requests...");
      const response = await fetch(`/api/document-requests`);
      const data = await response.json();
      
      console.log("API Response:", data);
      setDebugInfo(`Last checked: ${new Date().toLocaleTimeString()}, Found: ${data.requests?.length || 0} requests`);
      
      if (response.ok) {
        const allRequests = data.requests || [];
        setDocumentRequests(allRequests);
        
        
        const requestNotifications = allRequests
          .filter(req => req.status === 'pending')
          .map(req => ({
            id: req._id,
            type: 'document_request',
            status: 'pending',
            timestamp: req.requestedAt,
            details: {
              requestId: req._id,
              applicationId: req.applicationId,
              shelterName: req.shelterName,
              documentTypes: req.documentTypes.map(doc => ({
                type: doc.type,
                description: doc.description
              })),
              message: req.message || "Please upload the required documents"
            }
          }));
        
        setNotifications(requestNotifications);
      }
    } catch (error) {
      console.error('Failed to fetch document requests', error);
      setDebugInfo(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  
  const uploadDocumentsForRequest = async (requestId, applicationId) => {
    try {
      if (uploadedFiles.length === 0) {
        alert('Please upload at least one document');
        return;
      }
      
      const formData = new FormData();
      formData.append('applicationId', applicationId);
      formData.append('requestId', requestId);
      formData.append('userEmail', userData.email);
      
      uploadedFiles.forEach(file => {
        formData.append('files', file.actualFile);
        formData.append('documentTypes', file.documentType);
      });
      
      setIsLoading(true);
      
      const response = await fetch('/api/document-uploads', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload documents');
      }
      
      setNotifications(prev => prev.filter(notif => 
        !(notif.type === 'document_request' && notif.details.requestId === requestId)
      ));
      
      setSelectedRequest(null);
      setUploadedFiles([]);
      setRequestForm({ documentType: '' });
      
      
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center z-50';
      successMessage.innerHTML = `
        <span class="flex-shrink-0 mr-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </span>
        <span>Documents uploaded successfully!</span>
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 4000);
      
      fetchDocumentRequests();
      
    } catch (error) {
      console.error('Failed to upload documents', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentRequests();
    
    let refreshInterval;
    if (isAutoRefreshEnabled) {
      refreshInterval = setInterval(fetchDocumentRequests, 10000);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAutoRefreshEnabled]);

  const handleNotificationClick = () => {
    setShowNotification(!showNotification);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (!requestForm.documentType) {
        alert('Please select a document type before uploading files');
        return;
      }
      const newFiles = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        documentType: requestForm.documentType,
        actualFile: file
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRequestResponse = (notification) => {
    setSelectedRequest(notification);
    setRequestForm(prev => ({
      ...prev,
      documentType: notification.details.documentTypes[0]?.type || ''
    }));
    setShowNotification(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Auto-refresh</span>
            <button
              onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAutoRefreshEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAutoRefreshEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <button 
            onClick={fetchDocumentRequests}
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 ${
              isLoading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } rounded-lg transition-colors duration-200`}
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>

          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors relative"
            >
              <Bell size={20} className="text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            
                        {showNotification && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                    <Bell size={18} className="mr-2 text-blue-500" />
                    Notifications
                  </h3>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Info size={24} className="text-gray-400 mb-2" />
                      <p className="text-gray-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-500" />
                          <span className="font-medium">{notif.details.shelterName || 'Shelter'} needs documents</span>
                        </div>
                        
                        {notif.details.message && (
                          <p className="text-sm text-gray-600 mt-2 bg-blue-50 p-2 rounded">
                            {notif.details.message}
                          </p>
                        )}
                        
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {new Date(notif.timestamp).toLocaleString()}
                          </span>
                          <button 
                            onClick={() => handleRequestResponse(notif)}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                          >
                            Respond
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

            {selectedRequest && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 bg-white rounded-full overflow-hidden border border-blue-200 flex items-center justify-center text-blue-500">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Document Request from {selectedRequest.details.shelterName || 'Shelter'}
                </h3>
                <p className="text-sm text-gray-500">
                  Requested on {new Date(selectedRequest.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRequest(null)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
                    {selectedRequest.details.message && (
            <div className="mb-5 bg-white p-4 rounded-lg border-l-4 border-blue-400 shadow-sm">
              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                <Info size={16} className="mr-2 text-blue-500" />
                Message from {selectedRequest.details.shelterName || 'Shelter'}
              </h4>
              <p className="text-gray-700">{selectedRequest.details.message}</p>
            </div>
          )}
          
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 shadow-sm">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center">
              <FileText size={16} className="mr-2 text-blue-500" />
              Required Documents
            </h4>
            <div className="space-y-2">
              {selectedRequest.details.documentTypes.map((doc, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md border-l-4 border-blue-400">
                  <p className="font-medium text-gray-800">{doc.type}</p>
                  {doc.description && (
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
                    <div className="mb-5">
            <h4 className="font-medium text-gray-700 mb-4 flex items-center">
              <Upload size={16} className="mr-2 text-blue-500" />
              Submit Your Documents
            </h4>
            
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-4">
              <label className="block text-gray-700 font-medium mb-2 flex items-center">
                <span>Step 1: Select Document Type</span>
              </label>
              <select
                value={requestForm.documentType}
                onChange={(e) => setRequestForm({ ...requestForm, documentType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select document type</option>
                {selectedRequest.details.documentTypes.map((doc, index) => (
                  <option key={index} value={doc.type}>
                    {doc.type}
                  </option>
                ))}
              </select>
            </div>
            
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-gray-700 font-medium flex items-center">
                  <span>Step 2: Choose Files</span>
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                    !requestForm.documentType 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                  disabled={!requestForm.documentType}
                >
                  <Upload size={16} />
                  <span>Browse Files</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
              </div>
              
              {uploadedFiles.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.documentType} • {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg text-center bg-gray-50">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {requestForm.documentType 
                      ? 'Click "Browse Files" to upload documents' 
                      : 'Please select a document type first'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
                    <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setSelectedRequest(null)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => uploadDocumentsForRequest(
                selectedRequest.details.requestId,
                selectedRequest.details.applicationId
              )}
              disabled={uploadedFiles.length === 0 || isLoading}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                uploadedFiles.length === 0 || isLoading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Documents</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

            <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText size={20} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Document Requests</h2>
        </div>
        
        {notifications.filter(n => n.type === 'document_request' && n.details.documentTypes).length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Document Requests</h3>
              <p className="text-sm text-gray-500 mb-6 mx-4">
                When a shelter needs additional documents for your application, their requests will appear here
              </p>
              <button
                onClick={fetchDocumentRequests}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                Check for Requests
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {notifications
              .filter(n => n.type === 'document_request' && n.details.documentTypes)
              .map(notif => (
                <div key={notif.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="border-b border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center text-blue-500">
                          <FileText size={18} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {notif.details.shelterName || 'Shelter'} needs documents
                          </h3>
                          <p className="text-xs text-gray-500">
                            Requested on {new Date(notif.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock size={14} className="mr-1" />
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                                        {notif.details.message && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700 border-l-4 border-blue-300">
                        {notif.details.message}
                      </div>
                    )}
                    
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Info size={14} className="mr-1.5 text-blue-500" />
                        Required Documents:
                      </h4>
                      <div className="space-y-2">
                        {notif.details.documentTypes.map((doc, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">
                            <span className="font-medium text-gray-800">{doc.type}</span>
                            {doc.description && (
                              <p className="mt-1 text-xs text-gray-600">{doc.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRequestResponse(notif)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Send size={16} />
                        Respond to Request
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
} 