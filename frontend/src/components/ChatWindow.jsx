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
  const messagesContainerRef = useRef(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    // Small delay to ensure DOM update is complete
    setTimeout(scrollToBottom, 50);
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
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700/50 bg-slate-700/20 flex-shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onEndSession}
            className="p-2 hover:bg-slate-700/70 rounded-lg transition-all duration-200 hover:shadow-md lg:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-base sm:text-lg">
              {session.chatPartner.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate text-sm sm:text-base">
              {session.chatPartner}
            </h3>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded-full mt-1">
              <Shield className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="truncate">Quantum Secured</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full">
            <Key className="w-3 h-3 text-emerald-400" />
            <span className="font-mono">Key: {session.keyFingerprint}</span>
          </div>
          <button
            onClick={onEndSession}
            className="hidden lg:flex p-2 hover:bg-slate-700/70 rounded-lg transition-all duration-200 hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Messages Container - Scrollable Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-slate-800/40 to-slate-800/80 scroll-smooth min-h-0"
      >
        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 flex flex-col w-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-8 sm:py-12">
                <div className="bg-slate-700/50 p-4 rounded-full inline-block mb-6">
                  <Lock className="w-12 sm:w-16 h-12 sm:h-16 text-emerald-500 mx-auto" />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-white mb-3">
                  Secure Channel Established
                </h4>
                <p className="text-slate-300 text-sm sm:text-base max-w-sm mx-auto px-4">
                  Your conversation is now protected by quantum encryption.
                  <br />
                  Start typing to send your first secure message.
                </p>
                <div className="mt-6 p-3 bg-slate-700/50 rounded-lg inline-block shadow-md">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-300">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>End-to-end encrypted with QKD</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-3 sm:space-y-4 w-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex w-full ${
                    message.isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] sm:max-w-[70%] lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-md ${
                      message.isOwnMessage
                        ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg"
                        : "bg-slate-700/70 text-white border border-slate-600/30"
                    }`}
                  >
                    {!message.isOwnMessage && (
                      <div className="text-xs text-slate-300 mb-1 font-medium">
                        {message.senderName}
                      </div>
                    )}
                    <div className="break-words">
                      {message.type === "image" ? (
                        // Image message
                        decryptedImages[message.id] ? (
                          decryptedImages[message.id].error ? (
                            <div className="text-rose-400 text-xs">
                              {decryptedImages[message.id].error}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <img
                                src={`data:${
                                  decryptedImages[message.id].file_type
                                };base64,${
                                  decryptedImages[message.id].image_data
                                }`}
                                alt={decryptedImages[message.id].filename}
                                className="max-w-full max-h-[200px] sm:max-h-[300px] rounded-lg shadow-lg object-contain mx-auto"
                              />
                              <div className="text-xs text-slate-400">
                                📷 {decryptedImages[message.id].filename}
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center space-x-2 text-slate-400">
                            <Image className="w-4 h-4 animate-pulse" />
                            <span className="text-xs">Decrypting image...</span>
                          </div>
                        )
                      ) : (
                        // Text message
                        decryptedMessages[message.id] || (
                          <div className="flex items-center space-x-2 text-slate-400">
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                            <span className="text-xs">Decrypting...</span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="text-xs text-slate-300 mt-1 opacity-70">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} style={{ height: 1 }} />
        </div>
      </div>

      {/* Message Input - Fixed at the bottom */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 border-t border-slate-700/50 bg-slate-700/20 flex-shrink-0 w-full"
      >
        <div className="flex space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={triggerImageUpload}
            className="p-2 sm:p-3 bg-slate-700/70 hover:bg-slate-600 rounded-lg transition-all duration-200 shadow hover:shadow-md flex-shrink-0"
            title="Send Image"
          >
            <Image className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your secure message..."
            className="flex-1 bg-slate-700/70 text-white rounded-xl px-3 sm:px-5 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-violet-500/50 border border-slate-600/30 shadow-inner placeholder-slate-400 text-sm sm:text-base min-w-0"
            autoFocus
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl transition-all duration-200 shadow hover:shadow-md flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex-shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="flex items-center space-x-2 mt-2 sm:mt-3 text-xs text-slate-400 bg-slate-700/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
          <Shield className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          <span className="truncate">
            Messages and images are encrypted with quantum-generated keys
          </span>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
