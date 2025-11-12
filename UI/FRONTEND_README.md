# AI Access Guard - Frontend

React-based frontend for the AI Access Guard system with JWT authentication and WebSocket chat.

## Features

- 🔐 JWT-based authentication
- 💬 Real-time WebSocket chat with AI
- 🎨 Clean, modern UI with TailwindCSS
- 🌙 Dark mode support
- 📱 Responsive design
- 🛡️ Protected routes
- 🔴 Visual indicators for blocked messages (Llama Guard & Guardrails)
- ✅ Connection status indicators

## Quick Start

### 1. Install Dependencies

```bash
cd UI
npm install
```

### 2. Configure Environment

Create a `.env` file in the `UI` directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will be available at: **http://localhost:5173**

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Test Accounts

Use these accounts to test different role levels:

- **Employee**: `amit` / `1234` - Limited access
- **Manager**: `raj` / `admin` - Team data access
- **Founder**: `founder` / `founder123` - Full access

## Project Structure

```
UI/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── SignInForm.tsx       # Login form component
│   │   ├── common/
│   │   │   ├── ProtectedRoute.tsx   # Route guard
│   │   │   └── ...
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.tsx          # Authentication state management
│   │   ├── ThemeContext.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── AIChat.tsx               # Main chat interface
│   │   ├── AuthPages/
│   │   │   └── SignIn.tsx          # Login page
│   │   └── ...
│   ├── App.tsx                      # Main app with routing
│   └── main.tsx                     # Entry point
├── .env.example                     # Environment variables template
├── package.json
└── vite.config.ts
```

## Key Components

### AuthContext

Manages authentication state, JWT tokens, and user information:

- `login(username, password)` - Authenticate user
- `logout()` - Clear session
- `user` - Current user info
- `token` - JWT token
- `isAuthenticated` - Auth status

### AIChat

Main chat interface with WebSocket communication:

- **Connection management**: Auto-connect, reconnect, disconnect
- **Message types**:
  - 🔵 Blue bubbles - User messages
  - ⚪ Gray bubbles - AI responses
  - 🔴 Red bubbles - Blocked messages (with reason & layer)
  - 🟢 Green bubbles - Connection status
  - 🟠 Orange bubbles - Errors
- **Features**:
  - Real-time message streaming
  - Auto-scroll to latest message
  - Connection status indicator
  - Error handling and retry
  - Logout button

### SignInForm

Login form that connects to the backend:

- Username/password authentication
- Test account hints
- Error display
- Loading states
- Redirect to chat on success

### ProtectedRoute

Guards routes that require authentication:

- Redirects to login if not authenticated
- Shows loading spinner while checking auth
- Wraps protected pages

## API Integration

### Authentication

```typescript
POST /login
Content-Type: application/x-www-form-urlencoded

username=amit&password=1234

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### User Info

```typescript
GET /me
Authorization: Bearer <token>

Response:
{
  "username": "amit",
  "role": "employee",
  "full_name": "Amit Kumar",
  "email": "amit@company.com"
}
```

### WebSocket Chat

```typescript
WS /ws/chat?token=<JWT_TOKEN>

// Send message
{
  "message": "What is the company leave policy?"
}

// Receive responses
{
  "type": "response",
  "message": "AI response here...",
  "timestamp": "2025-01-12T10:30:00Z"
}

// Blocked message
{
  "type": "blocked",
  "layer": "llama_guard",
  "message": "🛑 Your message was blocked...",
  "category": "S1",
  "reason": "Content safety violation"
}
```

## Message Types

The chat displays different message types with distinct styling:

| Type | Color | Description |
|------|-------|-------------|
| `user` | Blue | User's messages |
| `assistant` / `response` | Gray | AI responses |
| `blocked` | Red | Blocked by Llama Guard or Guardrails |
| `connection` | Green | Connection status messages |
| `error` | Orange | Error messages |

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8000` |

## Troubleshooting

### Connection Issues

If you can't connect to the backend:

1. Ensure backend is running on `http://localhost:8000`
2. Check CORS settings in backend `app.py`
3. Verify `.env` file has correct URLs
4. Check browser console for errors

### Authentication Errors

If login fails:

1. Verify backend is running
2. Check username/password
3. Look for error messages in UI
4. Check backend logs for issues

### WebSocket Disconnects

If chat keeps disconnecting:

1. Check backend is running
2. Verify JWT token is valid
3. Look for connection errors in console
4. Try reconnecting with the button

## Features Walkthrough

### 1. Login

- Navigate to `/signin` or the root URL
- Enter credentials (use test accounts)
- Click "Sign in"
- Redirected to chat on success

### 2. Chat

- Messages appear in real-time
- Type in textarea and click "Send" or press Enter
- Messages pass through 3 security layers
- Blocked messages show in red with reason

### 3. Security Indicators

- **Connection status**: Green dot = connected, Red dot = disconnected
- **Message colors**: Blue (you), Gray (AI), Red (blocked)
- **Block reasons**: Shows which layer blocked and why

### 4. Logout

- Click "Logout" button in header
- Redirected to login page
- Token cleared from localStorage

## Security Notes

- JWT tokens are stored in localStorage
- Tokens are sent via WebSocket query parameter
- Failed auth redirects to login
- Expired tokens trigger re-login
- All routes except `/signin` are protected

## Next Steps

Future enhancements planned:

- [ ] Add Redis/Vector DB for context-aware responses
- [ ] Message history persistence
- [ ] User preferences
- [ ] Multi-turn conversations with context
- [ ] File upload support
- [ ] Export chat history
- [ ] Typing indicators
- [ ] Read receipts

---

**Built with React, TypeScript, TailwindCSS, and WebSockets**
