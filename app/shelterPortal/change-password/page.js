"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Key } from "lucide-react";
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';

const getPasswordStrength = password => {
  if (!password) return { score: 0, label: '', color: 'gray', criteria: [] }

  let score = 0
  const criteria = [
    { test: /.{8,}/, label: 'Minimum 8 characters' },
    { test: /[A-Z]/, label: 'One uppercase letter' },
    { test: /[a-z]/, label: 'One lowercase letter' },
    { test: /[0-9]/, label: 'One number' },
    { test: /[!@#$%^&*]/, label: 'One special character (!@#$%^&*)' },
  ]
  const met = criteria.map(c => c.test.test(password))
  
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[!@#$%^&*]/.test(password)) score += 1

  let label, color
  if (score <= 2) {
    label = 'Weak'
    color = 'red'
  } else if (score <= 4) {
    label = 'Medium'
    color = 'orange'
  } else if (score <= 5) {
    label = 'Strong'
    color = 'green'
  } else {
    label = 'Very Strong'
    color = 'emerald'
  }

  return {
    score,
    label,
    color,
    criteria: criteria.map((c, i) => ({ label: c.label, met: met[i] })),
  }
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    currentPassword: "",
    newPassword: "", 
    confirmPassword: "" 
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, criteria: [] });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (name === 'newPassword') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!formData.newPassword) newErrors.newPassword = "New password is required";
    if (passwordStrength.score < 3) newErrors.newPassword = "Password is too weak. Please meet all the criteria shown below.";
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      logger.dev('Password change attempt:', sanitizeData({ email: formData.email }));
      
      const response = await fetch('/api/shelterAdmin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      router.push('/shelterPortal/login');
    } catch (error) {
      logger.error(error, 'Change Password Page - handleSubmit');
      setErrors({ form: error.message || 'Failed to change password' });
    } finally {
      setIsLoading(false);
    }
  };

  const getColorValue = () => {
    if (!passwordStrength) return '#d1d5db'
    if (passwordStrength.color === 'red') return '#ff4444'
    if (passwordStrength.color === 'orange') return '#ff9933'
    if (passwordStrength.color === 'green') return '#33ff33'
    if (passwordStrength.color === 'emerald') return '#00ff99'
    return '#d1d5db'
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl bg-white shadow-xl border border-gray-100"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Changed Successfully!</h2>
            <p className="text-gray-600 mb-6">Your password has been updated.</p>
            <button
              onClick={() => router.push("/shelterPortal/dashboard")}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] text-white font-medium rounded-xl transition-colors duration-300 hover:from-[#1F6A91] hover:to-[#0C374A]"
            >
              Return to Dashboard
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => router.push("/shelterPortal/dashboard")}
          className="flex items-center text-[#3B82C4] hover:text-[#1A5276] mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Change Your Password</h2>
            <p className="text-gray-600 mt-1">Enter your current and new password</p>
          </div>
          
          <div className="p-8">
            {errors.form && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl">
                {errors.form}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-5 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82C4] focus:border-[#1A5276] transition-all duration-300 ${
                      errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    } bg-gray-50`}
                    placeholder="Enter your current password"
                  />
                </div>
                {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl overflow-hidden" style={{
                      border: `2px solid ${getColorValue()}`,
                      boxShadow: `0 0 20px ${getColorValue()}, inset 0 0 15px ${getColorValue()}, 0 0 30px ${getColorValue()}20`,
                      transition: 'all 0.3s ease',
                    }}>
                    </div>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full px-5 py-3 pl-12 border rounded-xl focus:outline-none transition-all duration-300 ${
                        errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      } bg-gray-50 relative z-10`}
                      placeholder="Create a strong password"
                    />
                  </div>
                </div>
                {passwordStrength.criteria?.length > 0 && (
                  <ul className="text-sm space-y-1 mt-2">
                    {passwordStrength.criteria.map((c, i) => (
                      <li key={i} className={c.met ? 'text-green-600' : 'text-gray-600'}>
                        ✓ {c.label}
                      </li>
                    ))}
                  </ul>
                )}
                {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-5 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82C4] focus:border-[#1A5276] transition-all duration-300 ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    } bg-gray-50`}
                    placeholder="Confirm your new password"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] text-white font-medium rounded-xl transition-all duration-300 hover:from-[#1F6A91] hover:to-[#0C374A] ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                } transform hover:-translate-y-0.5`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </main>
  );
} 