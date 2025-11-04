"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function UserMessaging() {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [pinnedMessages, updatePinnedMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesRef = useRef([]);

  const emojiList = ["😊", "😂", "❤", "👍", "🎉", "😢"];

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch("http://localhost:5000/api/messages");
      const data = await res.json();
      setMessages(data);
      messagesRef.current = data;
      scrollToBottom();
    }

    async function fetchPinnedMessages() {
      const res = await fetch("http://localhost:5000/api/pinned-messages");
      const data = await res.json();
      updatePinnedMessages(data);
    }

    fetchMessages();
    fetchPinnedMessages();

    socket.on("receiveMessage", (msg) => {
      const isDuplicate = messagesRef.current.some(
        (m) =>
          m._id === msg._id ||
          (m.text === msg.text && m.timestamp === msg.timestamp && m.from === msg.from)
      );

      if (!isDuplicate) {
        messagesRef.current = [...messagesRef.current, msg];
        setMessages([...messagesRef.current]);
        scrollToBottom();
      }
    });

    socket.on("typing", (user) => {
      if (user === "Admin") {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReply = async () => {
    if (!reply.trim()) return;

    if (editingId) {
      const updated = messagesRef.current.map((msg) =>
        msg._id === editingId ? { ...msg, text: reply + " (edited)" } : msg
      );
      setMessages(updated);
      messagesRef.current = updated;

      await fetch(`http://localhost:5000/api/messages/edit/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reply }),
      });

      setEditingId(null);
      setReply("");
      return;
    }

    const newMessage = {
      from: "User",
      to: "Admin",
      text: reply,
      timestamp: new Date().toISOString(),
      read: false,
    };

    socket.emit("sendMessage", newMessage);

    await fetch("http://localhost:5000/api/messages/user-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMessage),
    });

    setReply("");
    scrollToBottom();
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message: msg,
    });
  };

  const handleEdit = () => {
    setReply(contextMenu.message.text);
    setEditingId(contextMenu.message._id);
    setContextMenu(null);
  };

  const handleDelete = async () => {
    const updated = messagesRef.current.filter(
      (msg) => msg._id !== contextMenu.message._id
    );
    setMessages(updated);
    messagesRef.current = updated;

    await fetch(`http://localhost:5000/api/messages/${contextMenu.message._id}`, {
      method: "DELETE",
    });

    setContextMenu(null);
  };

  const handlePin = async () => {
    const isPinned = pinnedMessages.some((msg) => msg._id === contextMenu.message._id);
    if (isPinned) {
      updatePinnedMessages(pinnedMessages.filter((m) => m._id !== contextMenu.message._id));
      await fetch(`http://localhost:5000/api/pinned-messages/${contextMenu.message._id}`, {
        method: "DELETE",
      });
    } else {
      updatePinnedMessages([...pinnedMessages, contextMenu.message]);
      await fetch("http://localhost:5000/api/pinned-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contextMenu.message),
      });
    }

    setContextMenu(null);
  };

  const handleReact = async (emoji) => {
    const updated = messagesRef.current.map((msg) =>
      msg._id === contextMenu.message._id
        ? { ...msg, reactions: [...(msg.reactions || []), emoji] }
        : msg
    );
    setMessages(updated);
    messagesRef.current = updated;

    await fetch(`http://localhost:5000/api/messages/react/${contextMenu.message._id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reaction: emoji }),
    });

    setContextMenu(null);
  };

  const filteredMessages = messages.filter((msg) =>
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`w-full h-screen flex flex-col z-50 border ${
        darkMode ? "bg-gray-900 text-white border-gray-700" : "bg-white text-black border-gray-300"
      }`}
    >
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white flex justify-between items-center shadow-md">
        <h1 className="text-xl font-semibold tracking-wide">Chat with Admin</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white text-black rounded-md px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring focus:ring-blue-300 w-32"
          />
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xl hover:scale-110 transition-transform duration-200"
            title="Toggle Theme"
          >
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>
      </div>
      {pinnedMessages.length > 0 && (
        <div
          className={`px-6 py-3 text-sm font-medium border-b ${
            darkMode ? "bg-gray-800 text-yellow-300 border-gray-700" : "bg-yellow-50 text-yellow-900 border-yellow-200"
          }`}
        >
          <strong className="mr-2">Pinned:</strong>
          {pinnedMessages.map((msg) => (
            <div key={msg._id} className="flex justify-between items-center mt-1">
              <span>- {msg.text}</span>
              <button
                onClick={() => handlePin(msg._id)}
                className="text-blue-600 hover:underline text-xs"
              >
                Unpin
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-500 relative">
        {filteredMessages.map((msg, index) => (
          <div
            key={index}
            onContextMenu={(e) => handleContextMenu(e, msg)}
            className={`flex ${msg.from === "User" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative px-4 py-3 rounded-lg max-w-lg shadow-md transition ${
                msg.from === "User"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : darkMode
                  ? "bg-gray-800 text-white rounded-bl-none"
                  : "bg-gray-100 text-black rounded-bl-none"
              }`}
            >
              <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
              {msg.reactions && (
                <div className="text-sm mt-1">
                  {msg.reactions.map((reaction, i) => (
                    <span key={i} className="mr-1">{reaction}</span>
                  ))}
                </div>
              )}
              <div className="text-[0.7rem] mt-1 text-right opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-sm italic text-gray-400">Admin is typing...</div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
      {contextMenu && (
        <div
          className={`absolute z-50 rounded-md p-2 text-sm shadow-lg border ${
            darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-200"
          }`}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button className="block px-3 py-2 hover:bg-gray-100 w-full text-left" onClick={handleEdit}>
            Edit
          </button>
          <button className="block px-3 py-2 hover:bg-gray-100 w-full text-left" onClick={handleDelete}>
            Delete
          </button>
          <button className="block px-3 py-2 hover:bg-gray-100 w-full text-left" onClick={handlePin}>
            {pinnedMessages.some((msg) => msg._id === contextMenu.message._id) ? "Unpin" : "Pin"}
          </button>
          <div className="flex gap-2 flex-wrap px-2 pt-1">
            {emojiList.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-xl hover:scale-110 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={`p-4 flex items-center gap-3 border-t ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"
      }`}>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-2xl hover:scale-110 transition-transform"
          title="Emojis"
        >
          😊
        </button>
        {showEmojiPicker && (
          <div
            className={`absolute bottom-28 left-6 p-3 rounded-lg z-10 flex gap-2 text-2xl shadow-xl ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            {emojiList.map((emoji) => (
              <span
                key={emoji}
                className="cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setReply(reply + emoji)}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}
        <input
          type="text"
          placeholder="Type a message..."
          className={`flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
            darkMode ? "bg-gray-700 text-white ring-blue-400" : "bg-white text-black ring-blue-400"
          }`}
          value={reply}
          onChange={(e) => {
            setReply(e.target.value);
            socket.emit("typing", "User");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleReply();
          }}
        />
        <button
          onClick={handleReply}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {editingId ? "Update" : "Send"}
        </button>
      </div>
    </div>
  );
}