import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function App() {
  const [name, setName] = useState("");
  const [isNamed, setIsNamed] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (name) => {
      setTypingUsers((prev) => new Set([...prev, name]));
    });

    socket.on("stop typing", (name) => {
      setTypingUsers((prev) => {
        const copy = new Set(prev);
        copy.delete(name);
        return copy;
      });
    });

    return () => {
      socket.off("chat message");
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const msgObj = { user: name, text: message };
      socket.emit("chat message", msgObj);
      setMessage("");
      socket.emit("stop typing", name);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (e.target.value.length > 0) {
      socket.emit("typing", name);
    } else {
      socket.emit("stop typing", name);
    }
  };

  if (!isNamed) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Enter your name</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => { setIsNamed(true); socket.emit("join", name); }}>Join</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", fontFamily: "Arial" }}>
      <h2>Real-Time Chat</h2>
      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll" }}>
        {messages.map((m, i) => (
          <div key={i}><strong>{m.user}:</strong> {m.text}</div>
        ))}
      </div>
      <div style={{ fontSize: "12px", color: "gray", margin: "5px 0" }}>
        {Array.from(typingUsers).join(", ")} {typingUsers.size > 0 && "typing..."}
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", marginTop: "10px" }}>
        <input style={{ flex: 1 }} value={message} onChange={handleTyping} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
