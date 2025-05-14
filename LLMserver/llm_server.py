from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS module
import subprocess

frontendURL = "http://localhost:5173"

app = Flask(__name__)
CORS(app, origins=[frontendURL, '*'], allow_headers=["Authorization", "Content-Type"]) # Enable CORS for all routes

# System prompt to guide the model's behavior
# SYSTEM_PROMPT = """
# You are a helpful and witty assistant. Your goal is to provide short, concise, and human-like responses that align with the user's intent and tone. 
# Keep your responses under 2-3 sentences. Be natural, conversational, and avoid sounding robotic or overly formal. 

# For prompts where the user wants to send a message (e.g., greeting someone, apologizing, or making a request), write the message directly from the user's perspective in first person. 
# Do not provide explanations or suggestions—just write the message as if you are the user.
# Do not return the response in double quotes.
# You should also be able to understand when the user expects to use you for improving the language and grammer of the text and convey the message.
# You SHOULD NOT directly Reply to the user at all times.
# """
SYSTEM_PROMPT = """
I respond as if I'm the user, typing exactly what they would say. Every message should sound natural, like it came straight from them.

Keep it funny, concise, and engaging—unless they want details, in which case, I'll elaborate like a pro. No robotic tone, no over-explaining—just smooth, human-like responses that match their intent.

If they need a message rewritten, I’ll make it sound better without changing the meaning. If they’re making a request, I’ll phrase it as if they typed it. No unnecessary explanations. Just vibes and precision.
"""



@app.route('/generate', methods=['POST', 'OPTIONS'], strict_slashes=False)
def generate():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({"help":"this is shit"})
        # response.headers.add("Access-Control-Allow-Origin", frontendURL)
        # response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        # response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response, 200

    # Get the prompt and tone from the request body
    data = request.json
    user_prompt = data.get('prompt')
    tone = data.get('tone', 'neutral')  # Default tone is neutral

    if not user_prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        # Combine the system prompt, tone, and user prompt
        full_prompt = f"{SYSTEM_PROMPT}\n\nTone: {tone}\nUser: {user_prompt}\nAssistant:"

        # Use Ollama to generate a response
        result = subprocess.run(
            ['ollama', 'run', 'llama3.2', full_prompt],
            capture_output=True,
            text=True
        )

        # Check if the command was successful
        if result.returncode != 0:
            return jsonify({'error': 'Failed to generate response', 'details': result.stderr}), 500

        # Extract the assistant's response
        response = result.stdout.strip()

        # Remove the system prompt and user prompt from the response (if needed)
        if "Assistant:" in response:
            response = response.split("Assistant:")[-1].strip()

        # print("response = ",response)

        # Return the generated response
        return jsonify({'response': response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)