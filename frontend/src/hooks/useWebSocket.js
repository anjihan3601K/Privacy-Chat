import { useState, useEffect, useRef, useCallback } from "react";

const useWebSocket = (userId, displayName) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [qkdStatus, setQkdStatus] = useState(null);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const currentSessionRef = useRef(null);
  const maxReconnectAttempts = 5;

  // Keep currentSessionRef in sync with currentSession state
  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `ws://localhost:8000/ws/${userId}?display_name=${encodeURIComponent(
        displayName
      )}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);

        // Attempt to reconnect unless it was a clean close
        if (
          event.code !== 1000 &&
          reconnectAttempts.current < maxReconnectAttempts
        ) {
          const timeout = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, timeout);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error. Please check your network.");
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Failed to connect to server.");
    }
  }, [userId, displayName]);

  const handleMessage = (data) => {
    console.log("Received message:", data);

    switch (data.type) {
      case "welcome":
        console.log("Welcome message received");
        break;

      case "user_list":
        setUsers(data.users.filter((user) => user.id !== userId));
        break;

      case "qkd_request":
        setQkdStatus({
          type: "incoming_request",
          sessionId: data.session_id,
          fromUser: data.from_user,
          fromUserId: data.from_user_id,
        });
        break;

      case "qkd_initiated":
        setQkdStatus({
          type: "outgoing_request",
          sessionId: data.session_id,
          targetUser: data.target_user,
          status: data.status,
        });
        break;

      case "qkd_status":
        setQkdStatus({
          type: "performing",
          sessionId: data.session_id,
          status: data.status,
          message: data.message,
        });
        break;

      case "qkd_success":
        console.log("QKD Success received:", data);
        const newSession = {
          sessionId: data.session_id,
          chatPartner: data.chat_partner,
          chatPartnerId: data.chat_partner_id,
          keyFingerprint: data.key_fingerprint,
          establishedAt: new Date().toISOString(),
        };
        console.log("Setting new session:", newSession);
        setCurrentSession(newSession);
        setQkdStatus(null);
        setMessages([]); // Clear previous messages
        break;

      case "qkd_failed":
        setError(`QKD Failed: ${data.message}`);
        setQkdStatus(null);
        setCurrentSession(null);
        break;

      case "qkd_rejected":
        setError(data.message);
        setQkdStatus(null);
        break;

      case "chat_message":
        console.log("Chat message received:", data);
        console.log("Current session from ref:", currentSessionRef.current);
        console.log("Current session from state:", currentSession);
        console.log(
          "Session ID match:",
          data.session_id === currentSessionRef.current?.sessionId
        );
        if (data.session_id === currentSessionRef.current?.sessionId) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              senderId: data.sender_id,
              senderName: data.sender_name,
              encryptedMessage: data.encrypted_message,
              timestamp: data.timestamp,
              isOwnMessage: data.sender_id === userId,
            },
          ]);
        } else {
          console.log("Session ID mismatch - not adding message");
          console.log("Expected:", currentSessionRef.current?.sessionId);
          console.log("Received:", data.session_id);
        }
        break;

      case "error":
        setError(data.message);
        break;

      case "pong":
        // Handle ping/pong for connection health
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  };

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setError("Not connected to server");
    }
  }, []);

  const initiateQKD = useCallback(
    (targetUserId) => {
      sendMessage({
        type: "initiate_qkd",
        target_user_id: targetUserId,
      });
    },
    [sendMessage]
  );

  const acceptQKD = useCallback(
    (sessionId) => {
      sendMessage({
        type: "accept_qkd",
        session_id: sessionId,
      });
    },
    [sendMessage]
  );

  const rejectQKD = useCallback(
    (sessionId) => {
      sendMessage({
        type: "reject_qkd",
        session_id: sessionId,
      });
      setQkdStatus(null);
    },
    [sendMessage]
  );

  const sendChatMessage = useCallback(
    (messageText) => {
      const session = currentSessionRef.current;
      if (!session) {
        setError("No active secure session");
        return;
      }

      console.log("Sending chat message for session:", session.sessionId);
      sendMessage({
        type: "chat_message",
        session_id: session.sessionId,
        message: messageText,
      });
    },
    [sendMessage]
  );

  const endSession = useCallback(() => {
    setCurrentSession(null);
    setMessages([]);
    setQkdStatus(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Decrypt message for display
  const decryptMessage = async (encryptedMessage) => {
    const session = currentSessionRef.current;
    if (!session) return "[Encrypted]";

    try {
      const response = await fetch(
        "http://localhost:8000/api/decrypt-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: session.sessionId,
            encrypted_message: encryptedMessage,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.decrypted_message;
      } else {
        return "[Decryption Failed]";
      }
    } catch (err) {
      console.error("Decryption error:", err);
      return "[Decryption Error]";
    }
  };

  // Connection management
  useEffect(() => {
    if (userId && displayName) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, [connect, userId, displayName]);

  // Ping to keep connection alive
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        sendMessage({ type: "ping" });
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [isConnected, sendMessage]);

  return {
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
  };
};

export default useWebSocket;
