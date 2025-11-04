"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import logger from '@/app/utils/logger';
import { sanitizeData } from '@/app/utils/sanitizer';


const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.3 } };
const buttonHover = { scale: 1.02, transition: { duration: 0.2 } };
const buttonTap = { scale: 0.98, transition: { duration: 0.1 } };

const ErrorMessage = ({ error }) => (
  <AnimatePresence>
    {error && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-500 text-sm mt-1 ml-2">{error}</motion.p>}
  </AnimatePresence>
);

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", otp: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        logger.dev('Google script loaded, origin:', window.location.origin);
        window.google?.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: handleGoogleResponse,
          error_callback: (error) => {
            logger.error(error, 'Google OAuth Error');
            setErrors({ general: 'Failed to authenticate with Google' });
          }
        });
      };

      script.onerror = (error) => {
        logger.error(error, 'Google Script Loading');
      };
    };

    loadGoogleScript();
  }, []);

  const handleGoogleResponse = async (tokenResponse) => {
    try {
      setIsLoading(true);
      
      if (tokenResponse.error) {
        throw new Error(tokenResponse.error);
      }

      const res = await fetch('/api/shelterAdmin/google-auth', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          access_token: tokenResponse.access_token 
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (data.success) {
        if (data.message === "complete_registration") {
          router.push(`/shelterPortal/register?email=${data.email}&name=${data.name}&provider=google`);
        } else if (data.message === "Enter OTP") {
          setShowOTP(true);
        } else {
          router.push("/shelterPortal/dashboard"); 
        }
      } else {
        setErrors({ general: data.message || 'Google authentication failed' });
      }
    } catch (error) {
      logger.error(error, 'Google Auth Response');
      setErrors({ general: 'Failed to authenticate with Google' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (!window.google?.accounts?.oauth2) {
      logger.error(new Error('Google Sign-In not initialized'), 'Login - handleGoogleClick');
      return;
    }
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: handleGoogleResponse,
      });
      tokenClient.requestAccessToken();
    } catch (error) {
      logger.error(error, 'Google Click Handler');
      setErrors({ general: 'Failed to initialize Google Sign-In' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.password) newErrors.password = "Password is required";
    if (showOTP && !formData.otp) newErrors.otp = "OTP is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    setIsLoading(true);
    try {
      logger.dev('Login attempt:', sanitizeData({ email: formData.email }));
      
      const response = await fetch("/api/shelterAdmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
        credentials: 'include'
      });
      const data = await response.json();
      
      logger.dev('Login response:', sanitizeData(data));
      
      if (response.ok) {
        setErrors({});
        if (data.message === "Enter OTP") {
          setShowOTP(true);
        } else {
          window.location.href = "/shelterPortal/dashboard";
        }
      } else {
        setErrors({ general: data.message || "Login failed" });
      }
    } catch (error) {
      logger.error(error, 'Login Page');
      setErrors({ general: "An error occurred while logging in" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      logger.dev('OTP Submission:', sanitizeData({ otp: formData.otp }));
      
      const response = await fetch("/api/shelterAdmin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          otp: formData.otp,
          email: formData.email 
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      logger.dev('OTP Response:', sanitizeData(data));
      
      if (response.ok) {
        setErrors({});
        window.location.href = "/shelterPortal/dashboard";
      } else {
        setErrors({ general: data.message || "OTP verification failed" });
      }
    } catch (error) {
      logger.error(error, 'Login Page - OTP Verification');
      setErrors({ general: "An error occurred during OTP verification" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ general: "Enter your email first" });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/shelterAdmin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
        credentials: 'include'
      });
      
      const data = await response.json();
      if (response.ok) {
        
        router.push(`/shelterPortal/reset-password?email=${encodeURIComponent(formData.email)}`);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      setErrors({ general: "Error sending reset code" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/shelterAdmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("New OTP has been sent to your email");
    } catch (error) {
      setErrors({ general: error.message || "Failed to resend OTP" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 sm:p-12">
      <div className="max-w-6xl mx-auto">
        {showOTP && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <button 
              onClick={() => {
                setShowOTP(false);
                setErrors({});
              }}
              className="group inline-flex items-center text-gray-600 hover:text-gray-900 mb-12 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back
            </button>
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative">
          <div className="max-w-5xl mx-auto">
            <motion.div className="text-center mb-16" variants={fadeIn} initial="initial" animate="animate">
              <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">Welcome Back</h2>
              <p className="mt-4 text-gray-600">Sign in to continue to your account</p>
            </motion.div>
            <div className="flex justify-between items-start gap-24">
              <motion.div className="flex-1 max-w-md" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
                <form onSubmit={showOTP ? handleOTPSubmit : handleSubmit} className="space-y-8">
                  {errors.general && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-500 text-sm mt-1 ml-2">{errors.general}</motion.p>}
                  {!showOTP ? (
                    <>
                      <motion.div variants={fadeIn}>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="relative group">
                          <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={`appearance-none block w-full px-4 py-3 pl-12 ${errors.email ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"} rounded-2xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300`} placeholder="you@example.com" />
                          <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                        </div>
                        <ErrorMessage error={errors.email} />
                      </motion.div>
                      <motion.div variants={fadeIn}>
                        <div className="flex justify-between items-center mb-2">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200">{showPassword ? "Hide" : "Show"}</button>
                        </div>
                        <div className="relative group">
                          <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={formData.password} onChange={handleChange} className={`appearance-none block w-full px-4 py-3 pl-12 ${errors.password ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"} rounded-2xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300`} placeholder="••••••••" />
                          {showPassword ? (
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                          ) : (
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                          )}
                        </div>
                        <ErrorMessage error={errors.password} />
                      </motion.div>
                    </>
                  ) : (
                    <motion.div variants={fadeIn}>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                      <div className="relative group">
                        <input id="otp" name="otp" type="text" value={formData.otp} onChange={handleChange} className={`appearance-none block w-full px-4 py-3 pl-12 ${errors.otp ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"} rounded-2xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-blue-300`} placeholder="123456" />
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                      </div>
                      <ErrorMessage error={errors.otp} />
                      <button
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    </motion.div>
                  )}
                  <motion.button type="submit" disabled={isLoading} whileHover={buttonHover} whileTap={buttonTap} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5`}>
                    {isLoading ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {showOTP ? "Verifying..." : "Signing in..."}
                      </motion.div>
                    ) : (showOTP ? "Verify OTP" : "Sign in")}
                  </motion.button>
                  {!showOTP && (
                    <motion.button type="button" onClick={handleForgotPassword} disabled={isLoading} whileHover={buttonHover} whileTap={buttonTap} className="w-full flex justify-center py-3 px-4 text-sm font-medium text-blue-600 hover:text-blue-800 transition-all duration-300">
                      Forgot Password?
                    </motion.button>
                  )}
                </form>
              </motion.div>
              <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                <div className="h-24 w-px bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200"></div>
                <div className="relative px-4 py-2">
                  <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-600">OR</span>
                </div>
                <div className="h-24 w-px bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200"></div>
              </motion.div>
              <motion.div 
                className="flex-1 max-w-md space-y-4" 
                variants={fadeIn} 
                initial="initial" 
                animate="animate" 
                style={{ marginTop: '4.5rem' }}
                transition={{ delay: 0.4 }}
              >
                {["Google", "Email"].map((provider, index) => (
                  <motion.button 
                    key={provider} 
                    whileHover={buttonHover} 
                    whileTap={buttonTap} 
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium text-gray-700 bg-white/50 backdrop-blur-sm hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
                    onClick={() => {
                      if (provider === "Email") {
                        router.push("/shelterPortal/register");
                      } else if (provider === "Google") {
                        handleGoogleClick();
                      }
                    }}
                  >
                    {provider === "Google" && <FcGoogle className="w-5 h-5 mr-2" />}
                    {provider === "Email" && <Mail className="w-5 h-5 mr-2" />}
                    {provider === "Email" ? "Sign up with email" : `Continue with ${provider}`}
                  </motion.button>
                ))}
              </motion.div>
            </div>
            <motion.div className="mt-12 text-center space-y-4" variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.5 }}>
              <Link href="/cant-login" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Can't log in?</Link>
              <div className="text-xs text-gray-500">
                Secure login with reCAPTCHA subject to Google
                <Link href="/terms" className="text-gray-600 hover:text-blue-600 ml-1 transition-colors duration-200">Terms</Link>
                {" & "}
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Privacy</Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}