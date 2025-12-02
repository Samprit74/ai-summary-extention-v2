console.log("AI Prompt Saver content script loaded - AUTO-START READY");

/* ---------------------- SITE DETECTOR (IMPROVED) ---------------------- */
function detectSite() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();

    if (url.includes("chat.openai") || url.includes("chatgpt.com")) return "chatgpt";
    if (url.includes("deepseek.com") || url.includes("chat.deepseek")) return "deepseek";
    if (url.includes("claude.ai")) return "claude";
    if (url.includes("perplexity.ai")) return "perplexity";
    if (url.includes("gemini.google") || hostname.includes("google.com")) {
        if (document.querySelector('textarea[placeholder*="Gemini"]') || 
            document.querySelector('[aria-label*="Gemini"]') ||
            document.querySelector('button.send-button')) {
            return "gemini";
        }
    }
    if (url.includes("x.ai/grok") || url.includes("grok.x.ai") || url.includes("grok.com")) return "grok";

    return "unknown";
}

/* ---------------------- WAIT FOR PAGE LOAD ---------------------- */
let site = "unknown";
let isReady = false;

function initialize() {
    site = detectSite();
    console.log("Detected AI site:", site);
    isReady = true;
}

// Wait for page to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

/* ---------------------- EXTRACTORS (USER MESSAGES) ---------------------- */

// CHATGPT USER (UPDATED)
function extractChatGPT() {
    const messages = [];
    
    // Find all message containers
    const allMessages = document.querySelectorAll('div.min-h-8.text-message.relative');
    
    allMessages.forEach(el => {
        // Check parent for user role
        const parent = el.closest('[data-message-author-role]');
        if (parent && parent.getAttribute('data-message-author-role') === 'user') {
            const text = el.innerText?.trim();
            if (text && text.length > 0) {
                messages.push(text);
            }
        }
    });
    
    return messages;
}

// DEEPSEEK USER (FIXED)
function extractDeepSeek() {
    const messages = [];
    
    // User messages have the d29f3d7d prefix (based on your analysis)
    const userElements = document.querySelectorAll('.d29f3d7d.ds-message._63c77b1');
    
    userElements.forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 0) {
            messages.push(text);
        }
    });
    
    return messages;
}

// CLAUDE USER (UPDATED FOR NEW STRUCTURE)
function extractClaude() {
    const messages = [];
    
    // Find user messages based on the HTML structure you provided
    const userElements = document.querySelectorAll('div[data-testid="user-message"]');
    
    userElements.forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 0) {
            messages.push(text);
        }
    });
    
    return messages;
}

// PERPLEXITY USER (UPDATED)
function extractPerplexity() {
    const messages = [];
    
    // Find user messages based on the HTML structure you provided
    const userElements = document.querySelectorAll('span.select-text, div.flex.min-w-\\[48px\\].items-center.justify-center.bg-offset');
    
    userElements.forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 0) {
            messages.push(text);
        }
    });
    
    // Alternative: look for user query containers
    if (messages.length === 0) {
        const userQueries = document.querySelectorAll('div.group\\/query.relative.whitespace-pre-line');
        userQueries.forEach(el => {
            const text = el.innerText?.trim();
            if (text && text.length > 0) {
                messages.push(text);
            }
        });
    }
    
    return messages;
}

// GEMINI USER (UPDATED FOR NEW STRUCTURE)
function extractGemini() {
    const messages = [];
    
    // Find user messages - look for user query containers
    const userSelectors = [
        'div[class*="user-message"]',
        'div[class*="user-query"]',
        'div[class*="query-text"]',
        'div[data-role="user"]',
        'div.message-user',
        'div.userMessage',
        '[data-prompts-content]',
        '.user-query',
        '[class*="query-text"]',
        '[aria-label*="prompt"]'
    ];
    
    userSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            const text = el.innerText?.trim();
            if (text && text.length > 0) {
                messages.push(text);
            }
        });
    });
    
    return messages;
}

// GROK USER
function extractGrok() {
    const messages = [];
    
    const userBubbles = document.querySelectorAll(
        '.message-bubble, [class*="message-"], [class*="bubble"]'
    );

    userBubbles.forEach(bubble => {
        const style = window.getComputedStyle(bubble);
        const isUserMessage = bubble.className?.includes('user') || 
                             bubble.parentElement?.className?.includes('user') ||
                             style.backgroundColor?.includes('rgb') ||
                             bubble.querySelector('p, span');

        if (isUserMessage) {
            const text = bubble.innerText?.trim();
            if (text) messages.push(text);
        }
    });

    return messages;
}

/* ---------------------- USER MESSAGE WRAPPER ---------------------- */
function getUserMessages() {
    if (!isReady) return [];

    try {
        switch (site) {
            case "chatgpt": return extractChatGPT();
            case "deepseek": return extractDeepSeek();
            case "claude": return extractClaude();
            case "perplexity": return extractPerplexity();
            case "gemini": return extractGemini();
            case "grok": return extractGrok();
            default: return extractGeneric();
        }
    } catch (err) {
        console.error("Extractor error:", err);
        return [];
    }
}

/* ---------------------- GENERIC FALLBACK ---------------------- */
function extractGeneric() {
    const messages = [];

    document.querySelectorAll('textarea').forEach(ta => {
        if (ta.value?.trim()) messages.push(ta.value.trim());
    });

    document.querySelectorAll('div, p, span').forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 20) {
            const parentText = el.parentElement?.innerText?.trim();
            if (!parentText || parentText === text) messages.push(text);
        }
    });

    return messages;
}

/* ---------------------- AI RESPONSE EXTRACTORS  ---------------------- */

// CHATGPT AI 
function extractChatGPT_AI() {
    const messages = [];
    
    // Find all message containers
    const allMessages = document.querySelectorAll('div.min-h-8.text-message.relative');
    
    allMessages.forEach(el => {
        // Check parent for assistant role
        const parent = el.closest('[data-message-author-role]');
        if (parent && parent.getAttribute('data-message-author-role') === 'assistant') {
            const text = el.innerText?.trim();
            if (text && text.length > 0) {
                messages.push(text);
            }
        }
    });
    
    return messages;
}

// DEEPSEEK AI 
function extractDeepSeek_AI() {
    const messages = [];
    
    // AI responses don't have the d29f3d7d prefix 
    const aiElements = document.querySelectorAll('.ds-message._63c77b1:not(.d29f3d7d)');
    
    aiElements.forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 0) {
            messages.push(text);
        }
    });
    
    return messages;
}

// CLAUDE AI RESPONSE EXTRACTOR 
function extractClaude_AI() {
    const messages = [];
    
    // Look for AI response containers with the font-claude-response class
    const aiContainers = document.querySelectorAll('.font-claude-response, .font-claude-response-body');
    
    aiContainers.forEach(container => {
        // Get all paragraph elements within the response
        const paragraphs = container.querySelectorAll('p.font-claude-response-body');
        
        let responseText = '';
        paragraphs.forEach(p => {
            const text = p.innerText?.trim();
            if (text && text.length > 0) {
                responseText += text + ' ';
            }
        });
        
        responseText = responseText.trim();
        
        // Also check direct text content
        if (!responseText && container.innerText?.trim()) {
            responseText = container.innerText.trim();
        }
        
        if (responseText) {
            messages.push(responseText);
        }
    });
    
    return messages;
}

// PERPLEXITY AI (UPDATED)
function extractPerplexity_AI() {
    const messages = [];
    
    // Find AI responses based on the HTML structure 
    const aiContainers = document.querySelectorAll('div.prose.dark\\:prose-invert');
    
    aiContainers.forEach(container => {
        let responseText = '';
        
        // Get all paragraph elements within the response
        const paragraphs = container.querySelectorAll('p');
        paragraphs.forEach(p => {
            const text = p.innerText?.trim();
            if (text && text.length > 0) {
                responseText += text + '\n';
            }
        });
        
        // Also check for direct text content in the container
        if (!responseText || responseText.trim().length === 0) {
            const directText = container.innerText?.trim();
            if (directText && directText.length > 0) {
                responseText = directText;
            }
        }
        
        // Check for markdown content containers
        const markdownContainer = container.closest('div[id^="markdown-content-"]');
        if (markdownContainer && (!responseText || responseText.length < 10)) {
            const markdownText = markdownContainer.innerText?.trim();
            if (markdownText && markdownText.length > 0) {
                responseText = markdownText;
            }
        }
        
        responseText = responseText.trim();
        
        if (responseText && responseText.length > 0) {
            messages.push(responseText);
        }
    });
    
    // Fallback: look for any answer/response containers
    if (messages.length === 0) {
        const answerContainers = document.querySelectorAll('div.border-subtlest, div[class*="answer"], div[class*="response"]');
        answerContainers.forEach(container => {
            const text = container.innerText?.trim();
            if (text && text.length > 20) {
                messages.push(text);
            }
        });
    }
    
    return messages;
}

// GEMINI AI 
function extractGemini_AI() {
    const messages = [];
    
    // Find AI responses based on the HTML structure you provided
    const aiSelectors = [
        'message-content.model-response-text',
        'div.markdown.markdown-main-panel',
        '[data-response-content]',
        '.gemini-response',
        '[class*="response-text"]',
        'div[class*="model-response"]',
        'div[class*="ai-response"]'
    ];
    
    aiSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(container => {
            let responseText = '';
            
            // Get all paragraph elements
            const paragraphs = container.querySelectorAll('p');
            paragraphs.forEach(p => {
                const text = p.innerText?.trim();
                if (text && text.length > 0) {
                    responseText += text + '\n';
                }
            });
            
            // If no paragraphs found, get direct text
            if (!responseText || responseText.trim().length === 0) {
                const directText = container.innerText?.trim();
                if (directText && directText.length > 0) {
                    responseText = directText;
                }
            }
            
            responseText = responseText.trim();
            
            if (responseText && responseText.length > 0) {
                messages.push(responseText);
            }
        });
    });
    
    return messages;
}

// GROK AI
function extractGrok_AI() {
    const messages = [];

    const aiBubbles = document.querySelectorAll(
        '.message-bubble, [class*="assistant"], [class*="ai"], [class*="bot"]'
    );

    aiBubbles.forEach(bubble => {
        const txt = bubble.innerText?.trim();
        if (txt) messages.push(txt);
    });

    return messages;
}

/* ---------------------- AI RESPONSE WRAPPER ---------------------- */
function getAIResponses() {
    if (!isReady) return [];

    try {
        switch (site) {
            case "chatgpt": return extractChatGPT_AI();
            case "deepseek": return extractDeepSeek_AI();
            case "claude": return extractClaude_AI();
            case "perplexity": return extractPerplexity_AI();
            case "gemini": return extractGemini_AI();
            case "grok": return extractGrok_AI();
            default: return [];
        }
    } catch (err) {
        console.error("AI extraction error:", err);
        return [];
    }
}

/* ---------------------- WAIT FOR ELEMENT UTILITIES ---------------------- */
function waitForElement(selector, timeout = 10000) {
    return new Promise(resolve => {
        const el = document.querySelector(selector);
        if (el && el.offsetParent !== null) return resolve(el);

        const observer = new MutationObserver(() => {
            const e = document.querySelector(selector);
            if (e && e.offsetParent !== null) {
                observer.disconnect();
                resolve(e);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true, attributes: true });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}

async function waitForElementOrFallback(selectors, timeout = 8000) {
    for (let sel of selectors) {
        const found = await waitForElement(sel, timeout / selectors.length);
        if (found) {
            console.log(`Found element with selector: ${sel}`);
            return found;
        }
    }
    console.log("No selector matched from list:", selectors);
    return null;
}

/* ---------------------- SIMPLE INPUT INJECTION  ---------------------- */
async function injectToInputOnly(text, selectors) {
    console.log(`Trying input-only injection...`);

    for (const sel of selectors) {
        const input = document.querySelector(sel);
        if (input && input.offsetParent !== null) {
            input.focus();

            if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
                input.value = text;
            } else if (input.isContentEditable || input.tagName === 'DIV') {
                input.textContent = text;
            }

            ['input','change','keydown','keyup','focus']
                .forEach(ev => input.dispatchEvent(new Event(ev, { bubbles: true })));

            return true;
        }
    }
    return false;
}

/* ---------------------- DEEPSEEK AUTO-SUBMIT FUNCTION ---------------------- */
async function submitDeepSeek() {
    console.log("DeepSeek auto-submit starting...");
    
    const deepseekSubmitSelectors = [
        'button.ds-send-button',
        'button[type="submit"]',
        'button[aria-label*="Send"]',
        'button[class*="ds-icon-button"]'
    ];
    
    const submitButton = await waitForElementOrFallback(deepseekSubmitSelectors);
    
    if (submitButton) {
        console.log("Found DeepSeek submit button:", submitButton);
        
        submitButton.focus();
        submitButton.click();
        
        ['mousedown', 'mouseup', 'click', 'focus'].forEach(eventType => {
            submitButton.dispatchEvent(new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                view: window
            }));
        });
        
        console.log("DeepSeek submit button clicked successfully");
        return true;
    }
    
    console.log("No DeepSeek submit button found");
    return false;
}

async function injectToDeepSeekWithSubmit(text) {
    console.log("DeepSeek injection with auto-submit...");
    
    const deepseekInputSelectors = [
        'textarea[placeholder="Message DeepSeek"]',
        'textarea.ds-scroll-area',
        'textarea[class*="ds-"]',
        'textarea'
    ];
    
    const input = await waitForElementOrFallback(deepseekInputSelectors);
    if (!input) {
        console.log("No DeepSeek input field found");
        return false;
    }
    
    console.log("Found DeepSeek input:", input);
    
    input.focus();
    input.value = text;
    
    ['input', 'change', 'keydown', 'keyup', 'focus'].forEach(eventType => {
        input.dispatchEvent(new Event(eventType, { 
            bubbles: true, 
            cancelable: true 
        }));
    });
    
    input.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: text,
        inputType: "insertText"
    }));
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const submitted = await submitDeepSeek();
    
    if (submitted) {
        console.log("DeepSeek auto-submit completed successfully");
        return true;
    }
    
    console.log("Trying Enter key fallback...");
    input.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        charCode: 13,
        bubbles: true,
        cancelable: true
    }));
    
    return true;
}

/* ---------------------- CLAUDE SPECIAL INJECTION  ---------------------- */
async function injectToClaudeWithSubmit(text) {
    console.log("Claude-specific injection starting...");

    // Try to find the contenteditable div or textarea first
    const inputSelectors = [
        'div[contenteditable="true"]',
        'div[role="textbox"]',
        '.ProseMirror',
        'textarea'
    ];

    const input = await waitForElementOrFallback(inputSelectors);
    if (!input) {
        console.log("No Claude input field found");
        return false;
    }

    console.log("Found Claude input:", input);

    // Focus and set the text
    input.focus();
    
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
        input.value = text;
    } else if (input.isContentEditable || input.tagName === 'DIV') {
        input.textContent = text;
    }

    // Trigger all relevant events
    ['input', 'change', 'keydown', 'keyup', 'focus', 'blur'].forEach(eventType => {
        input.dispatchEvent(new Event(eventType, { 
            bubbles: true, 
            cancelable: true 
        }));
    });

    input.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: text,
        inputType: "insertText"
    }));

    await new Promise(resolve => setTimeout(resolve, 400));

    // Now find and click the submit button
    console.log("Looking for Claude submit button...");
    
    const submitSelectors = [
        'button[aria-label="Send message"]',
        'button.Button_claude__c_hZy',
        'button[type="button"]:not([disabled])',
        'button:has(svg)',
        'button[class*="send"]',
        'button[class*="submit"]'
    ];

    const submitBtn = await waitForElementOrFallback(submitSelectors);
    
    if (submitBtn) {
        console.log("Found Claude submit button:", submitBtn);
        
        // Check if button is disabled
        if (submitBtn.disabled) {
            console.log("Submit button is disabled, trying to enable it...");
            
            // Remove disabled attribute
            submitBtn.removeAttribute('disabled');
            submitBtn.classList.remove('disabled');
            
            // Trigger focus and mouse events
            submitBtn.focus();
            submitBtn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            submitBtn.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Click the button with all necessary events
        submitBtn.click();
        
        // Dispatch additional mouse events to simulate real click
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            submitBtn.dispatchEvent(new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                view: window,
                buttons: 1
            }));
        });
        
        console.log("Claude submit button clicked successfully");
        return true;
    } else {
        console.log("No Claude submit button found, trying Enter key...");
        
        // Fallback: Send Enter key
        input.dispatchEvent(new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            charCode: 13,
            bubbles: true,
            cancelable: true
        }));
        
        input.dispatchEvent(new KeyboardEvent("keypress", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            charCode: 13,
            bubbles: true,
            cancelable: true
        }));
        
        return true;
    }
}

/* ---------------------- GEMINI SPECIAL INJECTION  ---------------------- */
async function injectToGeminiWithSubmit(text) {
    console.log("Gemini injection starting...");

    
    const inputSelectors = [
        'div.ql-editor.textarea.new-input-ui[contenteditable="true"]',
        'div[contenteditable="true"][aria-label*="Enter a prompt"]',
        'div[contenteditable="true"][data-placeholder*="Ask Gemini"]',
        'div[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"]',
        'textarea[placeholder*="Gemini"]',
        'textarea[placeholder*="gemini"]',
        'textarea[aria-label*="prompt"]',
        'textarea'
    ];

    const input = await waitForElementOrFallback(inputSelectors, 10000);
    if (!input) {
        console.log("No Gemini input field found");
        return false;
    }

    console.log("Found Gemini input:", input);

    // Focus and set the text
    input.focus();
    
    // Clear any existing content first
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
        input.value = text;
    } else if (input.isContentEditable || input.tagName === 'DIV') {
        // Clear existing content
        input.innerHTML = '';
        
        // Create a paragraph element with the text 
        const p = document.createElement('p');
        p.textContent = text;
        input.appendChild(p);
        
        // Also set text content for good measure
        input.textContent = text;
    }

    // Trigger all relevant events
    ['input', 'change', 'keydown', 'keyup', 'focus', 'blur'].forEach(eventType => {
        input.dispatchEvent(new Event(eventType, { 
            bubbles: true, 
            cancelable: true 
        }));
    });

    // Create a proper input event
    input.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: text,
        inputType: "insertText"
    }));

    // Also trigger composition events for contenteditable
    if (input.isContentEditable) {
        input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
        input.dispatchEvent(new CompositionEvent("compositionupdate", { 
            bubbles: true,
            data: text 
        }));
        input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    // Now find and click the submit button
    console.log("Looking for Gemini submit button...");
    
    const submitSelectors = [
        'button.send-button[aria-label="Send message"]',
        'button.send-button',
        'button[aria-label="Send message"]',
        'button[class*="send-button"]',
        'button[type="submit"]',
        'button.submit',
        'button:has(mat-icon[data-mat-icon-name="send"])',
        'button:has(mat-icon.send-button-icon)'
    ];

    const submitBtn = await waitForElementOrFallback(submitSelectors, 8000);
    
    if (submitBtn) {
        console.log("Found Gemini submit button:", submitBtn);
        
        // Check if button is disabled
        if (submitBtn.disabled || submitBtn.getAttribute('aria-disabled') === 'true') {
            console.log("Submit button is disabled, trying to enable it...");
            
            // Remove disabled attribute
            submitBtn.removeAttribute('disabled');
            submitBtn.removeAttribute('aria-disabled');
            
            // Remove disabled classes
            submitBtn.classList.remove('disabled');
            submitBtn.classList.remove('mat-button-disabled');
            
            // Trigger focus and mouse events
            submitBtn.focus();
            submitBtn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            submitBtn.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
            
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Click the button with all necessary events
        submitBtn.click();
        
        // Dispatch additional mouse events to simulate real click
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            submitBtn.dispatchEvent(new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                view: window,
                buttons: 1
            }));
        });
        
        // Also trigger Angular events
        submitBtn.dispatchEvent(new Event('ng-click', { bubbles: true }));
        
        console.log("Gemini submit button clicked successfully");
        return true;
    } else {
        console.log("No Gemini submit button found, trying Enter key...");
        
        // Fallback: Send Enter key
        input.dispatchEvent(new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            charCode: 13,
            bubbles: true,
            cancelable: true,
            shiftKey: false,
            ctrlKey: false,
            altKey: false,
            metaKey: false
        }));
        
        input.dispatchEvent(new KeyboardEvent("keypress", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            charCode: 13,
            bubbles: true,
            cancelable: true
        }));
        
        input.dispatchEvent(new KeyboardEvent("keyup", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            charCode: 13,
            bubbles: true,
            cancelable: true
        }));
        
        return true;
    }
}

/* ---------------------- PERPLEXITY SPECIAL INJECTION ---------------------- */
async function injectToPerplexityWithSubmit(text) {
    console.log("Perplexity injection starting...");

    // Try to find the contenteditable input first
    const inputSelectors = [
        'div[contenteditable="true"][id="ask-input"]',
        'div[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"]',
        'textarea[placeholder*="Ask"]',
        'textarea[placeholder*="ask"]',
        'textarea'
    ];

    const input = await waitForElementOrFallback(inputSelectors, 10000);
    if (!input) {
        console.log("No Perplexity input field found");
        return false;
    }

    console.log("Found Perplexity input:", input);

    // Focus and set the text
    input.focus();
    
    // Clear any existing content first
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
        input.value = text;
    } else if (input.isContentEditable || input.tagName === 'DIV') {
        // Clear existing content
        input.innerHTML = '';
        
        // Create a paragraph element with the text
        const p = document.createElement('p');
        p.textContent = text;
        p.dir = 'auto';
        p.className = '__web-inspector-hide-shortcut__';
        input.appendChild(p);
        
        // Also set text content for good measure
        input.textContent = text;
    }

    // Trigger all relevant events
    ['input', 'change', 'keydown', 'keyup', 'focus', 'blur'].forEach(eventType => {
        input.dispatchEvent(new Event(eventType, { 
            bubbles: true, 
            cancelable: true 
        }));
    });

    // Create a proper input event
    input.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: text,
        inputType: "insertText"
    }));

    // Also trigger composition events for contenteditable
    if (input.isContentEditable) {
        input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
        input.dispatchEvent(new CompositionEvent("compositionupdate", { 
            bubbles: true,
            data: text 
        }));
        input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    // Now find and click the submit button
    console.log("Looking for Perplexity submit button...");
    
    const submitSelectors = [
        'button[data-testid="submit-button"]',
        'button[aria-label="Submit"]',
        'button[aria-label*="Ask"]',
        'button[aria-label*="ask"]',
        'button[aria-label*="Send"]',
        'button[type="button"]:not([disabled])',
        'button.bg-black',
        'button.rounded-full',
        'button:has(svg)',
        'button[class*="submit"]'
    ];

    const submitBtn = await waitForElementOrFallback(submitSelectors, 8000);
    
    if (submitBtn) {
        console.log("Found Perplexity submit button:", submitBtn);
        
        // Check if button is disabled
        if (submitBtn.disabled) {
            console.log("Submit button is disabled, trying to enable it...");
            
            // Remove disabled attribute
            submitBtn.removeAttribute('disabled');
            
            // Remove disabled classes
            submitBtn.classList.remove('opacity-50');
            submitBtn.classList.remove('cursor-default');
            
            // Add enabled styles
            submitBtn.classList.add('opacity-100');
            submitBtn.classList.add('cursor-pointer');
            
            // Trigger focus and mouse events
            submitBtn.focus();
            submitBtn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            submitBtn.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
            
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Click the button with all necessary events
        submitBtn.click();
        
        // Dispatch additional mouse events to simulate real click
        ['mousedown', 'mouseup', 'click'].forEach(eventType => {
            submitBtn.dispatchEvent(new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                view: window,
                buttons: 1
            }));
        });
        
        console.log("Perplexity submit button clicked successfully");
        return true;
    } else {
        console.log("No Perplexity submit button found, trying Enter key...");
        
        // Fallback: Send Enter key with Shift key 
        input.dispatchEvent(new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            charCode: 13,
            bubbles: true,
            cancelable: true,
            shiftKey: true,
            ctrlKey: false,
            altKey: false,
            metaKey: false
        }));
        
        input.dispatchEvent(new KeyboardEvent("keypress", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            charCode: 13,
            bubbles: true,
            cancelable: true,
            shiftKey: true
        }));
        
        input.dispatchEvent(new KeyboardEvent("keyup", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            charCode: 13,
            bubbles: true,
            cancelable: true,
            shiftKey: true
        }));
        
        // Also try without Shift key
        setTimeout(() => {
            input.dispatchEvent(new KeyboardEvent("keydown", {
                key: "Enter",
                code: "Enter",
                keyCode: 13,
                charCode: 13,
                bubbles: true,
                cancelable: true,
                shiftKey: false,
                ctrlKey: false,
                altKey: false,
                metaKey: false
            }));
        }, 100);
        
        return true;
    }
}

/* ---------------------- GENERIC FULL INJECTION ---------------------- */
async function injectWithSubmit(text, inputSelectors, submitSelectors) {
    console.log(`Searching for input:`, inputSelectors);

    const input = await waitForElementOrFallback(inputSelectors);
    if (!input) return false;

    input.focus();

    if (input.tagName === "TEXTAREA" || input.tagName === "INPUT") {
        input.value = text;
        ['input','change','keydown','keyup']
            .forEach(ev => input.dispatchEvent(new Event(ev, { bubbles: true })));

        input.dispatchEvent(new InputEvent("input", {
            bubbles: true,
            data: text,
            inputType: "insertText"
        }));

    } else if (input.isContentEditable || input.tagName === "DIV") {
        input.textContent = text;
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    await new Promise(res => setTimeout(res, 400));

    if (submitSelectors?.length) {
        const btn = await waitForElementOrFallback(submitSelectors);

        if (btn) {
            btn.click();
            ['mousedown','mouseup'].forEach(ev =>
                btn.dispatchEvent(new MouseEvent(ev, { bubbles: true }))
            );
            return true;
        }
    }

    const fallbackBtn =
        input.closest("form")?.querySelector('button[type="submit"]') ||
        input.parentElement?.querySelector("button") ||
        document.querySelector('button[type="submit"]');

    if (fallbackBtn) {
        fallbackBtn.click();
        return true;
    }

    return true;
}

/* ---------------------- SITE CONFIGS ---------------------- */
const siteConfigs = {
    "chatgpt": {
        input: [
            'textarea[name="prompt-textarea"]',
            '#prompt-textarea',
            'textarea[placeholder="Ask anything"]',
            'textarea'
        ],
        submit: ['button[data-testid="send-button"]', 'button[aria-label*="Send"]', 'button[type="submit"]']
    },
    "deepseek": {
        input: [
            'textarea[placeholder="Message DeepSeek"]',
            'textarea.ds-scroll-area',
            'textarea[class*="ds-"]',
            'textarea'
        ],
        submit: ['button.ds-send-button', 'button[type="submit"]', 'button[aria-label*="Send"]']
    },
    "claude": {
        input: [
            'div[contenteditable="true"]',
            'div[role="textbox"]',
            '.ProseMirror',
            'textarea'
        ],
        submit: [
            'button[aria-label="Send message"]',
            'button.Button_claude__c_hZy',
            'button[type="button"]:not([disabled])',
            'button:has(svg)',
            'button[class*="send"]',
            'button[class*="submit"]'
        ]
    },
    "perplexity": {
        input: [
            'div[contenteditable="true"][id="ask-input"]',
            'div[contenteditable="true"][role="textbox"]',
            'div[contenteditable="true"]',
            'textarea[placeholder*="Ask"]',
            'textarea[placeholder*="ask"]',
            'textarea'
        ],
        submit: [
            'button[data-testid="submit-button"]',
            'button[aria-label="Submit"]',
            'button[aria-label*="Ask"]',
            'button[aria-label*="ask"]',
            'button[aria-label*="Send"]',
            'button[type="button"]:not([disabled])',
            'button.bg-black',
            'button.rounded-full',
            'button:has(svg)',
            'button[class*="submit"]'
        ]
    },
    "gemini": {
        input: [
            'div.ql-editor.textarea.new-input-ui[contenteditable="true"]',
            'div[contenteditable="true"][aria-label*="Enter a prompt"]',
            'div[contenteditable="true"][data-placeholder*="Ask Gemini"]',
            'div[contenteditable="true"][role="textbox"]',
            'div[contenteditable="true"]',
            'textarea[placeholder*="Gemini"]',
            'textarea[placeholder*="gemini"]',
            'textarea[aria-label*="prompt"]',
            'textarea'
        ],
        submit: [
            'button.send-button[aria-label="Send message"]',
            'button.send-button',
            'button[aria-label="Send message"]',
            'button[class*="send-button"]',
            'button[type="submit"]',
            'button.submit',
            'button:has(mat-icon[data-mat-icon-name="send"])',
            'button:has(mat-icon.send-button-icon)'
        ]
    },
    "grok": {
        input: ['.ProseMirror', 'div[contenteditable="true"]', 'div.tiptap'],
        submit: ['button[type="submit"]', 'button[aria-label*="Send"]']
    }
};

/* ---------------------- MAIN AUTO-START FUNCTION ---------------------- */
async function autoStartChat(text) {
    if (!text?.trim()) return false;

    await new Promise(res => setTimeout(res, 500));

    if (site === "deepseek") {
        const ok = await injectToDeepSeekWithSubmit(text);
        if (ok) return true;
        const cfg = siteConfigs[site];
        return injectWithSubmit(text, cfg.input, cfg.submit);
    }

    if (site === "claude") {
        const ok = await injectToClaudeWithSubmit(text);
        if (ok) return true;
        const cfg = siteConfigs[site];
        return injectWithSubmit(text, cfg.input, cfg.submit);
    }

    if (site === "perplexity") {
        const ok = await injectToPerplexityWithSubmit(text);
        if (ok) return true;
        const cfg = siteConfigs[site];
        return injectWithSubmit(text, cfg.input, cfg.submit);
    }

    if (site === "gemini") {
        const ok = await injectToGeminiWithSubmit(text);
        if (ok) return true;
        const cfg = siteConfigs[site];
        return injectWithSubmit(text, cfg.input, cfg.submit);
    }

    const cfg = siteConfigs[site];
    if (cfg) {
        const ok = await injectWithSubmit(text, cfg.input, cfg.submit);
        if (ok) return true;
        return injectToInputOnly(text, cfg.input);
    }

    return injectToInputOnly(text, ['textarea', 'div[contenteditable="true"]', 'input[type="text"]']);
}

/* ---------------------- MESSAGE LISTENER ---------------------- */
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    console.log("Content script received:", req.action);

    /* ---------------------- CAPTURE_CHAT (UPDATED) ---------------------- */
    if (req.action === "CAPTURE_CHAT") {
        try {
            const userMessages = getUserMessages();
            const aiMessages = getAIResponses();

            console.log("Extracted user messages:", userMessages.length);
            console.log("Extracted AI messages:", aiMessages.length);

        

            // MODIFY THESE ANY TIME
            const LIMIT = 10;  // max AI messages to keep full
            const SKIP  = 2;   // skip pattern

            let finalAI = [];

            if (aiMessages.length > LIMIT) {
                // Always keep FIRST
                finalAI.push(aiMessages[0]);

                // Keep every SKIP+1 messages (1,4,7...)
                for (let i = SKIP + 1; i < aiMessages.length - 1; i += (SKIP + 1)) {
                    finalAI.push(aiMessages[i]);
                }

                // Always keep LAST
                finalAI.push(aiMessages[aiMessages.length - 1]);

            } else {
                // If <= LIMIT, keep all
                finalAI = aiMessages;
            }

            /* ---------------------- SEND RESPONSE ---------------------- */
            sendResponse({
                userMessages,
                aiMessages: finalAI,
                originalAICount: aiMessages.length,
                site,
                success: true
            });

        } catch (err) {
            console.error("CAPTURE_CHAT error:", err);

            sendResponse({
                userMessages: [],
                aiMessages: [],
                error: err.message,
                site,
                success: false
            });
        }

        return true;
    }

    /* ---------------------- AUTO_START ---------------------- */
    if (req.action === "AUTO_START") {
        console.log("AUTO_START received:", req.text?.length);

        const run = async () => {
            try {
                const ok = await autoStartChat(req.text);
                sendResponse({
                    ok,
                    message: ok
                        ? `Injected successfully on ${site}`
                        : `Injection failed on ${site}`,
                    site
                });
            } catch (err) {
                sendResponse({
                    ok: false,
                    error: err.message,
                    site
                });
            }
        };

        run();
        return true;
    }

    sendResponse({ error: "Unknown action: " + req.action });
    return true;
});

/* ---------------------- AUTO-DETECT URL CHANGES ---------------------- */
let lastUrl = location.href;

new MutationObserver(() => {
    const newUrl = location.href;
    if (newUrl !== lastUrl) {
        lastUrl = newUrl;
        console.log("URL changed → re-initializing...");
        setTimeout(initialize, 500);
    }
}).observe(document, {
    subtree: true,
    childList: true
});
