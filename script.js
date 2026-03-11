/**
 * AI Chat Application
 *
 * Features:
 *  - Displays the current AI model in use
 *  - Auto-saves conversations to localStorage
 *  - Save conversation to a JSON file (download)
 *  - Load a previously saved JSON conversation
 *  - Clear conversation history
 */

const MODEL_NAME = "GPT-4o (GitHub Copilot)";
const STORAGE_KEY = "chat_history";

// ---- DOM references ----
const chatWindow  = document.getElementById("chatWindow");
const userInput   = document.getElementById("userInput");
const sendBtn     = document.getElementById("sendBtn");
const saveBtn     = document.getElementById("saveBtn");
const loadBtn     = document.getElementById("loadBtn");
const clearBtn    = document.getElementById("clearBtn");
const fileInput   = document.getElementById("fileInput");
const statusBar   = document.getElementById("statusBar");
const modelName   = document.getElementById("modelName");

// ---- In-memory conversation history ----
// Each entry: { role: "user"|"assistant", content: string, timestamp: string }
let history = [];

// ---- Initialise ----
modelName.textContent = MODEL_NAME;
loadFromStorage();

// ---- Helpers ----
function now() {
  return new Date().toLocaleString(undefined, {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function setStatus(msg, duration = 3000) {
  statusBar.textContent = msg;
  if (duration > 0) {
    setTimeout(() => { statusBar.textContent = ""; }, duration);
  }
}

// ---- Safely render text with newline support (no innerHTML on user content) ----
function textToNodes(text, container) {
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    container.appendChild(document.createTextNode(line));
    if (i < lines.length - 1) container.appendChild(document.createElement("br"));
  });
}

// ---- Render a single message bubble ----
function renderMessage({ role, content, timestamp }) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "🧑" : "🤖";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  textToNodes(content, bubble);

  const ts = document.createElement("div");
  ts.className = "timestamp";
  ts.textContent = timestamp;

  bubble.appendChild(ts);
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  return wrapper;
}

function appendMessage(entry) {
  const el = renderMessage(entry);
  chatWindow.appendChild(el);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ---- Rebuild the full chat window from history ----
function rebuildChat() {
  chatWindow.innerHTML = "";
  history.forEach(appendMessage);
}

// ---- localStorage persistence ----
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn("localStorage save failed:", e);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        history = parsed;
        rebuildChat();
        setStatus("已从本地存储恢复上次对话记录。");
        return;
      }
    }
  } catch (e) {
    console.warn("localStorage load failed:", e);
  }
  // Default welcome message when there is no saved history
  const welcome = {
    role: "assistant",
    content:
      "你好！我是基于 " +
      MODEL_NAME +
      " 的 AI 助手。\n你可以通过顶部按钮保存、加载或清空对话记录；对话也会自动保存到浏览器本地存储中。",
    timestamp: now(),
  };
  history.push(welcome);
  appendMessage(welcome);
}

// ---- Send a user message ----
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  const userEntry = { role: "user", content: text, timestamp: now() };
  history.push(userEntry);
  appendMessage(userEntry);
  saveToStorage();

  userInput.value = "";
  userInput.style.height = "auto";

  // Simulate an assistant reply (replace with real API call as needed)
  simulateReply(text);
}

// ---- Simulated assistant reply ----
// Replace this function body with an actual API call to your LLM backend.
function simulateReply(userText) {
  sendBtn.disabled = true;
  setStatus("AI 正在思考…", 0);

  setTimeout(() => {
    let reply;
    const lower = userText.toLowerCase();

    if (/模型|model/.test(lower)) {
      reply = `我使用的模型是 ${MODEL_NAME}。`;
    } else if (/保存|save|记录/.test(lower)) {
      reply =
        "可以！你的对话会自动保存在浏览器的本地存储（localStorage）中，下次打开页面时会自动恢复。\n" +
        "你也可以点击顶部的「💾 保存对话」按钮，将对话导出为 JSON 文件长期保存。";
    } else {
      reply = `你说：「${userText}」\n\n（这是一个演示回复。请将此函数替换为真实的 API 调用以获取实际 AI 响应。）`;
    }

    const assistantEntry = { role: "assistant", content: reply, timestamp: now() };
    history.push(assistantEntry);
    appendMessage(assistantEntry);
    saveToStorage();

    sendBtn.disabled = false;
    setStatus("");
  }, 600);
}

// ---- Save conversation to JSON file ----
saveBtn.addEventListener("click", () => {
  if (history.length === 0) {
    setStatus("暂无对话记录可保存。");
    return;
  }
  const payload = {
    model: MODEL_NAME,
    savedAt: now(),
    messages: history,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `chat-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  setStatus("对话已保存为 JSON 文件。");
});

// ---- Load conversation from JSON file ----
loadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data.messages)) throw new Error("格式不正确");
      history = data.messages;
      rebuildChat();
      saveToStorage();
      setStatus(`已加载对话（共 ${history.length} 条消息）。`);
    } catch (err) {
      console.error("File load error:", err);
      setStatus("文件格式错误，加载失败。");
    }
  };
  reader.readAsText(file);
  fileInput.value = "";
});

// ---- Clear conversation ----
clearBtn.addEventListener("click", () => {
  if (!confirm("确定要清空所有对话记录吗？")) return;
  history = [];
  chatWindow.innerHTML = "";
  localStorage.removeItem(STORAGE_KEY);
  setStatus("对话记录已清空。");
});

// ---- Send on Enter (Shift+Enter = new line) ----
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);

// ---- Auto-resize textarea ----
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight + "px";
});
