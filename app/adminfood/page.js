"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

export default function AdminFood() {
  const [currentForm, setCurrentForm] = useState("login");
  const [direction, setDirection] = useState(0);

  const handleFormSwitch = (form) => {
    setDirection(form === "login" ? -1 : 1);
    setCurrentForm(form);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-[800px] h-[500px] flex overflow-hidden">
        <div className="w-1/2 pr-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Safe Haven
          </h1>
          <p className="text-gray-600">
            Join our community to help those in need.</p>
          
        </div>

        
        <div className="w-1/2 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentForm}
              initial={{ x: 100 * direction, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100 * direction, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 w-full">
              {currentForm === "login" && (
                <LoginForm 
                  onSignupClick={() => handleFormSwitch("signup")}
                  onForgotClick={() => handleFormSwitch("forgot")}/>
              )}
              {currentForm === "signup" && (
                <SignupForm 
                  onLoginClick={() => handleFormSwitch("login")}/>
              )}
              {currentForm === "forgot" && (
                <ForgotPasswordForm 
                  onBackClick={() => handleFormSwitch("login")}/>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}