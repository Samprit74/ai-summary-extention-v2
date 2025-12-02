# <img src="assets/icon.png" alt="AI Summary Extension" width="64" height="64" style="border-radius: 8px;"> AI Summary Extension v2

<div align="center">
  <h1>✨ AI Chat Continuation Assistant ✨</h1>
  
  <p>
    <img src="https://img.shields.io/badge/Version-2.0-blue" alt="Version 2.0">
    <img src="https://img.shields.io/badge/Chrome-Extension-green" alt="Chrome Extension">
    <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License MIT">
    <img src="https://img.shields.io/badge/Open--Source-✓-brightgreen" alt="Open Source">
  </p>
  
  <p><strong>Seamlessly continue your AI conversations across sessions</strong></p>
</div>

---

## 📖 Table of Contents

- [🌟 Features](#-features)
- [🎯 Problem Statement](#-problem-statement)
- [🛠️ Tech Stack](#️-tech-stack)
- [🌐 Supported Platforms](#-supported-platforms)
- [📥 Installation](#-installation)
- [📁 Folder Structure](#-folder-structure)
- [🚀 Usage Guide](#-usage-guide)
- [⚙️ Configuration](#️-configuration)
- [🔧 How It Works](#-how-it-works)
- [📋 Code Files](#-code-files)
- [🏷️ Tags](#️-tags)

---

## 🌟 Features

### **✨ Core Functionality**
- **🔄 Chat History Capture** – Automatically captures conversations from supported AI platforms
- **🤖 AI-Powered Summarization** – Generates intelligent continuation summaries using Llama 3.1-8b-instant
- **📊 Visual Conversation Flow** – Displays message sequence with length indicators
- **🎯 Session Management** – View, copy, and auto-start previous chat sessions

### **🚀 Version 2 Enhancements**
- ✅ Improved conversation parsing and formatting
- ✅ Auto-start and auto-send features for seamless continuation
- ✅ Enhanced summary clarity with user understanding evaluation
- ✅ Model selection support for different AI platforms
- ✅ Better error handling and user feedback

### **💡 Productivity Benefits**
- ⏱️ **Save Time** – No more manual context explanation
- 🔄 **Maintain Flow** – Continue naturally from where you left off
- 📈 **Track Progress** – Keep study or project context intact
- 🎯 **Focus on Goals** – Spend time on content, not repetition

---

## 🎯 Problem Statement

**The Challenge:** Starting a new AI chat session often requires:
- 📝 Manually explaining previous progress
- ⏳ Wasting valuable time on context setup
- 🔄 Repeating information across sessions
- 🚫 Losing momentum in learning or work flow

**Our Solution:** AI Summary Extension provides:
- 🔄 **Automatic Context Transfer** – Bring your conversation history to new sessions
- 🎯 **Smart Summarization** – AI-generated summaries that capture essential context
- ⚡ **One-Click Continuation** – Resume conversations with a single click
- 📚 **Progress Preservation** – Maintain study or project continuity across sessions

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Extension Framework** | Chrome Extension (Manifest V3) |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **AI Model** | Llama 3.1-8b-instant via Groq API |
| **Storage** | Chrome Storage API |
| **Icons** | Custom SVG/PNG + Font Awesome |
| **Styling** | Modern CSS with Flexbox/Grid |

---

## 🌐 Supported Platforms

<div align="center">

| Platform | URL | Status |
|----------|-----|--------|
| **ChatGPT** | chat.openai.com | ✅ Fully Supported |
| **Claude** | claude.ai | ✅ Fully Supported |
| **Grok** | grok.com | ✅ Fully Supported |
| **Gemini** | gemini.google.com | ✅ Fully Supported |
| **Perplexity** | perplexity.ai | ✅ Fully Supported |
| **DeepSeek** | deepseek.com | ✅ Fully Supported |

</div>

---

## 📥 Installation

### **Chrome Browser Installation**

1. **📥 Clone the Repository**
   ```bash
   git clone https://github.com/Samprit74/ai-summary-extention-v2.git

   🌐 Open Chrome Extensions Page

2.Navigate to chrome://extensions/

Enable Developer Mode (toggle in top right corner)

3.📂 Load Extension

4.Click "Load unpacked" button

5.Select the cloned project folder

✅ Verification

6.Extension icon appears in Chrome toolbar

7.Pin the extension for easy access

🔑 API Configuration (First-time setup)

8.Click extension icon

9.Open settings (gear icon)

10.Enter your Groq API Key

11.Save configuration

 Folder Structure
 ai-summary-extension-v2/
├── 📁 assets/
│   └── icon.png              # Extension logo (64x64 recommended)
├── 📄 popup.html            # Main extension interface
├── 📄 popup.js              # Frontend logic and API calls
├── 📄 content.js            # Injected script for AI platforms
├── 📄 styles.css            # Styling and animations
├── 📄 manifest.json         # Extension configuration
└── 📄 README.md             # This documentation
Usage Guide
Step 1: Start a Conversation
Open any supported AI platform (e.g., ChatGPT)

Have a conversation as you normally would

Step 2: Capture Chat
Click the AI Summary Extension icon in Chrome toolbar

Click "Capture Chat" button

Watch as messages are collected and displayed

Step 3: Generate Summary
Click "Generate Summary" button

AI processes your conversation

Receive a concise continuation summary

Step 4: Continue Conversation
📋 Copy Summary – Paste into new chat

🚀 Auto-Start – Automatically open new session with summary

💾 Save Locally – Store for later reference

⚙️ Configuration
API Settings
javascript
CONFIG.GROQ_API_KEY = "your-groq-api-key-here";  // Replace with your key
CONFIG.MODEL = "llama-3.1-8b-instant";           // Default model
Performance Settings
javascript
MAX_MESSAGES: 19,                 // Maximum messages stored
MAX_MESSAGE_LENGTH: 500,          // Characters per message
SUMMARY_TOKENS: 2000,             // Token limit for summaries
SUMMARY_TEMPERATURE: 0.3,         // Creativity control (0-1)
Platform-Specific Settings
Each platform has optimized selectors

Automatic detection and adjustment

Fallback mechanisms for reliability

🔧 How It Works
1. Message Capture Phase
Content script injects into supported websites

Identifies user and AI message elements

Extracts text content with metadata

Filters and formats messages

2. Storage Phase
Messages stored in Chrome local storage

Organized by timestamp and platform

Implements efficient data structure

Maintains conversation context

3. Summarization Phase
Sends conversation to Llama 3.1 model

Generates continuation-focused summary

Evaluates user understanding level

Formats for immediate use

4. User Action Phase
Displays options in popup interface

Implements copy-to-clipboard

Auto-start new sessions

History management

🏷️ Tags
<div align="center">
#AI #ChromeExtension #ChatGPT #LlamaModel #Claude #Grok #Gemini #DeepSeek #Perplexity #StudentProject #AIAssistant #Automation #Productivity #TechInnovation #OpenSource #WebExtension #AITools #DeveloperTools #StudyTools #WorkflowOptimization

</div>
<div align="center"> <p style="margin-top: 2rem;"> <strong>Built with ❤️ for productive AI conversations</strong> </p> <p> <em>Version 2.0 | Last Updated: December 2024</em> </p> </div> ```
