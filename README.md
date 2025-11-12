# 🛡️ AI Access Guard

**Enterprise AI Safety & Access Control System**

A production-ready AI safety system that provides **layered security** for LLM applications with role-based access control. Every user query passes through multiple security layers before reaching the AI model.

![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)

---

## 🎯 Features

### 🔐 Multi-Layer Security
1. **JWT Authentication** - Secure user authentication with role-based access
2. **Llama Guard 3** - Content safety checking (violence, hate speech, jailbreaks, etc.)
3. **NeMo Guardrails** - Company policy enforcement and role-based access control
4. **Role-Based Data Access** - Users only access information they're authorized for

### 🚀 Core Capabilities
- ✅ Real-time WebSocket chat with AI
- ✅ Three role levels: Employee, Manager, Founder
- ✅ Comprehensive query logging and auditing
- ✅ Dashboard metrics and analytics
- ✅ Open-source and locally deployable
- ✅ RESTful API for integration

---

## 🏗️ Architecture

```
User Query
    ↓
[JWT Auth] ─── Verify user identity & role
    ↓
[Llama Guard 3] ─── Check for unsafe content
    ↓
[NeMo Guardrails] ─── Enforce company policies
    ↓
[LLM with Role Context] ─── Generate response
    ↓
[Audit Log] ─── Record query for compliance
    ↓
Response to User
```

---

## 📋 Prerequisites

- **Python 3.9+**
- **Groq API Key** (for Llama Guard 3 and LLM access)
  - Get your free API key at: https://console.groq.com/

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AI-Access-Guard.git
cd AI-Access-Guard
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# On Linux/Mac
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Groq API Configuration
GROQ_API_KEY=your-groq-api-key-here

# Llama Guard Model
LLAMA_GUARD_MODEL=llama-guard-3-8b

# LLM Model for Chat
LLM_MODEL=llama-3.1-70b-versatile

# Server Configuration
HOST=0.0.0.0
PORT=8000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 5. Run the Server

```bash
python app.py
```

Or using uvicorn directly:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at: **http://localhost:8000**

### 6. Run the Frontend (Optional but Recommended)

The project includes a React frontend for easy interaction with the AI Access Guard system.

```bash
cd UI
npm install
cp .env.example .env
npm run dev
```

The frontend will be available at: **http://localhost:5173**

**Frontend Features:**
- 🔐 Login page with JWT authentication
- 💬 Real-time WebSocket chat interface
- 🎨 Clean, modern UI with dark mode
- 🔴 Visual indicators for blocked messages
- ✅ Connection status monitoring

See [UI/FRONTEND_README.md](UI/FRONTEND_README.md) for detailed frontend documentation.

---

## 🧪 Testing the System

### Option 1: Using the Frontend (Recommended)

1. Open http://localhost:5173 in your browser
2. Log in with a test account:
   - Employee: `amit` / `1234`
   - Manager: `raj` / `admin`
   - Founder: `founder` / `founder123`
3. Start chatting with the AI
4. Try different types of messages:
   - Safe queries: "What is the company leave policy?"
   - Restricted queries (employee): "Show me financial reports"
   - Unsafe content: Will be blocked by Llama Guard

### Option 2: Using the API Directly

### 1. Health Check

```bash
curl http://localhost:8000/health
```

### 2. Login (Get JWT Token)

**Test Users:**
- `amit` / `1234` (Employee)
- `raj` / `admin` (Manager)
- `founder` / `founder123` (Founder)

```bash
curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=amit&password=1234"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. WebSocket Chat

Connect to WebSocket with your token:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/chat?token=YOUR_JWT_TOKEN');

ws.onopen = () => {
  console.log('Connected!');
  ws.send(JSON.stringify({ message: "Hello, AI!" }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Response:', data);
};
```

### 4. Get User Info

```bash
curl -X GET "http://localhost:8000/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. View Metrics (Manager/Founder only)

```bash
curl -X GET "http://localhost:8000/metrics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. View Query Logs (Manager/Founder only)

```bash
curl -X GET "http://localhost:8000/logs?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 👥 Role-Based Access Control

### Employee Role
**Access:**
- Company policies
- Leave policies
- General HR information
- Basic product information
- Training resources

**Restricted:**
- Financial data
- Salary information of others
- Strategic plans
- Executive decisions

### Manager Role
**Access:**
- All Employee access +
- Team performance metrics
- Department budget information
- Hiring and recruitment data
- Customer feedback

**Restricted:**
- Company-wide financial data
- Executive compensation
- M&A plans
- Board meeting minutes

### Founder Role
**Access:**
- Full access to all company information
- Financial reports
- Strategic plans
- Board materials
- Customer database
- All employee data

**Restricted:**
- None (full access)

---

## 🛡️ Security Features

### Llama Guard 3 Protection

Detects and blocks:
- 🔴 Violent Crimes
- 🔴 Non-Violent Crimes
- 🔴 Sex-Related Crimes
- 🔴 Child Sexual Exploitation
- 🔴 Defamation
- 🔴 Specialized Advice (financial, medical, legal)
- 🔴 Privacy violations
- 🔴 Intellectual Property violations
- 🔴 Indiscriminate Weapons
- 🔴 Hate speech
- 🔴 Suicide & Self-Harm
- 🔴 Sexual Content
- 🔴 Jailbreak attempts

### NeMo Guardrails Protection

Enforces:
- ✅ Role-based access policies
- ✅ Company-specific rules
- ✅ Data access restrictions
- ✅ Query filtering by role
- ✅ Anti-jailbreak measures

---

## 📊 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | API information | No |
| POST | `/login` | Get JWT token | No |
| GET | `/me` | Get current user info | Yes |
| GET | `/role-info` | Get role permissions | Yes |
| GET | `/metrics` | Get system metrics | Yes (Manager+) |
| GET | `/logs` | Get query logs | Yes (Manager+) |
| GET | `/health` | Health check | No |
| WebSocket | `/ws/chat` | Real-time chat | Yes (via token param) |

---

## 📁 Project Structure

```
AI-Access-Guard/
├── app.py                      # Main FastAPI application
├── llama_guard.py             # Llama Guard 3 integration
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
├── .env                      # Your environment variables (create this)
├── README.md                 # This file
├── LICENSE                   # Apache 2.0 license
│
├── data/                     # Role-based access data
│   ├── employee_data.json   # Employee permissions
│   ├── manager.json         # Manager permissions
│   └── founders.json        # Founder permissions
│
├── guardrails/              # NeMo Guardrails configuration
│   └── config.yaml         # Guardrails policies
│
├── logs/                    # Application logs
│   └── app.log             # Main application log
│
└── UI/                      # React Frontend
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── context/         # AuthContext, ThemeContext
    │   ├── pages/
    │   │   ├── AIChat.tsx  # Main chat interface
    │   │   └── AuthPages/  # Login pages
    │   └── App.tsx         # Main app with routing
    ├── .env.example        # Frontend env variables
    ├── package.json        # Frontend dependencies
    └── FRONTEND_README.md  # Frontend documentation
```

---

## 🔧 Configuration

### Customize Roles

Edit the role data files in `data/` directory:

**data/employee_data.json** - Employee permissions
**data/manager.json** - Manager permissions
**data/founders.json** - Founder permissions

### Customize Guardrails

Edit `guardrails/config.yaml` to add custom policies:

```yaml
rails:
  input:
    flows:
      - check user role
      - validate topic access
```

---

## 🧪 Example Queries

### Safe Query (Employee)
```
"What is the company's leave policy?"
```
✅ **Passes** - Allowed topic for employee

### Blocked by Role (Employee)
```
"Show me the company's financial reports"
```
🚫 **Blocked by Guardrails** - Not allowed for employee role

### Blocked by Llama Guard
```
"How to hack into a system?"
```
🛑 **Blocked by Llama Guard** - Unsafe content detected

---

## 📈 Monitoring & Auditing

All queries are logged with:
- Timestamp
- Username and role
- Query content
- Status (safe/blocked)
- Blocking reason (if blocked)
- Response preview

Access logs via `/logs` endpoint (Manager/Founder only).

---

## 🚢 Deployment

### Docker Deployment (Coming Soon)

```bash
docker build -t ai-access-guard .
docker run -p 8000:8000 --env-file .env ai-access-guard
```

### Production Considerations

1. **Use a real database** - Replace in-memory storage with PostgreSQL/MongoDB
2. **Set strong SECRET_KEY** - Generate with `openssl rand -hex 32`
3. **Enable HTTPS** - Use reverse proxy (nginx) with SSL certificate
4. **Set up log rotation** - Prevent logs from consuming disk space
5. **Monitor API usage** - Track Groq API costs and rate limits
6. **Implement rate limiting** - Prevent abuse
7. **Add user management** - Registration, password reset, etc.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Meta** - Llama Guard 3
- **NVIDIA** - NeMo Guardrails
- **Groq** - Fast LLM inference
- **FastAPI** - Modern Python web framework

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/AI-Access-Guard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/AI-Access-Guard/discussions)

---

## 🗺️ Roadmap

- [ ] Database integration (PostgreSQL)
- [ ] User registration and management
- [ ] Admin dashboard UI
- [ ] Docker containerization
- [ ] Kubernetes deployment configs
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with more LLM providers
- [ ] Custom safety categories
- [ ] Slack/Teams bot integration

---

**Built with ❤️ for enterprise AI safety**
