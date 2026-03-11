# copilot-repositroy

一个简单的 AI 聊天助手 Web 应用，使用纯 HTML / CSS / JavaScript 构建，无需后端服务。

## 功能

| 功能 | 说明 |
|------|------|
| **显示当前模型** | 页面顶部展示正在使用的 AI 模型名称（默认：GPT-4o via GitHub Copilot） |
| **自动保存对话** | 对话消息实时写入浏览器 `localStorage`，刷新或重新打开页面后自动恢复 |
| **导出对话** | 点击「💾 保存对话」，将完整对话导出为 JSON 文件 |
| **导入对话** | 点击「📂 加载对话」，从本地 JSON 文件恢复历史对话 |
| **清空对话** | 点击「🗑️ 清空对话」，删除当前对话及本地存储记录 |

## 快速开始

1. 克隆仓库或直接下载文件。
2. 在浏览器中打开 `index.html`（无需服务器，双击即可）。
3. 在输入框中输入消息，按 **Enter** 发送（**Shift+Enter** 换行）。

## 接入真实 AI 模型

当前回复由 `script.js` 中的 `simulateReply()` 函数模拟生成。  
若要接入真实 LLM API（如 OpenAI、Azure OpenAI 或 GitHub Models），请将该函数替换为对应的 API 调用逻辑，例如：

```js
async function simulateReply(userText) {
  const response = await fetch("https://YOUR_API_ENDPOINT/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer YOUR_API_KEY" },
    body: JSON.stringify({ model: "gpt-4o", messages: history }),
  });
  const data = await response.json();
  const reply = data.choices[0].message.content;
  // ...
}
```

## 文件结构

```
.
├── index.html   # 页面结构
├── styles.css   # 样式
├── script.js    # 应用逻辑（对话管理、存储、导入/导出）
└── README.md
```