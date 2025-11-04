"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaFacebook, FaLinkedin, FaEye, FaEyeSlash } from "react-icons/fa";



export default function LoginForm({ onSignupClick, onForgotClick }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
//eye logo in password feild
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  //login function->dashboard
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/adminfood-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "login",
          email,
          password
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("userEmail", email);
        router.push("/adminfood/dashboards");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
//login form UI design
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-8 text-black">
        LOGIN
      </h2>
      {error && (
        <div className="text-red-500 text-sm text-center mb-4">
          {error}
        </div>
      )}
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
          suppressHydrationWarning={true}/>
      </div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-black"
          suppressHydrationWarning={true}/>
        <button
          type="button"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-black"
          suppressHydrationWarning={true}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input 
            type="checkbox" 
            className="mr-2 accent-blue-500" 
            suppressHydrationWarning={true}/>
          <span className="text-sm text-gray-800">Remember me?</span>
        </label>
        <button
          onClick={onForgotClick}
          className="text-sm text-blue-500 hover:text-black"
          suppressHydrationWarning={true}>
          Forgot Password?
        </button>
      </div>
      <button 
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-500 text-white-500 py-3 rounded-lg hover:bg-blue-600 text-white transition-colors"
        suppressHydrationWarning={true}>
        {loading ? "Verifying..." : "LOGIN"}
      </button>

     
      <div className="text-center mt-6">
        <span className="text-gray-800">Need an account? </span>
        <button
          onClick={onSignupClick}
          className="text-blue-500 hover:text-blue-600 font-medium"
          suppressHydrationWarning={true}>
          SIGN UP
        </button>
      </div>
    </div>
  );
}