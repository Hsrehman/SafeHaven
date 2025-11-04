"use client";
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";

export default function ForgotPasswordForm({ onBackClick }) {
  const [email, setEmail] = useState("");
  const [authAnswer, setAuthAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailTimeout, setEmailTimeout] = useState(null);
  const [userData, setUserData] = useState(null);
  const [validations, setValidations] = useState({
    passwordMinLength: false,
    passwordHasCapital: false,
    passwordHasNumber: false,
    passwordHasSymbol: false,
    passwordsMatch: false
  });

  useEffect(() => {
    setValidations(prev => ({
      ...prev,
      passwordMinLength: newPassword.length >= 6,
      passwordHasCapital: /[A-Z]/.test(newPassword),
      passwordHasNumber: /[0-9]/.test(newPassword),
      passwordHasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
      passwordsMatch: newPassword === confirmPassword && newPassword !== ""
    }));
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    if (email && email.includes('@')) {
      if (emailTimeout) clearTimeout(emailTimeout);
      const timeout = setTimeout(() => {
        validateEmail(email);
      }, 800);
      setEmailTimeout(timeout);
    } else {
      setEmailError("");
    }
    
    return () => {
      if (emailTimeout) clearTimeout(emailTimeout);
    };
  }, [email]);

  const validateEmail = async (email) => {
    try {
      const response = await fetch("/api/adminfood/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!data.exists) {
        setEmailError("Email not registered");
      } else {
        setEmailError("");
      }
    } catch (error) {
      setEmailError("Error checking email");
    }
  };

  const isPasswordValid = () => {
    return (
      validations.passwordMinLength &&
      validations.passwordHasCapital &&
      validations.passwordHasNumber &&
      validations.passwordHasSymbol
    );
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (emailError) {
      return;
    }
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch('/api/adminfood-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'forgotPassword',
          email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email not found');
      }

      setUserData(data.user);
      setMessage("Email verified successfully");
      setTimeout(() => {
        setCurrentStep(2);
        setMessage("");
      }, 1000);
      
    } catch (error) {
      setError(error.message || "Failed to verify email");
    } finally {
      setIsLoading(false);
    }
  };
//security question and answer
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch('/api/adminfood/verify-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          authAnswer
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setMessage("Authentication successful");
      
      setTimeout(() => {
        setCurrentStep(3);
        setMessage("");
      }, 1000);
      
    } catch (error) {
      setError(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid() || !validations.passwordsMatch) {
      setError("Please ensure passwords meet all requirements and match");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch('/api/adminfood/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      setMessage("Password reset successful!");
      setTimeout(() => onBackClick(), 2000);
    } catch (error) {
      setError(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-8">Forgot Password</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-600 rounded">
          {message}
        </div>
      )}
      
      {currentStep === 1 && (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div className="space-y-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                emailError ? "border-red-500" : "border-gray-300 focus:border-blue-500"
              }`}
              required
              suppressHydrationWarning={true}
            />
            {emailError && (
              <p className="text-xs text-red-600 mt-1">
                {emailError}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || emailError}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            suppressHydrationWarning={true}>
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
          
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={onBackClick}
              className="text-blue-500 hover:text-blue-600 font-medium"
              suppressHydrationWarning={true}>
              Back to Login
            </button>
          </div>
        </form>
      )}
      
      {currentStep === 2 && (
        <form onSubmit={handleAuthSubmit} className="space-y-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Please answer your security question:
            </p>
            <p className="font-medium text-black">
              {userData && userData.authType ? (
                userData.authType === "date" ? "Your memorable date" :
                userData.authType === "place" ? "Your memorable place" :
                userData.authType === "pet" ? "Your first pet's name" :
                userData.authType === "mother" ? "Your mother's maiden name" :
                userData.authType === "school" ? "Your first school" : 
                "Your security question"
              ) : "Your security question"}
            </p>
          </div>
          
          {userData && userData.authType === "date" ? (
            <input
              type="date"
              value={authAnswer}
              onChange={(e) => setAuthAnswer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
              suppressHydrationWarning={true}/>
            
          ) : (
            <input
              type="text"
              value={authAnswer}
              onChange={(e) => setAuthAnswer(e.target.value)}
              placeholder="Enter your answer"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
              suppressHydrationWarning={true}/>
            
          )}
          
          <button
            type="submit"
            disabled={isLoading || !authAnswer}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            suppressHydrationWarning={true}>
            {isLoading ? "Verifying..." : "Verify Answer"}
          </button>
          
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-blue-500 hover:text-blue-600 font-medium"
              suppressHydrationWarning={true}>
            
              Back to Email
            </button>
          </div>
        </form>
      )}
      
      {currentStep === 3 && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="space-y-1">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none ${
                  !newPassword ? "border-gray-300" :
                  isPasswordValid() ? "border-green-500" : "border-red-500"
                }`}
                required
                suppressHydrationWarning={true}/>
             
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                suppressHydrationWarning={true} >
             
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className={`flex items-center ${validations.passwordMinLength ? "text-green-500" : "text-gray-500"}`}>
                {validations.passwordMinLength ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                At least 6 characters
              </div>
              <div className={`flex items-center ${validations.passwordHasCapital ? "text-green-500" : "text-gray-500"}`}>
                {validations.passwordHasCapital ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                One capital letter
              </div>
              <div className={`flex items-center ${validations.passwordHasNumber ? "text-green-500" : "text-gray-500"}`}>
                {validations.passwordHasNumber ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                One number
              </div>
              <div className={`flex items-center ${validations.passwordHasSymbol ? "text-green-500" : "text-gray-500"}`}>
                {validations.passwordHasSymbol ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                One special character
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none ${
                  !confirmPassword ? "border-gray-300" :
                  validations.passwordsMatch ? "border-green-500" : "border-red-500"
                }`}
                required
                suppressHydrationWarning={true}/>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                suppressHydrationWarning={true}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {confirmPassword && !validations.passwordsMatch && (
              <p className="text-xs text-red-600 mt-1">
                Passwords do not match
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !isPasswordValid() || !validations.passwordsMatch}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            suppressHydrationWarning={true}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
          
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-blue-500 hover:text-blue-600 font-medium"
              suppressHydrationWarning={true}>
              Back to Security Question
            </button>
          </div>
        </form>
      )}
    </div>
  );
}