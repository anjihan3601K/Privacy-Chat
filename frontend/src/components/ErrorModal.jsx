import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ErrorModal = ({ error, onClose }) => {
  if (!error) return null;

  const isSecurityError =
    error.toLowerCase().includes("eavesdropper") ||
    error.toLowerCase().includes("security") ||
    error.toLowerCase().includes("qkd");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800/90 rounded-xl p-6 max-w-md w-full mx-4 border border-rose-500/70 shadow-xl shadow-rose-500/20">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center space-x-3">
            <AlertTriangle
              className={`w-7 h-7 ${
                isSecurityError ? "text-rose-500" : "text-amber-500"
              }`}
            />
            <h3 className="text-xl font-bold text-white">
              {isSecurityError ? "Security Alert" : "Error"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all duration-200 bg-slate-700/50 p-1.5 rounded-lg hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-200 mb-6 text-lg">{error}</p>

        {isSecurityError && (
          <div className="bg-gradient-to-r from-rose-500/10 to-rose-700/10 border border-rose-500/30 rounded-lg p-4 mb-5">
            <p className="text-rose-200">
              <strong>Security Notice:</strong> The quantum key distribution
              process detected a potential security breach. This connection has
              been terminated to protect your communication.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            isSecurityError
              ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl"
              : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          Understood
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
