import React from "react";
import { AlertTriangle, X } from "lucide-react";

const ErrorModal = ({ error, onClose }) => {
  if (!error) return null;

  const isSecurityError =
    error.toLowerCase().includes("eavesdropper") ||
    error.toLowerCase().includes("security") ||
    error.toLowerCase().includes("qkd");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-danger-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle
              className={`w-6 h-6 ${
                isSecurityError ? "text-danger-500" : "text-yellow-500"
              }`}
            />
            <h3 className="text-lg font-semibold text-white">
              {isSecurityError ? "Security Alert" : "Error"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">{error}</p>

        {isSecurityError && (
          <div className="bg-danger-900 border border-danger-500 rounded-lg p-3 mb-4">
            <p className="text-sm text-danger-200">
              <strong>Security Notice:</strong> The quantum key distribution
              process detected a potential security breach. This connection has
              been terminated to protect your communication.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            isSecurityError ? "danger-button" : "quantum-button"
          }`}
        >
          Understood
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
