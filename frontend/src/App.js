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
    endSession,
    clearError,
    decryptMessage,
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-quantum-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Quantum Chat</h1>
              <p className="text-sm text-gray-400">
                Secured by quantum cryptography
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-security-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-danger-500" />
              )}
              <span className="text-sm text-gray-400">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Welcome,</span>
              <span className="text-white font-medium">{user.displayName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="danger-button flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* User List */}
          <div className="lg:col-span-1">
            <UserList
              users={users}
              onUserClick={handleUserClick}
              isConnected={isConnected}
            />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {currentSession ? (
              <ChatWindow
                session={currentSession}
                messages={messages}
                onSendMessage={handleSendMessage}
                onEndSession={endSession}
                decryptMessage={decryptMessage}
              />
            ) : (
              <div className="bg-gray-800 rounded-lg quantum-border h-full flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No Active Session
                  </h3>
                  <p className="text-gray-500">
                    Select a user from the list to start a quantum-secured chat
                  </p>
                  {users.length === 0 && (
                    <p className="text-sm text-gray-600 mt-4">
                      Waiting for other users to join the network...
                    </p>
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
        <div className="fixed bottom-4 right-4 bg-danger-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">
            Connection lost. Attempting to reconnect...
          </span>
        </div>
      )}
    </div>
  );
}

export default App;
