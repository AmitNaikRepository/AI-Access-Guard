import requests

def llama_guard_check(prompt: str):
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer <YOUR_GROQ_API_KEY>"}
    payload = {
        "model": "llama-guard-3-8b",
        "messages": [{"role": "user", "content": prompt}]
    }
    r = requests.post(url, headers=headers, json=payload)
    result = r.json()["choices"][0]["message"]["content"]
    return result
