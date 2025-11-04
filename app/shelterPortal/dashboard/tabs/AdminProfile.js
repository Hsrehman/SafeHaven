'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Shield, Edit, 
  Save, Key, LogOut, AlertCircle, CheckCircle 
} from 'lucide-react';
import logger from '@/app/utils/logger';
import EmailVerificationModal from '@/app/shelterPortal/dashboard/components/EmailVerificationModal';

const AdminProfile = ({ userData, darkMode }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    adminName: userData?.adminName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    role: userData?.role || 'Admin'
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingEmailUpdate, setPendingEmailUpdate] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(userData?.twoFactorEnabled || false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);

  useEffect(() => {
    setIs2FAEnabled(userData?.twoFactorEnabled || false);
  }, [userData?.twoFactorEnabled]);

  useEffect(() => {
    console.log('userData updated:', userData?.twoFactorEnabled);
  }, [userData?.twoFactorEnabled]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.adminName.trim()) newErrors.adminName = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (formData.phone && !/^07\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Invalid UK mobile number format (e.g., 07123456789)";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    
    const isEmailChange = formData.email !== userData.email;

    setIsLoading(true);
    try {
      const response = await fetch('/api/shelterAdmin/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (isEmailChange) {
        setPendingEmailUpdate(formData.email);
        setShowVerificationModal(true);
        
        setFormData(prev => ({ ...prev, email: userData.email }));
      } else {
        setSuccessMessage('Profile updated successfully');
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (verificationCode) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shelterAdmin/verify-email-change', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify({ verificationCode })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      
      setFormData(prev => ({ ...prev, email: pendingEmailUpdate }));
      
      setSuccessMessage('Email updated successfully');
      setShowVerificationModal(false);
      setPendingEmailUpdate(null);
      setIsEditing(false);
      
      
      router.refresh();
    } catch (error) {
      setErrors(prev => ({ ...prev, verification: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEmailChange = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shelterAdmin/verify-email-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'cancel' })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel email change');
      }

      setShowVerificationModal(false);
      setPendingEmailUpdate(null);
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setIsLoading(false);
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
        logger.error(new Error('Logout failed'), 'Admin Profile - handleLogout');
      }
    } catch (error) {
      logger.error(error, 'Admin Profile - handleLogout');
    }
  };

  const navigateToChangePassword = () => {
    router.push('/shelterPortal/change-password');
  };

  const handle2FAToggle = async () => {
    setIsUpdating2FA(true);
    const newState = !is2FAEnabled;
    
    try {
      const response = await fetch('/api/shelterAdmin/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ twoFactorEnabled: newState })
      });

      const data = await response.json();
      console.log('2FA Update Response:', data);
      
      if (response.ok) {
        
        setIs2FAEnabled(newState);
        
        
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to update 2FA settings');
      }
    } catch (error) {
      console.error('2FA Toggle Error:', error);
      alert('Failed to update two-factor authentication settings');
      setIs2FAEnabled(!newState);
    } finally {
      setIsUpdating2FA(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Admin Profile
          </h1>
          <div>
            <button
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              className={`px-4 py-2 rounded-lg mr-2 ${
                isEditing 
                  ? (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300') 
                  : (darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')
              } ${darkMode ? 'text-white' : isEditing ? 'text-gray-700' : 'text-white'} font-medium flex items-center`}
            >
              {isEditing ? (
                <>
                  <Edit size={16} className="mr-2" /> Cancel
                </>
              ) : (
                <>
                  <Edit size={16} className="mr-2" /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>
        
        
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-200 flex items-center text-green-800">
            <CheckCircle size={18} className="mr-2 text-green-600" />
            {successMessage}
          </div>
        )}
        
        
        {errors.form && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-200 flex items-center text-red-800">
            <AlertCircle size={18} className="mr-2 text-red-600" />
            {errors.form}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6 lg:col-span-2`}>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                <div className={`w-24 h-24 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-[#3B82C4]'} flex items-center justify-center text-white text-4xl font-bold`}>
                  {userData?.adminName ? userData.adminName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex-1">
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                    {userData?.adminName || 'Admin User'}
                  </h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 flex items-center`}>
                    <Mail size={16} className="mr-2" />
                    {userData?.email || 'No email provided'}
                  </p>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 flex items-center`}>
                    <Phone size={16} className="mr-2" />
                    {userData?.phone || 'No phone provided'}
                  </p>
                  <div className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-3`}>
                    {userData?.isVerified ? (
                      <span className="flex items-center">
                        <CheckCircle size={16} className="mr-1" /> Verified Account
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-500">
                        <AlertCircle size={16} className="mr-1" /> Email verification required
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                    </div>
                    <input
                      type="text"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full py-2 px-3 border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } rounded-lg ${
                        errors.adminName 
                          ? 'border-red-500' 
                          : darkMode 
                            ? 'border-gray-600' 
                            : 'border-gray-300'
                      } ${
                        !isEditing 
                          ? darkMode 
                            ? 'bg-gray-800 cursor-not-allowed' 
                            : 'bg-gray-100 cursor-not-allowed' 
                          : ''
                      }`}
                    />
                  </div>
                  {errors.adminName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.adminName}
                    </p>
                  )}
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`pl-10 w-full py-2 px-3 border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } rounded-lg ${
                        errors.email 
                          ? 'border-red-500' 
                          : darkMode 
                            ? 'border-gray-600' 
                            : 'border-gray-300'
                      } ${
                        !isEditing 
                          ? darkMode 
                            ? 'bg-gray-800 cursor-not-allowed' 
                            : 'bg-gray-100 cursor-not-allowed' 
                          : ''
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="07123456789"
                      className={`pl-10 w-full py-2 px-3 border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } rounded-lg ${
                        errors.phone 
                          ? 'border-red-500' 
                          : darkMode 
                            ? 'border-gray-600' 
                            : 'border-gray-300'
                      } ${
                        !isEditing 
                          ? darkMode 
                            ? 'bg-gray-800 cursor-not-allowed' 
                            : 'bg-gray-100 cursor-not-allowed' 
                          : ''
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield size={16} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                    </div>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={true} 
                      className={`pl-10 w-full py-2 px-3 border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } rounded-lg ${
                        darkMode 
                          ? 'bg-gray-800 cursor-not-allowed' 
                          : 'bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <option value="admin">Administrator</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Role changes require administrator approval
                  </p>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-2 ${
                      darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white rounded-lg font-medium flex items-center`}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
          
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
              Account Actions
            </h3>
            <div className="space-y-4">
              <button
                onClick={navigateToChangePassword}
                className={`w-full px-4 py-3 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } rounded-lg font-medium text-left flex items-center`}
              >
                <Key size={18} className={`mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>Change Password</span>
              </button>
              
              <button
                onClick={() => setShowConfirmDialog(true)}
                className={`w-full px-4 py-3 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } rounded-lg font-medium text-left flex items-center justify-between`}
              >
                <div className="flex items-center">
                  <Shield size={18} className={`mr-3 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>Two-Factor Authentication</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer
                    ${is2FAEnabled ? 'bg-purple-500' : 'bg-gray-300'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmDialog(true);
                    }}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out
                      ${is2FAEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </div>
                </div>
              </button>
              
              <button
                onClick={handleLogout}
                className={`w-full px-4 py-3 ${
                  darkMode ? 'bg-red-900 hover:bg-red-800' : 'bg-red-100 hover:bg-red-200'
                } rounded-lg font-medium text-left flex items-center`}
              >
                <LogOut size={18} className={`mr-3 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                <span className={darkMode ? 'text-white' : 'text-gray-800'}>Logout</span>
              </button>
            </div>
            
            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                Account Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Account ID:</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
                    {userData?.id || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Shelter ID:</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
                    {userData?.shelterId || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Status:</span>
                  <span className={`${userData?.isVerified 
                    ? (darkMode ? 'text-green-400' : 'text-green-600') 
                    : (darkMode ? 'text-yellow-400' : 'text-yellow-600')}`}>
                    {userData?.isVerified ? 'Active' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={handleCancelEmailChange}
        onVerify={handleVerifyEmail}
        darkMode={darkMode}
        newEmail={pendingEmailUpdate}
        isLoading={isLoading}
        error={errors.verification}
      />
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          } p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
            <h3 className="text-xl font-semibold mb-4">
              {is2FAEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication?
            </h3>
            <p className="mb-6">
              {is2FAEnabled 
                ? 'This will remove the OTP requirement during login. Are you sure?'
                : 'This will require an OTP code during every login. Continue?'
              }
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handle2FAToggle}
                disabled={isUpdating2FA}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating2FA ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProfile;