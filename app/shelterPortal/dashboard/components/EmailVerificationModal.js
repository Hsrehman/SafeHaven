import { useState } from 'react';

const EmailVerificationModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  darkMode, 
  newEmail,
  isLoading,
  error 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setLocalError('Please enter verification code');
      return;
    }
    setLocalError('');
    onVerify(verificationCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${
        darkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white'
        } p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}
      >
        <h3 className={`text-xl font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Verify Your New Email
        </h3>
        <p className={`mb-6 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          A verification code has been sent to <span className="font-medium">{newEmail}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              className={`w-full p-3 rounded-md border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {(localError || error) && (
              <p className="mt-2 text-red-500 text-sm">
                {localError || error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]`}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailVerificationModal; 