# Recallo 🧠

**Your AI-Powered Social Memory Assistant**

> *Never forget the details that matter. Deepen your connections.*

Recallo is a mobile application designed to help you remember the important details from your conversations with friends and family. By capturing audio moments, Recallo uses advanced AI to transcribe, analyze, and organize your social interactions, ensuring you never lose track of the small things that make relationships special.

## 📱 Screenshots

| Home Screen | Capture Memory | People | Quiz |
|:---:|:---:|:---:|:---:|
| <!-- Add Home Screen Screenshot Here --> | <!-- Add Capture Screenshot Here --> | <!-- Add People Screenshot Here --> | <!-- Add Quiz Screenshot Here --> |
| *Your personal timeline* | *One-tap audio capture* | *Relationship insights* | *Test your memory* |

## 🚀 Key Features

- **🎙️ Audio Capture & Transcription**: Record conversations or voice notes instantly. Our AI (Deepgram) transcribes them with high accuracy.
- **🧠 Intelligent Analysis**: We use Anthropic's Claude 3.5 Sonnet to extract key details, identify people, and summarize events from your recordings.
- **👥 Relationship Mapping**: Automatically builds profiles for your friends, tracking how often you meet and what you talk about.
- **📅 Event Timeline**: visualizes your social history, showing you when and where you made memories.
- **❓ Memory Quizzes**: Gamified quizzes generated from your actual conversations to help you retain important details about your loved ones.

## 🛠️ Tech Stack

**Frontend (Mobile App)**
- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (Expo Router)
- **Language**: TypeScript
- **Styling**: Custom StyleSheet with a warm, premium design system (Nunito font family)
- **Icons**: Lucide React Native

**Backend (API)**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI/ML**:
  - **Transcription**: [Deepgram Nova-2](https://deepgram.com/)
  - **Intelligence**: [Anthropic Claude 3.5 Sonnet](https://www.anthropic.com/)

## 🏁 Getting Started

### Prerequisites
- Node.js & npm/yarn
- Python 3.10+
- Expo Go app on your phone

### 1. Backend Setup

```bash
cd Recallo-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file with:
# SUPABASE_URL=...
# SUPABASE_KEY=...
# DEEPGRAM_API_KEY=...
# ANTHROPIC_API_KEY=...

# Run the server
uvicorn app.main:app --reload
```

### 2. Frontend Setup

```bash
cd Recallo

# Install dependencies
npm install

# Start the app
npx expo start
```

Scan the QR code with your Expo Go app to run it on your device!

## 💡 Inspiration

In a fast-paced world, it's easy to let meaningful details slip through the cracks. We built Recallo to bridge the gap between experiencing a moment and remembering it forever. It's not just about recording audio; it's about cherishing the people in our lives.

---

*Built with ❤️ for the Hackathon*
