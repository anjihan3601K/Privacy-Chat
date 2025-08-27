import React, { useState } from "react";
import { MessageSquare, Shield, User, LogIn } from "lucide-react";

const LoginScreen = ({ onLogin }) => {
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (displayName.trim() && userId.trim()) {
      onLogin(userId.trim(), displayName.trim());
    }
  };

  const generateRandomId = () => {
    const randomId = Math.random().toString(36).substr(2, 9);
    setUserId(randomId);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-12 h-12 text-quantum-400 animate-pulse" />
            <MessageSquare className="w-12 h-12 text-quantum-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Quantum Chat</h1>
          <p className="text-gray-400">
            Secure real-time communication with quantum encryption
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-lg p-8 quantum-border">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Join the Network
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-quantum-500 border border-gray-600"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                User ID
              </label>
              <div className="flex space-x-2">
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter unique user ID"
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-quantum-500 border border-gray-600"
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomId}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  title="Generate random ID"
                >
                  🎲
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Choose a unique identifier for your session
              </p>
            </div>

            <button
              type="submit"
              disabled={!displayName.trim() || !userId.trim()}
              className="w-full quantum-button py-3 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              <span>Connect to Quantum Network</span>
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-quantum-400 mb-2 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security Features</span>
            </h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• End-to-end encryption with quantum key distribution</li>
              <li>• Automatic eavesdropper detection (BB84 protocol)</li>
              <li>• Session keys generated using quantum mechanics</li>
              <li>• Perfect forward secrecy for all conversations</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>
            This is a demonstration of quantum cryptography concepts.
            <br />
            Real quantum communication requires specialized hardware.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
