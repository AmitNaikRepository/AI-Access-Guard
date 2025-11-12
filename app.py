from fastapi import FastAPI, Depends, HTTPException, status,websockets,WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from llama_guard import llama_guard_check
from nemoguardrails import RailsConfig, LLMRails
from groq import GroqClient
from dotenv import load_dotenv
import os   
app = FastAPI()
load_dotenv()
# Secret key and config
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
config = RailsConfig.from_path("./guardrails")
rails = LLMRails(config)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

apy_key = os.getenv("GROQ_API_KEY")
llm=#use the groq client to create a llama2 model instancefrom groq import GroqClient
client = GroqClient(api_key=apy_key)
llm = client.get_model("llama-2-7b-chat")   


# Dummy users
fake_users_db = {
    "amit": {"username": "amit", "password": "1234", "role": "employee"},
    "raj": {"username": "raj", "password": "admin", "role": "manager"},
}

def call_llm(prompt):
    result = llm(prompt, max_new_tokens=100)
    return result[0]["generated_text"]

# Create JWT token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token


def verify_token(token: str):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    

# Login route
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or user["password"] != form_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

# Protected route (like chat or data access)
@app.get("/chat")
def chat(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"message": f"Hello {username}, your role is {role}"}


@app.websocket("/ws/chat")
async def websocket_chat(websocket: websockets.WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        return

    try:
        payload = verify_token(token)
    except HTTPException:
        await websocket.close(code=4002)
        return

    username = payload["sub"]
    role = payload["role"]

    await websocket.accept()
    await websocket.send_text(f"✅ Connected as {username} ({role})")

    try:
        while True:
            user_message = await websocket.receive_text()

            # 1️⃣ Llama Guard check
            guard_result = llama_guard_check(user_message)
            if "unsafe" in guard_result.lower():
                await websocket.send_text("🛑 Blocked by Llama Guard (unsafe content).")
                continue

            # 2️⃣ NeMo Guardrails (policy & role enforcement)
            context = {"role": role}
            rail_response = rails.generate(prompt=user_message, context_vars=context)
            if "Access denied" in rail_response["output"]:
                await websocket.send_text(rail_response["output"])
                continue

            # 3️⃣ LLM Generation
            ai_reply = call_llm(user_message)
            await websocket.send_text(ai_reply)

    except WebSocketDisconnect:
        print(f"❌ {username} disconnected.")