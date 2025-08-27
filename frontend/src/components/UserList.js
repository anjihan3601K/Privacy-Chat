import React from "react";
import { Users, Shield, Wifi } from "lucide-react";

const UserList = ({ users, onUserClick, isConnected }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 quantum-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <Users className="w-5 h-5 text-quantum-400" />
          <span>Online Users</span>
        </h2>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-security-500 animate-pulse" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-400">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8">
          <Wifi className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No other users online</p>
          <p className="text-sm text-gray-500 mt-1">
            Waiting for others to join...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => onUserClick(user)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-quantum-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{user.display_name}</div>
                  <div className="text-sm text-gray-400 flex items-center space-x-1">
                    <div className="status-online"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <button
                className="quantum-button text-sm flex items-center space-x-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onUserClick(user);
                }}
              >
                <Shield className="w-3 h-3" />
                <span>Secure Chat</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-4 h-4 text-quantum-400" />
          <span className="text-sm font-medium">Quantum Security</span>
        </div>
        <p className="text-xs text-gray-400">
          All conversations are secured using quantum key distribution (BB84
          protocol) with automatic eavesdropper detection.
        </p>
      </div>
    </div>
  );
};

export default UserList;
