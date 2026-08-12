from brain import ask_ai
from memory import remember


print("=" * 50)
print("🤖 HARSH AI")
print("Type 'bye' to exit.")
print("=" * 50)


while True:

    user = input("\nYou: ")

    if user.lower() == "bye":
        print("AI: Goodbye!")
        break

    # Ask the AI
    answer = ask_ai(user)

    print("\nAI:", answer)