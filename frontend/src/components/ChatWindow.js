import React, { useState, useEffect, useRef } from "react";
import { Send, Shield, Key, ArrowLeft, Lock } from "lucide-react";

const ChatWindow = ({
  session,
  messages,
  onSendMessage,
  onEndSession,
  decryptMessage,
}) => {
  const [messageText, setMessageText] = useState("");
  const [decryptedMessages, setDecryptedMessages] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Decrypt messages as they arrive
  useEffect(() => {
    const decryptNewMessages = async () => {
      const newDecryptions = {};

      for (const message of messages) {
        if (!decryptedMessages[message.id]) {
          try {
            const decrypted = await decryptMessage(message.encryptedMessage);
            newDecryptions[message.id] = decrypted;
          } catch (err) {
            newDecryptions[message.id] = "[Decryption Failed]";
          }
        }
      }

      if (Object.keys(newDecryptions).length > 0) {
        setDecryptedMessages((prev) => ({ ...prev, ...newDecryptions }));
      }
    };

    if (messages.length > 0) {
      decryptNewMessages();
    }
  }, [messages, decryptMessage, decryptedMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText("");
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg quantum-border flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={onEndSession}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-quantum-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {session.chatPartner.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold">{session.chatPartner}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <Shield className="w-3 h-3 text-security-500" />
              <span>Quantum Secured</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Key className="w-3 h-3" />
            <span>Key: {session.keyFingerprint}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="w-12 h-12 text-security-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-security-400 mb-2">
              Secure Channel Established
            </h4>
            <p className="text-gray-400 text-sm">
              Your conversation is now protected by quantum encryption.
              <br />
              Start typing to send your first secure message.
            </p>
            <div className="mt-4 p-3 bg-gray-700 rounded-lg inline-block">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <Shield className="w-3 h-3 text-security-500" />
                <span>End-to-end encrypted with QKD</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isOwnMessage
                    ? "bg-quantum-600 text-white ml-auto quantum-glow"
                    : "bg-gray-700 text-white"
                }`}
              >
                {!message.isOwnMessage && (
                  <div className="text-xs text-gray-400 mb-1">
                    {message.senderName}
                  </div>
                )}
                <div className="break-words">
                  {decryptedMessages[message.id] || (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                      <span className="text-xs">Decrypting...</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-300 mt-1 opacity-70">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-700"
      >
        <div className="flex space-x-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your secure message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-quantum-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="quantum-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
        <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>Messages are encrypted with quantum-generated keys</span>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
