"""
AI Access Guard - Enterprise AI Safety & Access Control System
Provides layered security for LLM applications with role-based access control
"""

from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import json
import os
import logging
from dotenv import load_dotenv
import requests
import asyncio

# Import our security modules (assumed present)
from llama_guard import llama_guard_check, initialize_llama_guard
from nemoguardrails import RailsConfig, LLMRails

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="AI Access Guard",
    description="Enterprise AI Safety & Access Control System",
    version="1.0.0"
)

# CORS Configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# GROQ (use HTTP API via requests)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY not set. LLM features will be disabled.")
else:
    logger.info("GROQ_API_KEY found in env.")

# NeMo Guardrails Configuration
try:
    config = RailsConfig.from_path("./guardrails")
    rails = LLMRails(config)
    logger.info("NeMo Guardrails initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize NeMo Guardrails: {e}")
    rails = None

# In-memory storage for query logs and metrics
query_logs = []
metrics_data = {
    "total_queries": 0,
    "safe_queries": 0,
    "blocked_queries": 0,
    "queries_by_role": {"employee": 0, "manager": 0, "founder": 0},
    "blocked_by_llama_guard": 0,
    "blocked_by_guardrails": 0,
    "queries_today": [],
    "hourly_data": {},
    "monthly_data": {}
}

# Load role-based data
role_data = {}
try:
    with open('data/employee_data.json', 'r') as f:
        role_data['employee'] = json.load(f)
    with open('data/manager.json', 'r') as f:
        role_data['manager'] = json.load(f)
    with open('data/founders.json', 'r') as f:
        role_data['founder'] = json.load(f)
    logger.info("Role-based data loaded successfully")
except Exception as e:
    logger.error(f"Failed to load role data: {e}")
    role_data = {'employee': {}, 'manager': {}, 'founder': {}}

# User database (in production, use a real database)
fake_users_db = {
    "amit": {
        "username": "amit",
        "password": pwd_context.hash("1234"),  # In production, use hashed passwords
        "role": "employee",
        "full_name": "Amit Kumar",
        "email": "amit@company.com"
    },
    "raj": {
        "username": "raj",
        "password": pwd_context.hash("admin"),
        "role": "manager",
        "full_name": "Raj Sharma",
        "email": "raj@company.com"
    },
    "founder": {
        "username": "founder",
        "password": pwd_context.hash("founder123"),
        "role": "founder",
        "full_name": "Company Founder",
        "email": "founder@company.com"
    }
}

# Pydantic Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class User(BaseModel):
    username: str
    role: str
    full_name: str
    email: str

class QueryLog(BaseModel):
    timestamp: str
    username: str
    role: str
    query: str
    status: str
    blocked_by: Optional[str] = None
    response: Optional[str] = None

# Helper Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        return {"username": username, "role": role}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Get the current authenticated user."""
    return verify_token(token)

def log_query(username: str, role: str, query: str, status: str,
              blocked_by: Optional[str] = None, response: Optional[str] = None):
    """Log a query for auditing purposes."""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "username": username,
        "role": role,
        "query": query,
        "status": status,
        "blocked_by": blocked_by,
        "response": response[:200] if response else None  # Truncate long responses
    }
    query_logs.append(log_entry)

    # Update metrics
    metrics_data["total_queries"] += 1
    if status == "safe":
        metrics_data["safe_queries"] += 1
    else:
        metrics_data["blocked_queries"] += 1
        if blocked_by == "llama_guard":
            metrics_data["blocked_by_llama_guard"] += 1
        elif blocked_by == "guardrails":
            metrics_data["blocked_by_guardrails"] += 1

    metrics_data["queries_by_role"][role] = metrics_data["queries_by_role"].get(role, 0) + 1

    # Add to today's queries
    hour = datetime.utcnow().strftime("%Y-%m-%d %H:00")
    if hour not in metrics_data["hourly_data"]:
        metrics_data["hourly_data"][hour] = {"safe": 0, "blocked": 0}

    if status == "safe":
        metrics_data["hourly_data"][hour]["safe"] += 1
    else:
        metrics_data["hourly_data"][hour]["blocked"] += 1

    logger.info(f"Query logged: {username} ({role}) - {status}")

async def call_llm(prompt: str, role: str, model: str = None) -> str:
    """
    Call the LLM with the user's prompt via Groq HTTP API.

    Returns:
        LLM response text
    """
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="LLM client not initialized (GROQ_API_KEY missing)")

    if model is None:
        model = os.getenv("LLM_MODEL", "llama-3.1-70b-versatile")

    try:
        # build role-specific system prompt
        role_context = role_data.get(role, {})
        allowed_topics = role_context.get("allowed_topics", [])
        system_prompt = f"You are an enterprise AI assistant. The user role: {role}. Allowed topics: {', '.join(allowed_topics)}."

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }
        r = requests.post(url, headers=headers, json=payload, timeout=30)
        r.raise_for_status()
        data = r.json()
        # safe extraction: follow OpenAI-like response shape
        choice = data.get("choices", [{}])[0]
        # support both `message.content` and direct `text` shapes
        message = choice.get("message", {}).get("content") or choice.get("text") or ""
        return message
    except requests.RequestException as e:
        logger.error(f"Error calling Groq API: {e} - {getattr(e, 'response', None)}")
        raise HTTPException(status_code=500, detail="LLM request failed")
    except Exception as e:
        logger.error(f"Unexpected LLM error: {e}")
        raise HTTPException(status_code=500, detail="LLM error")

# API Routes

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "AI Access Guard",
        "version": "1.0.0",
        "description": "Enterprise AI Safety & Access Control System",
        "features": [
            "JWT Authentication",
            "Llama Guard 3 Content Safety",
            "NeMo Guardrails Policy Enforcement",
            "Role-Based Access Control",
            "Real-time WebSocket Chat",
            "Query Logging & Auditing"
        ]
    }

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login endpoint to get JWT token.

    Test users:
    - amit / 1234 (employee)
    - raj / admin (manager)
    - founder / founder123 (founder)
    """
    user = fake_users_db.get(form_data.username)

    if not user or not verify_password(form_data.password, user["password"]):
        logger.warning(f"Failed login attempt for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}
    )

    logger.info(f"User logged in: {user['username']} ({user['role']})")

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.get("/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user information."""
    username = current_user["username"]
    user = fake_users_db.get(username)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": user["username"],
        "role": user["role"],
        "full_name": user["full_name"],
        "email": user["email"]
    }

@app.get("/role-info")
async def get_role_info(current_user: dict = Depends(get_current_user)):
    """Get role-specific information and permissions."""
    role = current_user["role"]

    if role not in role_data:
        raise HTTPException(status_code=404, detail="Role data not found")

    return role_data[role]

@app.get("/metrics")
async def get_metrics(current_user: dict = Depends(get_current_user)):
    """Get system metrics and statistics."""
    # Only managers and founders can view full metrics
    role = current_user["role"]

    if role not in ["manager", "founder"]:
        # Employees see limited metrics
        return {
            "total_queries": metrics_data["queries_by_role"].get(role, 0),
            "your_role": role
        }

    return metrics_data

@app.get("/logs")
async def get_logs(current_user: dict = Depends(get_current_user), limit: int = 50):
    """Get query logs (requires manager or founder role)."""
    role = current_user["role"]

    if role not in ["manager", "founder"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )

    # Return most recent logs
    return {
        "logs": query_logs[-limit:],
        "total": len(query_logs)
    }

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """
    WebSocket endpoint for real-time chat with layered security.

    Security layers:
    1. JWT Authentication
    2. Llama Guard 3 - Content safety check
    3. NeMo Guardrails - Policy and role enforcement
    4. LLM Generation with role-based context
    """
    # Get token from query parameters
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=4001, reason="No token provided")
        return

    # Verify token
    try:
        user_data = verify_token(token)
        username = user_data["username"]
        role = user_data["role"]
    except HTTPException:
        await websocket.close(code=4002, reason="Invalid or expired token")
        return

    # Accept WebSocket connection
    await websocket.accept()
    await websocket.send_json({
        "type": "connection",
        "message": f"✅ Connected as {username} ({role})",
        "username": username,
        "role": role
    })

    logger.info(f"WebSocket connected: {username} ({role})")

    try:
        while True:
            # Receive user message
            data = await websocket.receive_json()
            user_message = data.get("message", "")

            if not user_message:
                await websocket.send_json({
                    "type": "error",
                    "message": "Empty message received"
                })
                continue

            logger.info(f"Received message from {username}: {user_message[:50]}...")

            # Layer 1: Llama Guard Check
            try:
                # expecting (is_safe, category, guard_details) from llama_guard_check
                check = await llama_guard_check(user_message)
                # allow both tuple or dict shaped returns
                if isinstance(check, dict):
                    is_safe = check.get("is_safe", True)
                    category = check.get("category")
                elif isinstance(check, (list, tuple)) and len(check) >= 1:
                    is_safe = bool(check[0])
                    category = check[1] if len(check) > 1 else None
                else:
                    is_safe = True
                    category = None

                if not is_safe:
                    logger.warning(f"Message blocked by Llama Guard - Category: {category}")
                    log_query(username, role, user_message, "blocked", blocked_by="llama_guard")

                    await websocket.send_json({
                        "type": "blocked",
                        "layer": "llama_guard",
                        "message": f"🛑 Your message was blocked by Llama Guard for safety reasons.",
                        "category": category,
                        "reason": "Content safety violation"
                    })
                    continue

            except Exception as e:
                logger.error(f"Llama Guard error: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Safety check failed. Please try again."
                })
                continue

            # Layer 2: NeMo Guardrails Check
            try:
                if rails:
                    context = {
                        "role": role,
                        "username": username,
                        "allowed_topics": role_data.get(role, {}).get("allowed_topics", []),
                        "restricted_topics": role_data.get(role, {}).get("restricted_topics", [])
                    }

                    rail_response = await asyncio.to_thread(
                        rails.generate,
                        prompt=user_message,
                        context_vars=context
                    )

                    # Check if guardrails blocked the request
                    if rail_response and "blocked" in str(rail_response).lower():
                        logger.warning(f"Message blocked by Guardrails for {username}")
                        log_query(username, role, user_message, "blocked", blocked_by="guardrails")

                        await websocket.send_json({
                            "type": "blocked",
                            "layer": "guardrails",
                            "message": "🚫 Access denied. You don't have permission to access this information.",
                            "reason": "Policy violation"
                        })
                        continue
            except Exception as e:
                logger.error(f"Guardrails error: {e}")
                # Continue to LLM even if guardrails fail (fail open for guardrails)

            # Layer 3: LLM Generation
            try:
                ai_response = await call_llm(user_message, role)

                # Log successful query
                log_query(username, role, user_message, "safe", response=ai_response)

                await websocket.send_json({
                    "type": "response",
                    "message": ai_response,
                    "timestamp": datetime.utcnow().isoformat()
                })

                logger.info(f"Response sent to {username}")

            except Exception as e:
                logger.error(f"LLM error: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Failed to generate response. Please try again."
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {username}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close(code=1011, reason="Internal error")
        except:
            pass

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "llama_guard": bool(GROQ_API_KEY),
        "guardrails": rails is not None,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    logger.info(f"Starting AI Access Guard on {host}:{port}")
    uvicorn.run(app, host=host, port=port)
