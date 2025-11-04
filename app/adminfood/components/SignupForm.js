"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
//state management and validation
export default function SignupForm({ onLoginClick }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    authType: "",
    authAnswer: "",
  });
  
  const [validations, setValidations] = useState({
    emailChecked: false,
    emailValid: false,
    emailChecking: false,
    passwordMinLength: false,
    passwordHasCapital: false,
    passwordHasNumber: false,
    passwordHasSymbol: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailTimeout, setEmailTimeout] = useState(null);

  const router = useRouter();

  //paswword validation
  useEffect(() => {
    const { password } = formData;
    setValidations(prev => ({
      ...prev,
      passwordMinLength: password.length >= 6,
      passwordHasCapital: /[A-Z]/.test(password),
      passwordHasNumber: /[0-9]/.test(password),
      passwordHasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    }));
  }, [formData.password]);

  //email validation
  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      setValidations(prev => ({ ...prev, emailChecking: true }));
      setEmailError("");
      if (emailTimeout) clearTimeout(emailTimeout);
      const timeout = setTimeout(() => {
        validateEmail(formData.email);
      }, 800);
      setEmailTimeout(timeout);
    } else {
      setValidations(prev => ({ 
        ...prev, 
        emailChecked: false,
        emailValid: false,
        emailChecking: false 
      }));
      setEmailError("");
    }
    
    return () => {
      if (emailTimeout) clearTimeout(emailTimeout);
    };
  }, [formData.email]);

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
      const isValid = !data.exists;
      
      setValidations(prev => ({
        ...prev,
        emailChecked: true,
        emailValid: isValid,
        emailChecking: false
      }));
      
      if (!isValid) {
        setEmailError("Email already registered");
      } else {
        setEmailError("");
      }
      
    } catch (error) {
      setValidations(prev => ({
        ...prev,
        emailChecked: true,
        emailValid: false,
        emailChecking: false
      }));
      setEmailError("Error checking email");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
    if (success) setSuccess("");
    if (name === "email" && emailError) {
      setEmailError("");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isPasswordValid = () => {
    return (
      validations.passwordMinLength &&
      validations.passwordHasCapital &&
      validations.passwordHasNumber &&
      validations.passwordHasSymbol
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.authType || !formData.authAnswer) {
      setError("Please complete all fields");
      return;
    }
    if (!isPasswordValid()) {
      setError("Password does not meet all requirements");
      return;
    }
    if (!validations.emailValid && validations.emailChecked) {
      setEmailError("Email already registered");
      return;
    }
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/adminfood-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          email: formData.email,
          password: formData.password,
          authType: formData.authType,
          authAnswer: formData.authAnswer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
      setSuccess("Registration successful!");
      localStorage.setItem("email", formData.email);
      setFormData({
        email: "",
        password: "",
        authType: "",
        authAnswer: "",
      });
      
      setTimeout(() => {
        router.push("/adminfood/registraion");
      }, 2000);
    }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-8 text-black">
        FoodBank Signup
      </h2>
      {success && (
        <div className="p-3 bg-green-100 text-green-600 rounded-lg text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none text-black ${
                !formData.email ? "border-gray-300" :
                validations.emailChecking ? "border-yellow-400" :
                validations.emailValid ? "border-green-500" : "border-red-500"
              }`}
              required
              suppressHydrationWarning={true}/>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {validations.emailChecking ? (
                <div className="h-5 w-5 border-t-2 border-b-2 border-yellow-400 rounded-full animate-spin"></div>
              ) : formData.email && validations.emailChecked ? (
                validations.emailValid ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  <FaTimes className="text-red-500" />
                )
              ) : null}
            </div>
          </div>
          {emailError && (
            <p className="text-xs text-red-600 mt-1">
              {emailError}
            </p>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Set a password"
              className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none text-black ${
                !formData.password ? "border-gray-300" :
                isPasswordValid() ? "border-green-500" : "border-red-500" }`}
              required
              suppressHydrationWarning={true}/>
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              suppressHydrationWarning={true}>
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
        
        <div>
          <select
            name="authType"
            value={formData.authType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
            required
            suppressHydrationWarning={true}>
            <option value="">Select authentication question</option>
            <option value="date">Memorable date</option>
            <option value="place">Memorable place</option>
            <option value="pet">First pet's name</option>
            <option value="mother">Mother's maiden name</option>
            <option value="school">First school you attended</option>
          </select>
        </div>
        
        {formData.authType === "date" ? (
          <div>
            <input
              type="date"
              name="authAnswer"
              value={formData.authAnswer}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
              required
              suppressHydrationWarning={true} />
          </div>
        ) : formData.authType ? (
          <div>
            <input
              type="text"
              name="authAnswer"
              value={formData.authAnswer}
              onChange={handleChange}
              placeholder={`Enter your ${
                formData.authType === "place" ? "memorable place" : 
                formData.authType === "pet" ? "first pet's name" :
                formData.authType === "mother" ? "mother's maiden name" :
                formData.authType === "school" ? "first school" : "" }`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
              required
              suppressHydrationWarning={true}/>
          </div>
        ) : null}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          suppressHydrationWarning={true}>
          {loading ? "Processing..." : "Submit"}
        </button>
        
        <div className="text-center mt-6">
          <span className="text-gray-600">Already have an account? </span>
          <button
            type="button"
            onClick={onLoginClick}
            className="text-blue-500 hover:text-blue-600 font-medium"
            suppressHydrationWarning={true}>
            LOGIN
          </button>
        </div>
      </form>
    </div>
  );
}