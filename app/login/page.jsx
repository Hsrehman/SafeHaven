"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const handleSelectLoginType = (type) => {
    switch (type) {
      case 'user':
        router.push('/login/user');
        break;
      case 'shelter':
        router.push('/shelterPortal/login');
        break;
      case 'foodbank':

        router.push('/adminfood');

        router.push('/adminfood ');

        break;
      default:
        router.push('/login/user');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full space-y-16">
        <div className="text-center pt-8">
          <Link href="/">
            <div className="mx-auto h-16 w-auto cursor-pointer mb-12">
              <Image 
                src="/logo.png" 
                alt="Safe Haven Logo" 
                width={150}
                height={150}
                className="mx-auto"
                priority
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{display: 'none', textAlign: 'center', fontWeight: 'bold', fontSize: '2rem', color: '#0066CC'}}>
                Safe Haven
              </div>
            </div>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Choose Login Type</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please select your account type
          </p>
        </div>

        {/* Login Type Selection - Cards with redirect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 px-8">
          <button
            className="flex flex-col items-center justify-center p-8 rounded-lg border-2 transition-all shadow-sm hover:shadow-md border-gray-200 hover:border-blue-300"
            onClick={() => handleSelectLoginType('user')}
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-lg font-medium">User Login</span>
            <p className="text-sm text-gray-500 mt-2">Access your personal account</p>
          </button>

          <button
            className="flex flex-col items-center justify-center p-8 rounded-lg border-2 transition-all shadow-sm hover:shadow-md border-gray-200 hover:border-blue-300"
            onClick={() => handleSelectLoginType('shelter')}
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-lg font-medium">Shelter Admin Login</span>
            <p className="text-sm text-gray-500 mt-2">Manage your shelter listings</p>
          </button>

          <button
            className="flex flex-col items-center justify-center p-8 rounded-lg border-2 transition-all shadow-sm hover:shadow-md border-gray-200 hover:border-blue-300"
            onClick={() => handleSelectLoginType('foodbank')}
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-lg font-medium">Foodbank Admin Login</span>
            <p className="text-sm text-gray-500 mt-2">Manage your food resources</p>
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
