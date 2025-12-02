const CONFIG = {
    GROQ_API_KEY: "",  // <-- REPLACE WITH YOUR KEY
    GROQ_API_URL: "https://api.groq.com/openai/v1/chat/completions",
    GROQ_MODEL: "llama-3.1-8b-instant",
    MAX_MESSAGES: 19,
    MAX_MESSAGE_LENGTH: 500,
    SUMMARY_TOKENS: 2000,
    SUMMARY_TEMPERATURE: 0.3
};

const captureBtn = document.getElementById("captureBtn");
const chatList = document.getElementById("chatList");
const warningMsg = document.getElementById("warning");
const summaryModal = document.getElementById("summaryModal");
const summaryText = document.getElementById("summaryText");
const closeSummaryBtn = document.getElementById("closeSummaryBtn");
const copySummaryBtn = document.getElementById("copySummaryBtn");
const emptyState = document.getElementById("emptyState");
const autoStartBtnModal = document.getElementById("autoStartBtnModal");
const modelSelect = document.getElementById("modelSelect");
const openAndSendBtn = document.getElementById("openAndSendBtn");

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function getAISource(url) {
    const u = url.toLowerCase();
    if (u.includes("chatgpt") || u.includes("openai")) return "ChatGPT";
    if (u.includes("claude") || u.includes("anthropic")) return "Claude";
    if (u.includes("grok") || u.includes("x.ai")) return "Grok";
    if (u.includes("gemini") || u.includes("google")) return "Gemini";
    if (u.includes("perplexity")) return "Perplexity";
    if (u.includes("deepseek")) return "DeepSeek";
    return "Unknown";
}

function isSupportedWebsite(url) {
    const u = url.toLowerCase();
    const sites = [
        "chatgpt.com", "chat.openai.com",
        "claude.ai", "anthropic.com",
        "grok.com", "x.ai/grok", "grok.x.ai",
        "gemini.google.com",
        "perplexity.ai",
        "deepseek.com",
        "poe.com", "you.com",
        "localhost", "127.0.0.1"
    ];
    return sites.some(s => u.includes(s));
}

function getAIIcon(name) {
    const map = {
        "ChatGPT": '<i class="fas fa-robot"></i>',
        "Claude": '<i class="fas fa-brain"></i>',
        "Grok": '<i class="fas fa-rocket"></i>',
        "Gemini": '<i class="fas fa-gem"></i>',
        "Perplexity": '<i class="fas fa-search"></i>',
        "DeepSeek": '<i class="fas fa-eye"></i>'
    };
    return map[name] || '<i class="fas fa-comments"></i>';
}

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs[0]?.url || !isSupportedWebsite(tabs[0].url)) {
        warningMsg.style.display = "block";
        captureBtn.style.display = "none";
    } else {
        warningMsg.style.display = "none";
        captureBtn.style.display = "block";
    }
});

/* ---------------------- LOAD CHATS ---------------------- */
function loadChats() {
    chrome.storage.local.get("chats", data => {
        const chats = data.chats || [];
        emptyState.style.display = chats.length ? "none" : "block";
        chatList.innerHTML = "";

        chats.forEach(chat => {
            const card = document.createElement("div");
            card.className = "chatCard";
            card.dataset.ai = chat.ai;

            const actionBtn = chat.summary
                ? `<button class="action-btn viewBtn" data-id="${chat.id}"><i class="fas fa-eye"></i></button>`
                : `<button class="action-btn genBtn" data-id="${chat.id}"><i class="fas fa-magic"></i></button>`;

            const autoBtn = chat.summary
                ? `<button class="action-btn autoStartBtn" data-id="${chat.id}"><i class="fas fa-play"></i></button>`
                : "";

            card.innerHTML = `
                <div class="chat-info">
                    <h3>${escapeHtml(chat.title)}</h3>
                    <div class="ai-badge">${getAIIcon(chat.ai)} <span class="ai-name">${escapeHtml(chat.ai)}</span></div>
                </div>
                <div class="actions">
                    ${actionBtn}${autoBtn}
                    <button class="action-btn delBtn" data-id="${chat.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            chatList.appendChild(card);
        });
    });
}

/* ---------------------- CAPTURE BUTTON ---------------------- */
captureBtn.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const ai = getAISource(tab.url);

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });

    const res = await chrome.tabs.sendMessage(tab.id, { action: "CAPTURE_CHAT" });

    if ((!res?.userMessages || res.userMessages.length === 0) &&
        (!res?.aiMessages || res.aiMessages.length === 0)) {
        return;
    }

    await chrome.runtime.sendMessage({
        action: "SAVE_CHAT",
        title: "Chat — " + new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }),
        ai,
        userMessages: res.userMessages || [],
        aiMessages: res.aiMessages || []
    });

    loadChats();
});

/* ---------------------- SUMMARY GENERATION ---------------------- */
async function generateAISummary(messages) {
    if (!CONFIG.GROQ_API_KEY || CONFIG.GROQ_API_KEY.startsWith("x")) return null;

    const { userMessages = [], aiMessages = [] } = messages;

    let conversationSequence = [];
    let maxLength = Math.max(userMessages.length, aiMessages.length);

    for (let i = 0; i < maxLength; i++) {
        if (i < userMessages.length) {
            const userMsg = userMessages[i];
            const userText = userMsg.length > CONFIG.MAX_MESSAGE_LENGTH
                ? `${userMsg.substring(0, CONFIG.MAX_MESSAGE_LENGTH)}...`
                : userMsg;

            conversationSequence.push({
                index: conversationSequence.length + 1,
                role: "USER",
                text: userText,
                originalLength: userMsg.length
            });
        }

        if (i < aiMessages.length) {
            const aiMsg = aiMessages[i];
            const aiText = aiMsg.length > CONFIG.MAX_MESSAGE_LENGTH
                ? `${aiMsg.substring(0, CONFIG.MAX_MESSAGE_LENGTH)}...`
                : aiMsg;

            conversationSequence.push({
                index: conversationSequence.length + 1,
                role: "AI",
                text: aiText,
                originalLength: aiMsg.length
            });
        }
    }

    const formatMessageForDisplay = (msg) => {
        const prefix = msg.role === "USER" ? "👤 USER" : "🤖 AI";
        const lengthNote = msg.originalLength > CONFIG.MAX_MESSAGE_LENGTH
            ? ` [${msg.originalLength} chars → truncated]`
            : ` [${msg.originalLength} chars]`;
        return `${prefix}${lengthNote}:\n${msg.text}`;
    };

    const visualSequence = conversationSequence.map((msg, idx) =>
        `[${idx + 1}] ${formatMessageForDisplay(msg)}`
    ).join("\n\n");

    const prompt = `
You are analyzing a conversation between a user and an AI assistant. 
Below is the EXACT conversation sequence with alternating user and AI messages:

${conversationSequence.map((msg, idx) => `
[${idx + 1}] ${formatMessageForDisplay(msg)}
`).join("\n")}

----------------------------

Based on this conversation, create a **continuation summary** with the following sections:

1. **MAIN TOPIC**  
   What is the overall subject of this conversation?

2. **WHAT HAS BEEN DISCUSSED SO FAR**  
   Summarize progress, reasoning steps, partial explanations, and flow.

3. **WHERE THE CONVERSATION STOPPED**  
   Precisely describe the last AI message and what the user asked for next.

4. **USER UNDERSTANDING LEVEL**  
   Briefly describe how advanced the user's thinking and understanding is.

5. **WHAT IS STILL LEFT**  
   What logically comes next in this conversation?

6. **NEXT NATURAL STEPS**  
   1. …
   2. …

7. **CONTINUATION INSTRUCTION FOR THE NEXT AI**  
   Write a short instruction that forces the next AI to:
   - Continue the exact same conversation
   - Never say "I will act like..." or "continuing as..."
   - Respond naturally as if the previous AI is still talking
   - On the first message, it should say:
       "We have covered this. What would you like to do next — continue or move to the next topic?"
   - Maintain the same tone, personality, teaching style, and level.

Format EXACTLY like this:

MAIN TOPIC:
...

WHAT HAS BEEN DISCUSSED SO FAR:
...

WHERE THE CONVERSATION STOPPED:
...

USER UNDERSTANDING LEVEL:
...

WHAT IS STILL LEFT:
...

NEXT NATURAL STEPS:
1. ...
2. ...

HOW TO CONTINUE:
"Your short instruction here"

Ensure clarity, conciseness, and relevance in your summary.
keep reference to the last AI message and user query,so the next AI can pick up seamlessly and user should feel like it is autometicly generating next 
topic or the previous topic continuation.as example if suppose on previous where user was studying oops in python and on the previous ai it only completed the 
class and object part the next model can capture the progress and continue to next topics like inheritance , polymorphism etc.try to continue to the next topic or 
generate next topic automatically based on the previous context.or if confusded ask user what they want to do next or give a brief of there up to date progress 
`;

    const resp = await fetch(CONFIG.GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + CONFIG.GROQ_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: CONFIG.GROQ_MODEL,
            messages: [{ role: "user", content: prompt }],
            max_tokens: CONFIG.SUMMARY_TOKENS,
            temperature: CONFIG.SUMMARY_TEMPERATURE
        })
    });

    const data = await resp.json();

    if (resp.ok) {
        const aiSummary = data.choices[0]?.message?.content?.trim();

        const fullSummary = `✅ CONVERSATION CAPTURED (${userMessages.length} user + ${aiMessages.length} AI messages):

${visualSequence}

----------------------------

🤖 AI-GENERATED CONTINUATION SUMMARY:
${aiSummary}`;

        return fullSummary;
    }

    return null;
}

/* ---------------------- AUTO START HANDLER ---------------------- */
async function handleAutoStart(id) {
    const { chats } = await chrome.storage.local.get("chats");
    const chat = chats.find(c => c.id === id);
    if (!chat?.summary) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    try {
        await chrome.tabs.sendMessage(tab.id, {
            action: "AUTO_START",
            text: chat.summary
        });
    } catch {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, {
                action: "AUTO_START",
                text: chat.summary
            });
        }, 1000);
    }
}

/* ---------------------- SUMMARY POPUP ---------------------- */
function showSummaryPopup(text) {
    summaryText.textContent = text;

    if (autoStartBtnModal) autoStartBtnModal.style.display = "inline-block";
    if (modelSelect) modelSelect.style.display = "inline-block";
    if (openAndSendBtn) openAndSendBtn.style.display = "inline-block";

    summaryModal.style.display = "flex";
    document.body.style.overflow = 'hidden';
}

/* ---------------------- CHAT CARD ACTIONS ---------------------- */
chatList.addEventListener("click", async e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (isNaN(id)) return;

    const { chats } = await chrome.storage.local.get("chats");
    const chat = chats.find(c => c.id === id);

    if (btn.classList.contains("delBtn")) {
        if (confirm("Delete this chat?")) {
            await chrome.runtime.sendMessage({
                action: "DELETE_CHAT",
                id
            });
            loadChats();
        }
        return;
    }

    if (btn.classList.contains("viewBtn")) {
        if (chat?.summary) showSummaryPopup(chat.summary);
        return;
    }

    if (btn.classList.contains("genBtn")) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        const summary = await generateAISummary({
            userMessages: chat.userMessages || [],
            aiMessages: chat.aiMessages || []
        });

        if (summary) {
            await chrome.storage.local.set({
                chats: chats.map(c =>
                    c.id === id ? { ...c, summary } : c
                )
            });
            loadChats();
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-magic"></i>';
        return;
    }

    if (btn.classList.contains("autoStartBtn")) {
        await handleAutoStart(id);
    }
});

/* ---------------------- SUMMARY POPUP BUTTONS ---------------------- */
closeSummaryBtn.onclick = () => {
    summaryModal.style.display = "none";
    document.body.style.overflow = '';
};

summaryModal.onclick = e => {
    if (e.target === summaryModal) {
        summaryModal.style.display = "none";
        document.body.style.overflow = '';
    }
};

copySummaryBtn.onclick = () =>
    navigator.clipboard.writeText(summaryText.textContent);

/* ---------------------- AUTO START FROM POPUP MODAL ---------------------- */
autoStartBtnModal.onclick = async () => {
    const text = summaryText.textContent;

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    try {
        await chrome.tabs.sendMessage(tab.id, {
            action: "AUTO_START",
            text
        });
    } catch {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, {
                action: "AUTO_START",
                text
            });
        }, 1000);
    }

    window.close();
};

/* ---------------------- OPEN MODEL + AUTO SEND ---------------------- */
openAndSendBtn.onclick = async () => {
    const text = summaryText.textContent;
    const model = modelSelect.value;

    const urls = {
        chatgpt: "https://chat.openai.com/",
        claude: "https://claude.ai/chat",
        deepseek: "https://chat.deepseek.com/",
        perplexity: "https://www.perplexity.ai/",
        grok: "https://grok.x.ai/",
        gemini: "https://gemini.google.com/app"
    };

    const tab = await chrome.tabs.create({
        url: urls[model] || urls.chatgpt,
        active: true
    });

    const inject = async () => {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, {
                action: "AUTO_START",
                text
            });
        }, 1500);

        window.close();
    };

    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            setTimeout(inject, 2000);
        }
    });
};

/* ---------------------- INITIAL LOAD ---------------------- */
document.addEventListener('DOMContentLoaded', loadChats);