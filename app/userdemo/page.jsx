'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';


const DocumentsTab = dynamic(() => import('./tabs/documents/page'));
const ApplicationsTab = dynamic(() => import('./tabs/applications/page'));

export default function UserDemoDashboard() {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
            </div>
                    </div>
                  </div>

        
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
                              <button 
              onClick={() => setActiveTab('documents')}
              className={`${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Document Requests
                        </button>
                        <button
              onClick={() => setActiveTab('applications')}
              className={`${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Applications
                        </button>
          </nav>
            </div>
            
        
        <div className="mt-6">
          {activeTab === 'documents' ? (
            <DocumentsTab />
          ) : (
            <ApplicationsTab />
          )}
        </div>
      </div>
    </div>
  );
} 