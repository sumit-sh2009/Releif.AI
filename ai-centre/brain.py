import ollama
import json
from memory import recall_all, remember


SYSTEM_PROMPT = """
You are Harsh AI.

You are a friendly, helpful personal AI assistant.
Use the user's saved memories when answering.

Be clear and natural.
"""


def extract_memory(user_message):

    prompt = f"""
Read this message from the user:

"{user_message}"

Decide whether the user has provided a useful personal fact
that should be remembered for future conversations.

Examples of useful facts:
- name
- favorite things
- hobbies
- school
- programming languages they like
- projects they are working on
- preferences

If there is a useful fact, return ONLY valid JSON like:

{{"key": "favorite_color", "value": "blue"}}

If there is nothing useful to remember, return:

{{"key": "", "value": ""}}

Do not write anything except JSON.
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    text = response["message"]["content"].strip()

    try:
        data = json.loads(text)

        key = data.get("key", "")
        value = data.get("value", "")

        if key and value:
            remember(key, value)

    except json.JSONDecodeError:
        pass


def ask_ai(user_message):

    # First check whether the user gave us something worth remembering
    extract_memory(user_message)

    # Get all saved memories
    memories = recall_all()

    memory_text = ""

    for key, value in memories.items():
        memory_text += f"{key}: {value}\n"

    prompt = f"""
Known information about the user:

{memory_text}

User's message:

{user_message}
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]