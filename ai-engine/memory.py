import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

MEMORY_FILE = os.path.join(os.path.dirname(__file__), "data", "user_memory.json")

def load_memories():
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_memory(key, value):
    memories = load_memories()
    memories[key] = value
    os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)
    with open(MEMORY_FILE, "w") as f:
        json.dump(memories, f, indent=4)

def extract_and_store_memory(message: str):
    prompt = f"""
Extract useful personal facts from this message.
Examples: name, location, medical conditions, household members, housing type.
Message: "{message}"

Return a JSON object containing a "facts" array. Each item should have a "key" and "value".
Example: {{"facts": [{{"key": "medical_condition", "value": "wheelchair"}}, {{"key": "pets", "value": "2 dogs"}}]}}
If there is nothing useful, return: {{"facts": []}}
"""
    try:
        api_key = os.environ.get("GROQ_API_KEY", "")
        if not api_key:
            return
            
        client = Groq(api_key=api_key)
        res = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        data = json.loads(res.choices[0].message.content)
        
        facts = data.get("facts", [])
        if isinstance(facts, list):
            for item in facts:
                if isinstance(item, dict):
                    k, v = item.get("key"), item.get("value")
                    if k and v: save_memory(k, v)
    except Exception as e:
        print(f"Memory extraction failed: {e}")

def get_memory_context():
    memories = load_memories()
    if not memories:
        return "No personal context available."
    return "\n".join([f"- {k}: {v}" for k, v in memories.items()])
