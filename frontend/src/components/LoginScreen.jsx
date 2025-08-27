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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Shield className="w-14 h-14 text-emerald-400 drop-shadow-xl animate-pulse" />
            <MessageSquare className="w-14 h-14 text-emerald-400 drop-shadow-xl" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            Quantum Chat
          </h1>
          <p className="text-slate-300 text-lg">
            Secure real-time communication with quantum encryption
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-8 shadow-xl border border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Join the Network
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-slate-200 mb-2"
              >
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-600/50 shadow-inner transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-slate-200 mb-2"
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
                  className="flex-1 px-4 py-3 bg-slate-700/70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 border border-slate-600/50 shadow-inner transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={generateRandomId}
                  className="px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-all duration-200 shadow hover:shadow-md"
                  title="Generate random ID"
                >
                  🎲
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Choose a unique identifier for your session
              </p>
            </div>

            <button
              type="submit"
              disabled={!displayName.trim() || !userId.trim()}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white py-3 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              <LogIn className="w-5 h-5" />
              <span>Connect to Quantum Network</span>
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security Features</span>
            </h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• End-to-end encryption with quantum key distribution</li>
              <li>• Automatic eavesdropper detection (BB84 protocol)</li>
              <li>• Session keys generated using quantum mechanics</li>
              <li>• Perfect forward secrecy for all conversations</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
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
