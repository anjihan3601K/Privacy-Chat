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
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-full p-5 inline-block mb-5">
              <Shield className="w-16 h-16 text-emerald-400 mx-auto animate-pulse drop-shadow-xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              Quantum Key Exchange Request
            </h3>
            <p className="text-slate-200 mb-6 text-lg">
              <span className="font-semibold text-emerald-400">
                {qkdStatus.fromUser}
              </span>{" "}
              wants to start a secure quantum chat session with you.
            </p>
            <p className="text-slate-300 mb-6 bg-slate-700/50 px-4 py-3 rounded-lg">
              This will establish end-to-end encryption using quantum key
              distribution (BB84 protocol).
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleAccept}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-3 rounded-lg transition-all duration-200 shadow hover:shadow-lg flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Accept & Start QKD</span>
              </button>
              <button
                onClick={handleReject}
                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-5 py-3 rounded-lg transition-all duration-200 shadow hover:shadow-lg flex items-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        );

      case "outgoing_request":
        return (
          <div className="text-center">
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-full p-5 inline-block mb-5">
              <Shield className="w-16 h-16 text-emerald-400 mx-auto animate-pulse drop-shadow-xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              QKD Request Sent
            </h3>
            <p className="text-slate-200 mb-6 text-lg">
              Waiting for{" "}
              <span className="font-semibold text-emerald-400">
                {qkdStatus.targetUser}
              </span>{" "}
              to accept the quantum key exchange...
            </p>
            <div className="inline-flex items-center space-x-2 text-amber-400">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce shadow-lg"></div>
              <div
                className="w-3 h-3 bg-amber-400 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-amber-400 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        );

      case "performing":
        return (
          <div className="text-center">
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-full p-5 inline-block mb-5">
              <Shield className="w-16 h-16 text-emerald-400 mx-auto animate-spin drop-shadow-xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              Performing Quantum Key Distribution
            </h3>
            <p className="text-slate-200 mb-5 text-lg">{qkdStatus.message}</p>
            <div className="h-2 rounded-full mb-5 bg-slate-700/50 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 animate-pulse rounded-full w-3/4"></div>
            </div>
            <p className="text-slate-300 bg-slate-700/50 px-4 py-3 rounded-lg">
              Exchanging quantum states and detecting potential eavesdroppers...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800/90 rounded-xl p-8 max-w-md w-full mx-4 border border-slate-700/50 shadow-2xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default QKDStatusModal;
