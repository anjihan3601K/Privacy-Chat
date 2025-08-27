import React, { useState, useCallback } from "react";
import LoginScreen from "./components/LoginScreen";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import QKDStatusModal from "./components/QKDStatusModal";
import ErrorModal from "./components/ErrorModal";
import useWebSocket from "./hooks/useWebSocket";
import { Shield, LogOut, Wifi, WifiOff } from "lucide-react";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);

  const {
    isConnected,
    users,
    messages,
    currentSession,
    qkdStatus,
    error,
    initiateQKD,
    acceptQKD,
    rejectQKD,
    sendChatMessage,
    sendImageMessage,
    endSession,
    clearError,
    decryptMessage,
    decryptImage,
  } = useWebSocket(user?.id, user?.displayName);

  const handleLogin = useCallback((userId, displayName) => {
    setUser({ id: userId, displayName });
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    endSession();
  }, [endSession]);

  const handleUserClick = useCallback(
    (targetUser) => {
      if (!currentSession) {
        initiateQKD(targetUser.id);
      }
    },
    [initiateQKD, currentSession]
  );

  const handleSendMessage = useCallback(
    (messageText) => {
      sendChatMessage(messageText);
    },
    [sendChatMessage]
  );

  // Show login screen if user is not logged in
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-emerald-400 drop-shadow-lg" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Quantum Chat
              </h1>
              <p className="text-sm text-slate-400">
                Secured by quantum cryptography
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-full">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-emerald-500 animate-pulse" />
              ) : (
                <WifiOff className="w-5 h-5 text-rose-500" />
              )}
              <span className="text-sm text-slate-300">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-400">Welcome,</span>
              <span className="text-white font-medium bg-slate-700/50 px-3 py-1 rounded-full">
                {user.displayName}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-rose-500/80 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-2 sm:p-4 pt-4 sm:pt-6 h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] overflow-hidden">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 h-full">
          {/* User List - Collapsible on mobile */}
          <div className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1 flex-shrink-0 lg:h-full">
            <UserList
              users={users}
              onUserClick={handleUserClick}
              isConnected={isConnected}
            />
          </div>

          {/* Chat Area - Full width on mobile when active */}
          <div
            className={`lg:col-span-8 xl:col-span-9 order-1 lg:order-2 h-full flex flex-col ${
              currentSession ? "flex-1" : "hidden lg:block"
            }`}
          >
            {currentSession ? (
              <ChatWindow
                session={currentSession}
                messages={messages}
                onSendMessage={handleSendMessage}
                onSendImage={sendImageMessage}
                onEndSession={endSession}
                decryptMessage={decryptMessage}
                decryptImage={decryptImage}
              />
            ) : (
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg h-full flex items-center justify-center">
                <div className="text-center px-6 py-12 max-w-md">
                  <div className="bg-slate-700/50 p-4 rounded-full inline-block mb-6">
                    <Shield className="w-16 h-16 text-slate-400 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    No Active Session
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Select a user from the list to start a quantum-secured chat
                  </p>
                  {users.length === 0 && (
                    <div className="bg-slate-700/30 rounded-lg p-4 mt-4">
                      <p className="text-slate-500">
                        Waiting for other users to join the network...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <QKDStatusModal
        qkdStatus={qkdStatus}
        onAccept={acceptQKD}
        onReject={rejectQKD}
      />

      <ErrorModal error={error} onClose={clearError} />

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 animate-pulse border border-rose-500/20 backdrop-blur-sm">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">
            Connection lost. Attempting to reconnect...
          </span>
        </div>
      )}
    </div>
  );
}

export default App;
