"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function AdminMessaging() {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [reactions, setReactions] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesRef = useRef([]);

  const emojiList = ["😊", "😂", "❤", "👍", "🎉", "😢"];

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch("http://localhost:5000/api/messages");
      const data = await res.json();
      setMessages(data);
      messagesRef.current = data;

      const uniqueUsers = [...new Set(data.map((msg) => msg.from))].filter(
        (user) => user !== "Admin"
      );
      setUsers(uniqueUsers);
    }

    async function fetchPinnedMessages() {
      const res = await fetch("http://localhost:5000/api/pinned-messages");
      const data = await res.json();
      setPinnedMessages(data);
    }

    fetchMessages();
    fetchPinnedMessages();

    socket.on("receiveMessage", (msg) => {
      const isDuplicate = messagesRef.current.some(
        (m) =>
          m._id === msg._id ||
          (m.text === msg.text &&
            m.timestamp === msg.timestamp &&
            m.from === msg.from)
      );

      if (!isDuplicate) {
        messagesRef.current = [...messagesRef.current, msg];
        setMessages([...messagesRef.current]);
        scrollToBottom();
      }
    });

    socket.on("typing", (user) => {
      if (user !== "Admin") {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedUser) return;

    if (editingId) {
      const updatedMessages = messages.map((msg) =>
        msg._id === editingId ? { ...msg, text: reply + " (edited)" } : msg
      );
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;
      setEditingId(null);
    } else {
      const newMessage = {
        from: "Admin",
        to: selectedUser,
        text: reply,
        timestamp: new Date().toISOString(),
      };

      socket.emit("sendMessage", newMessage);

      await fetch("http://localhost:5000/api/messages/admin-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
    }

    setReply("");
    scrollToBottom();
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    const messageRect = e.currentTarget.getBoundingClientRect();
    const x = messageRect.left + window.scrollX;
    const y = messageRect.top + window.scrollY;
    setContextMenu({ x, y, msg });
  };

  const handleEdit = (msg) => {
    setReply(msg.text);
    setEditingId(msg._id);
    setContextMenu(null);
  };

  const handleDelete = async (msgId) => {
    const updated = messages.filter((msg) => msg._id !== msgId);
    setMessages(updated);
    messagesRef.current = updated;
    setContextMenu(null);
    await fetch(`http://localhost:5000/api/messages/${msgId}`, {
      method: "DELETE",
    });
  };

  const handlePin = async (msgId) => {
    const isPinned = pinnedMessages.find((msg) => msg._id === msgId);
    if (isPinned) {
      setPinnedMessages((prev) => prev.filter((msg) => msg._id !== msgId));
      await fetch(`http://localhost:5000/api/pinned-messages/${msgId}`, {
        method: "DELETE",
      });
    } else {
      const msgToPin = messages.find((msg) => msg._id === msgId);
      if (msgToPin) {
        setPinnedMessages((prev) => [...prev, msgToPin]);
        await fetch("http://localhost:5000/api/pinned-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msgToPin),
        });
      }
    }
    setContextMenu(null);
  };

  const handleReact = (msgId, emoji) => {
    setReactions({ ...reactions, [msgId]: emoji });
    setContextMenu(null);
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.from === selectedUser && msg.to === "Admin") ||
      (msg.from === "Admin" && msg.to === selectedUser)
  );

  const searchedMessages = searchTerm
    ? filteredMessages.filter((msg) =>
        msg.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredMessages;

  return (
    <div className="flex h-screen font-sans">
      <div className="w-1/4 bg-gray-900 text-white p-4">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user}
              className={`cursor-pointer p-2 rounded-md transition ${
                selectedUser === user ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
              onClick={() => {
                setSelectedUser(user);
                setPinnedMessages([]);
                setTimeout(scrollToBottom, 100);
              }}
            >
              {user}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col bg-gray-800 text-white relative">
        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-lg font-semibold flex justify-between items-center rounded-tr-xl">
          {selectedUser ? `Chat with ${selectedUser}` : "Admin Messaging"}
          {isTyping && <span className="text-sm text-gray-200 italic ml-4">Typing...</span>}
        </div>

        <div className="px-4 py-2 bg-gray-700">
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full p-2 rounded-md bg-gray-600 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {pinnedMessages.length > 0 && (
          <div className="bg-yellow-100 text-yellow-900 px-4 py-2 text-xs rounded-t-md">
            <strong>Pinned:</strong>
            {pinnedMessages.map((msg) => (
              <div key={msg._id} className="mt-1 text-sm flex justify-between items-center">
                <span>- {msg.text}</span>
                <button
                  className="text-blue-600 hover:underline text-xs"
                  onClick={() => handlePin(msg._id)}
                >
                  Unpin
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-500">
          {searchedMessages.map((msg) => (
            <div
              key={msg._id || msg.timestamp}
              className={`flex ${
                msg.from === "Admin" ? "justify-end" : "justify-start"
              }`}
              onContextMenu={(e) => handleContextMenu(e, msg)}
            >
              <div
                className={`relative p-3 rounded-lg max-w-xs shadow ${
                  msg.from === "Admin"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-900 text-white rounded-bl-none border border-gray-700 shadow-sm"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <div className="text-[0.7rem] text-white mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                {reactions[msg._id] && (
                  <div className="absolute bottom-0 right-1 text-xl">{reactions[msg._id]}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-28 left-6 bg-white text-black shadow-xl p-3 rounded-lg z-10 flex gap-2 text-2xl">
            {emojiList.map((emoji) => (
              <span
                key={emoji}
                className="cursor-pointer hover:scale-110 transition"
                onClick={() => setReply(reply + emoji)}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}

        {selectedUser && (
          <div className="p-4 bg-gray-900 flex items-center gap-2 rounded-b-xl">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="hover:scale-110 transition w-6 h-6"
              title="Emojis"
            >
              😊
            </button>
            <input
              type="text"
              className="flex-1 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ring-blue-400"
              placeholder="Type a reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReply();
              }}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={handleReply}
            >
              {editingId ? "Update" : "Send"}
            </button>
          </div>
        )}

        {contextMenu && (
          <div
            className="absolute bg-white text-black rounded shadow-lg z-50"
            style={{
              top: contextMenu.y + "px",
              left: contextMenu.x + "px",
            }}
            onMouseLeave={() => setContextMenu(null)}
          >
            {contextMenu.msg.from === "Admin" && (
              <>
                <button className="block px-4 py-2 hover:bg-gray-200" onClick={() => handleEdit(contextMenu.msg)}>
                  Edit
                </button>
                <button className="block px-4 py-2 hover:bg-gray-200" onClick={() => handleDelete(contextMenu.msg._id)}>
                  Delete
                </button>
              </>
            )}
            <button className="block px-4 py-2 hover:bg-gray-200" onClick={() => handlePin(contextMenu.msg._id)}>
              Pin
            </button>
            <div className="px-4 py-2">React:</div>
            <div className="flex px-4 pb-2 gap-2 text-xl">
              {emojiList.map((emoji) => (
                <span key={emoji} className="cursor-pointer" onClick={() => handleReact(contextMenu.msg._id, emoji)}>
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}