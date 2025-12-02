# <img src="assets/icon.png" alt="AI Summary Extension" width="32" height="32"> AI Summary Extension v2

**AI Summary Extension** is a Chrome extension designed to help users capture and summarize their AI chat sessions seamlessly. It solves the problem of starting a new chat from scratch by providing AI-generated continuation summaries, saving time and keeping the conversation context intact.

---

## 🚀 Features

- Capture chat history from supported AI platforms (ChatGPT, Claude, Grok, Gemini, Perplexity, DeepSeek).  
- Automatically generate AI-based continuation summaries using **Llama 3.1-8b-instant** model.  
- Visual conversation sequence with user and AI messages, including message length information.  
- View, copy, or auto-start your previous chat sessions in the supported platforms.  
- Efficiently track your study or project progress without manually explaining context to a new AI session.  
- Version 2 updates:
  - Improved conversation parsing and formatting.
  - Auto-start and auto-send features for seamless continuation.
  - Enhanced summary clarity and user understanding evaluation.
  - Model selection support for different AI platforms.

---

## 🧩 Problem Statement

When studying or working with AI chat assistants, starting a new session often requires manually explaining your previous progress. This wastes time and interrupts the learning flow. **AI Summary Extension** automatically captures your chat history and generates a continuation summary. This allows you to:

- Continue conversations naturally in a new chat.
- Save time by avoiding repeated context explanation.
- Maintain progress on learning or project tasks across AI sessions.

---

## 🛠 Tech Stack

- **Chrome Extension**: Popup, background, and content scripts.
- **JavaScript**: Frontend logic and interaction.
- **HTML/CSS**: Extension interface.
- **Llama 3.1-8b-instant**: AI model for conversation summarization.
- **Chrome Storage API**: Persisting chat histories locally.

---

## 💻 Supported Platforms

- ChatGPT (chat.openai.com)  
- Claude (claude.ai)  
- Grok (grok.com)  
- Gemini (gemini.google.com)  
- Perplexity (perplexity.ai)  
- DeepSeek (deepseek.com)  

---

## ⚡ Installation

1. Clone the repository:

```bash
git clone https://github.com/Samprit74/ai-summary-extention-v2.git
