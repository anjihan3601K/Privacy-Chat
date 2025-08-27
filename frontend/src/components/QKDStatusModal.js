import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, X } from "lucide-react";

const QKDStatusModal = ({ qkdStatus, onAccept, onReject }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!!qkdStatus);
  }, [qkdStatus]);

  if (!qkdStatus || !isVisible) return null;

  const handleAccept = () => {
    onAccept(qkdStatus.sessionId);
    setIsVisible(false);
  };

  const handleReject = () => {
    onReject(qkdStatus.sessionId);
    setIsVisible(false);
  };

  const renderContent = () => {
    switch (qkdStatus.type) {
      case "incoming_request":
        return (
          <div className="text-center">
            <Shield className="w-16 h-16 text-quantum-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold mb-4">
              Quantum Key Exchange Request
            </h3>
            <p className="text-gray-300 mb-6">
              <span className="font-semibold text-quantum-400">
                {qkdStatus.fromUser}
              </span>{" "}
              wants to start a secure quantum chat session with you.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              This will establish end-to-end encryption using quantum key
              distribution (BB84 protocol).
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleAccept}
                className="security-button flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept & Start QKD</span>
              </button>
              <button
                onClick={handleReject}
                className="danger-button flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        );

      case "outgoing_request":
        return (
          <div className="text-center">
            <Shield className="w-16 h-16 text-quantum-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold mb-4">QKD Request Sent</h3>
            <p className="text-gray-300 mb-4">
              Waiting for{" "}
              <span className="font-semibold text-quantum-400">
                {qkdStatus.targetUser}
              </span>{" "}
              to accept the quantum key exchange...
            </p>
            <div className="inline-flex items-center space-x-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        );

      case "performing":
        return (
          <div className="text-center">
            <Shield className="w-16 h-16 text-quantum-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-bold mb-4">
              Performing Quantum Key Distribution
            </h3>
            <p className="text-gray-300 mb-4">{qkdStatus.message}</p>
            <div className="quantum-connection h-2 rounded-full mb-4"></div>
            <p className="text-sm text-gray-400">
              Exchanging quantum states and detecting potential eavesdroppers...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 quantum-border">
        {renderContent()}
      </div>
    </div>
  );
};

export default QKDStatusModal;
