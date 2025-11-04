'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Home, ArrowLeft, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ApplicationConfirmationPage() {
  const [applications, setApplications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem('formData');
    if (storedData) {
      const { data: userData } = JSON.parse(storedData);
      setApplications(userData.selectedShelters || []);
    }
  }, []);

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleViewApplications = () => {
    router.push('/shelterPortal/my-applications');
  };

  return (
    <main className="flex-grow bg-gradient-to-b from-[#F8FAFC] to-white py-12 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-[#154360] mb-2">Applications Submitted Successfully!</h1>
            <p className="text-[#2E5984]">
              Your applications have been sent to {applications.length} shelter{applications.length !== 1 ? 's' : ''}.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-[#F8FAFC] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#154360] mb-4">What happens next?</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-500 text-sm font-semibold">1</span>
                  </div>
                  <p className="text-[#2E5984]">The shelters will review your application within 24-48 hours.</p>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-500 text-sm font-semibold">2</span>
                  </div>
                  <p className="text-[#2E5984]">You'll receive notifications about the status of your applications.</p>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-500 text-sm font-semibold">3</span>
                  </div>
                  <p className="text-[#2E5984]">Shelters may contact you directly for additional information or to arrange a visit.</p>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleViewApplications}
                className="flex-1 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] hover:from-[#2E5984] hover:to-[#154360] text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>View My Applications</span>
              </button>
              <button
                onClick={() => router.push('/userdashboard')}
                className="flex-1 bg-gradient-to-r from-[#3B82C4] to-[#1A5276] hover:from-[#2E5984] hover:to-[#154360] text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </button>
              <button
                onClick={handleReturnHome}
                className="flex-1 bg-white hover:bg-[#F8FAFC] text-[#3B82C4] px-6 py-3 rounded-xl transition-all duration-300 border border-[#3B82C4] flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
} 