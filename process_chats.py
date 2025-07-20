import json
import os
from datetime import datetime
import re

def process_vrunda_chats():
    """Process Vrunda's chat data from Google Chat export"""
    
    # Path to Vrunda's chat folder
    chat_folder = "extracted_chats/Takeout/Google Chat/Groups/DM 8zeoLgAAAAE"
    messages_file = os.path.join(chat_folder, "messages.json")
    
    if not os.path.exists(messages_file):
        print("Messages file not found!")
        return []
    
    # Read the messages file
    with open(messages_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    messages = data.get('messages', [])
    
    # Process the messages
    processed_messages = []
    
    for msg in messages:
        # Extract message details
        message_text = msg.get('text', '')
        creator = msg.get('creator', {})
        sender_name = creator.get('name', 'Unknown')
        user_type = creator.get('user_type', 'Unknown')
        created_date = msg.get('created_date', '')
        
        # Skip bot messages
        if user_type == 'Bot':
            continue
        
        # Only include messages from Harshiv or Vrunda
        if sender_name in ['Harshiv Gajjar', 'Vrunda Mundhra']:
            processed_messages.append({
                'text': message_text,
                'sender': sender_name,
                'timestamp': created_date,
                'is_vrunda': sender_name == 'Vrunda Mundhra'
            })
    
    # Sort by timestamp (we'll keep original order for now)
    print(f"Found {len(processed_messages)} messages from Vrunda's chat")
    
    return processed_messages

def save_processed_data(messages):
    """Save processed chat data to JSON file"""
    with open('vrunda_chats.json', 'w', encoding='utf-8') as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)
    
    print(f"Processed {len(messages)} messages from Vrunda's chat")
    print("Data saved to vrunda_chats.json")

if __name__ == "__main__":
    messages = process_vrunda_chats()
    save_processed_data(messages) 