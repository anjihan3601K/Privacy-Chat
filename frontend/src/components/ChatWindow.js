import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Shield,
  Key,
  ArrowLeft,
  Lock,
  Image,
  Paperclip,
} from "lucide-react";

const ChatWindow = ({
  session,
  messages,
  onSendMessage,
  onSendImage,
  onEndSession,
  decryptMessage,
  decryptImage,
}) => {
  const [messageText, setMessageText] = useState("");
  const [decryptedMessages, setDecryptedMessages] = useState({});
  const [decryptedImages, setDecryptedImages] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Decrypt messages and images as they arrive
  useEffect(() => {
    const decryptNewContent = async () => {
      const newDecryptions = {};
      const newImageDecryptions = {};

      for (const message of messages) {
        if (message.type === "chat" && !decryptedMessages[message.id]) {
          try {
            const decrypted = await decryptMessage(message.encryptedMessage);
            newDecryptions[message.id] = decrypted;
          } catch (err) {
            newDecryptions[message.id] = "[Decryption Failed]";
          }
        } else if (message.type === "image" && !decryptedImages[message.id]) {
          try {
            const decrypted = await decryptImage(message.encryptedImage);
            newImageDecryptions[message.id] = decrypted;
          } catch (err) {
            newImageDecryptions[message.id] = {
              error: "Failed to decrypt image",
            };
          }
        }
      }

      if (Object.keys(newDecryptions).length > 0) {
        setDecryptedMessages((prev) => ({ ...prev, ...newDecryptions }));
      }

      if (Object.keys(newImageDecryptions).length > 0) {
        setDecryptedImages((prev) => ({ ...prev, ...newImageDecryptions }));
      }
    };

    if (messages.length > 0) {
      decryptNewContent();
    }
  }, [
    messages,
    decryptMessage,
    decryptImage,
    decryptedMessages,
    decryptedImages,
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText("");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        onSendImage({
          data: event.target.result,
          filename: file.name,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    e.target.value = "";
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
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
                  {message.type === "image" ? (
                    // Image message
                    decryptedImages[message.id] ? (
                      decryptedImages[message.id].error ? (
                        <div className="text-red-400 text-xs">
                          {decryptedImages[message.id].error}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <img
                            src={`data:${
                              decryptedImages[message.id].file_type
                            };base64,${decryptedImages[message.id].image_data}`}
                            alt={decryptedImages[message.id].filename}
                            className="max-w-full rounded-lg shadow-lg"
                            style={{ maxHeight: "300px" }}
                          />
                          <div className="text-xs text-gray-400">
                            📷 {decryptedImages[message.id].filename}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Image className="w-4 h-4 animate-pulse" />
                        <span className="text-xs">Decrypting image...</span>
                      </div>
                    )
                  ) : (
                    // Text message
                    decryptedMessages[message.id] || (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                        <span className="text-xs">Decrypting...</span>
                      </div>
                    )
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
          <button
            type="button"
            onClick={triggerImageUpload}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Send Image"
          >
            <Image className="w-5 h-5 text-gray-400" />
          </button>
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

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: "none" }}
        />

        <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>
            Messages and images are encrypted with quantum-generated keys
          </span>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
