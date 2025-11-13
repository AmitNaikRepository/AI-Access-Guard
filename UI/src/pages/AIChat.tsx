import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import PageMeta from '../components/common/PageMeta';
import SecuritySidebar from '../components/SecuritySidebar';

interface PIIDetection {
  entity_type: string;
  start: number;
  end: number;
  score: number;
  original_value: string;
  masked_value: string;
}

interface Message {
  type: 'user' | 'assistant' | 'blocked' | 'connection' | 'error' | 'pii_detected';
  message: string;
  timestamp?: string;
  category?: string;
  layer?: string;
  reason?: string;
  detections?: PIIDetection[];
  summary?: string;
  piiCount?: number;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [piiDetections, setPiiDetections] = useState(0);
  const [piiItemsMasked, setPiiItemsMasked] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to WebSocket
  const connectWebSocket = () => {
    if (!token) {
      setConnectionError('No authentication token. Please log in.');
      return;
    }

    setIsConnecting(true);
    setConnectionError('');

    try {
      const ws = new WebSocket(`${WS_URL}/ws/chat?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError('');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Track PII detections
          if (data.type === 'pii_detected' && data.detections) {
            setPiiDetections((prev) => prev + 1);
            setPiiItemsMasked((prev) => prev + data.detections.length);
            // Add piiCount to the message for display
            data.piiCount = data.detections.length;
          }

          setMessages((prev) => [...prev, data]);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection error occurred');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);

        if (event.code === 4002) {
          setConnectionError('Invalid or expired token. Please re-login.');
          // Logout and redirect to login
          setTimeout(() => {
            logout();
            navigate('/signin');
          }, 2000);
        } else if (event.code === 4001) {
          setConnectionError('No token provided. Please re-login.');
          setTimeout(() => {
            logout();
            navigate('/signin');
          }, 2000);
        } else {
          setConnectionError('Connection closed. Click reconnect to try again.');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionError('Failed to connect. Please try again.');
      setIsConnecting(false);
    }
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setConnectionError('Not connected. Please reconnect.');
      return;
    }

    // Add user message to UI immediately
    const userMessage: Message = {
      type: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send to WebSocket
    wsRef.current.send(JSON.stringify({ message: inputMessage }));
    setInputMessage('');
  };

  // Insert demo PII example
  const insertDemoExample = () => {
    const demoText =
      'My email is john.doe@company.com and my phone is 555-123-4567. My SSN is 123-45-6789. Please help me with my account.';
    setInputMessage(demoText);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Connect on mount
  useEffect(() => {
    if (token) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [token]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/signin');
    }
  }, [token, navigate]);

  const getMessageStyles = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500 text-white ml-auto';
      case 'assistant':
      case 'response':
        return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-auto';
      case 'blocked':
        return 'bg-red-500 text-white mr-auto border-2 border-red-700';
      case 'pii_detected':
        return 'bg-purple-500 text-white mx-auto text-center border-2 border-purple-700';
      case 'connection':
        return 'bg-green-500 text-white mx-auto text-center';
      case 'error':
        return 'bg-orange-500 text-white mr-auto';
      default:
        return 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100';
    }
  };

  return (
    <>
      <PageMeta
        title="AI Chat | AI Access Guard"
        description="Secure AI chat with layered security"
      />

      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Access Guard Chat
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user ? (
                  <>
                    Logged in as <span className="font-semibold">{user.username}</span> (
                    <span className="capitalize">{user.role}</span>)
                  </>
                ) : (
                  'Loading...'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Sidebar Toggle */}
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="md:hidden px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {sidebarVisible ? '◀' : '☰'}
              </button>

              {isConnected ? (
                <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Disconnected
                </span>
              )}
              {!isConnected && !isConnecting && (
                <button
                  onClick={connectWebSocket}
                  className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  Reconnect
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  navigate('/signin');
                }}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Connection Error Banner */}
        {connectionError && (
          <div className="px-6 py-3 bg-red-100 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{connectionError}</p>
          </div>
        )}

        {/* Main Content: Sidebar + Chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Security Sidebar */}
          {sidebarVisible && (
            <div className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
              <SecuritySidebar
                isConnected={isConnected}
                piiDetections={piiDetections}
                piiItemsMasked={piiItemsMasked}
              />
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No messages yet. Start a conversation!
                </p>
                <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  <p className="mb-2">Your messages pass through 4 security layers:</p>
                  <p>0. PII Firewall - Detects and masks sensitive data</p>
                  <p>1. Llama Guard 3 - Content safety</p>
                  <p>2. NeMo Guardrails - Policy enforcement</p>
                  <p>3. AI with role-based context</p>
                </div>
                <button
                  onClick={insertDemoExample}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  🧪 Try PII Detection Example
                </button>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${getMessageStyles(
                    msg.type
                  )}`}
                >
                  {msg.type === 'blocked' && (
                    <div className="mb-2 font-semibold flex items-center gap-2">
                      <span className="text-2xl">🛑</span>
                      Message Blocked
                    </div>
                  )}
                  {msg.type === 'pii_detected' && (
                    <div className="mb-2 font-semibold flex items-center gap-2">
                      <span className="text-2xl">🛡️</span>
                      PII Protection Active
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  {msg.type === 'pii_detected' && msg.detections && msg.detections.length > 0 && (
                    <div className="mt-3 text-xs space-y-1">
                      <p className="font-semibold">Protected Information:</p>
                      {msg.detections.map((detection, idx) => (
                        <p key={idx} className="opacity-90">
                          • {detection.entity_type.replace(/_/g, ' ')}:{' '}
                          <span className="font-mono">{detection.masked_value}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  {msg.layer && (
                    <p className="text-xs mt-2 opacity-75">
                      Blocked by: {msg.layer === 'llama_guard' ? 'Llama Guard' : 'Guardrails'}
                    </p>
                  )}
                  {msg.category && msg.category !== 'safe' && (
                    <p className="text-xs mt-1 opacity-75">Category: {msg.category}</p>
                  )}
                  {msg.reason && (
                    <p className="text-xs mt-1 opacity-75">Reason: {msg.reason}</p>
                  )}
                  {msg.timestamp && msg.type !== 'connection' && (
                    <p className="text-xs mt-2 opacity-60">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isConnected
                    ? 'Type your message...'
                    : 'Connect to start chatting...'
                }
                disabled={!isConnected}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                rows={3}
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !inputMessage.trim() || isConnecting}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Send
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </p>
              <button
                onClick={insertDemoExample}
                className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                🧪 Try PII Example
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
