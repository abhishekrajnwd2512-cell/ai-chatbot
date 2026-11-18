
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");
const clearBtn = document.getElementById("clearBtn");

let conversation = [];
let isWaiting = false;

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `message ${sender}-message`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  message.appendChild(bubble);
  chatMessages.appendChild(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isWaiting) return;

  const text = userInput.value.trim();

  if (!text) return;

  addMessage(text, "user");

  conversation.push({
    role: "user",
    text: text
  });

  userInput.value = "";
  isWaiting = true;
  sendBtn.disabled = true;
  typingIndicator.classList.remove("hidden");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: conversation
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    addMessage(data.reply, "bot");

    conversation.push({
      role: "model",
      text: data.reply
    });

  } catch (error) {
    addMessage(
      error.message || "Unable to connect. Please try again.",
      "bot"
    );

    // Remove the failed message from conversation history
    conversation.pop();

  } finally {
    isWaiting = false;
    sendBtn.disabled = false;
    typingIndicator.classList.add("hidden");
    userInput.focus();
  }
});

clearBtn.addEventListener("click", () => {
  if (isWaiting) return;

  conversation = [];

  chatMessages.innerHTML = "";

  addMessage(
    "Hello! I'm your AI assistant. How can I help you today?",
    "bot"
  );
});
