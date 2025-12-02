// background.js
console.log("🎯 AI Prompt Saver background service initialized");

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ 
        installed: true,
        version: "1.0",
        installedAt: new Date().toISOString()
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "SAVE_CHAT") {
        chrome.storage.local.get("chats", (data) => {
            const chats = data.chats || [];
            const newChat = {
                id: Date.now(),
                title: message.title,
                ai: message.ai,
                userMessages: message.userMessages || [],
                aiMessages: message.aiMessages || [],
                timestamp: new Date().toISOString()
            };
            
            chats.unshift(newChat);
            if (chats.length > 50) chats.pop();
            
            chrome.storage.local.set({ chats }, () => {
                sendResponse({ success: true, id: newChat.id });
            });
        });
        return true;
    }
    
    if (message.action === "DELETE_CHAT") {
        chrome.storage.local.get("chats", (data) => {
            const chats = data.chats || [];
            const updatedChats = chats.filter(c => c.id !== message.id);
            chrome.storage.local.set({ chats: updatedChats }, () => {
                sendResponse({ success: true });
            });
        });
        return true;
    }
    
    if (message.action === "PING_FROM_POPUP") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "PING" }, (response) => {
                    if (chrome.runtime.lastError) {
                        sendResponse({ 
                            error: chrome.runtime.lastError.message,
                            tabUrl: tabs[0].url
                        });
                    } else {
                        sendResponse(response);
                    }
                });
            } else {
                sendResponse({ error: "No active tab found" });
            }
        });
        return true;
    }
    
    sendResponse({ status: "OK" });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        const aiSites = [
            'chat.openai.com',
            'chatgpt.com',
            'claude.ai',
            'anthropic.com',
            'deepseek.com',
            'perplexity.ai',
            'grok.com',
            'x.ai',
            'gemini.google.com'
        ];
        
        const isAISite = aiSites.some(site => tab.url?.includes(site));
        if (isAISite) {
            setTimeout(() => {
                chrome.tabs.sendMessage(tabId, { action: "PING" });
            }, 2000);
        }
    }
});