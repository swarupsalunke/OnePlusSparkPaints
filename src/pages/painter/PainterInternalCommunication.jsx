
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Send,
  Paperclip,
  MessageSquare,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";

import "../../css/painter/internalCommunication.css";

const CHAT_API_URL =
  "https://oneplussparkpaintsserver.onrender.com/api/internal-communication";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

const getUserId = (user) => {
  if (!user) return "";
  return String(typeof user === "object" ? user._id : user);
};

const getUserName = (user) => {
  if (!user || typeof user === "string") return "User";
  return user.name || user.fullName || user.username || "User";
};

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PainterInternalCommunication = () => {
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.id;

  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedContact, setSelectedContact] = useState("");

  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  const getConversationName = (conversation) => {
    const otherUser = (conversation.participants || []).find(
      (participant) =>
        getUserId(participant) !== String(currentUserId)
    );

    return getUserName(otherUser);
  };

  // Fetch permitted contacts
  const fetchContacts = async () => {
    try {
      const response = await axios.get(
        `${CHAT_API_URL}/contacts`,
        getAuthConfig()
      );

      setContacts(response.data?.users || []);
    } catch (err) {
      console.error("Contacts Error:", err);
      setError(
        err.response?.data?.message || "Unable to load contacts."
      );
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        CHAT_API_URL,
        getAuthConfig()
      );

      const data = response.data?.conversations || [];

      const formatted = data
        .filter((item) => item.type === "DIRECT")
        .map((item) => ({
          ...item,
          name: getConversationName(item),
          lastMessage:
            typeof item.lastMessage === "object"
              ? item.lastMessage?.message || ""
              : item.lastMessage || "",
          time: formatTime(item.updatedAt || item.createdAt),
        }));

      setConversations(formatted);
    } catch (err) {
      console.error("Conversations Error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load conversations."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch conversation messages
  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      setMessages([]);

      const response = await axios.get(
        `${CHAT_API_URL}/${conversationId}/messages`,
        getAuthConfig()
      );

      const data = response.data?.messages || [];

      const formatted = data.map((item) => {
        const senderId = getUserId(item.sender);
        const attachments = item.attachments || [];

        return {
          ...item,
          outgoing: senderId === String(currentUserId),
          senderName:
            senderId === String(currentUserId)
              ? "You"
              : getUserName(item.sender),
          attachment: attachments[0] || null,
          time: formatTime(item.createdAt),
        };
      });

      setMessages(formatted);

      // Mark received messages as read
      for (const item of data) {
        const senderId = getUserId(item.sender);
        const alreadyRead = (item.readBy || []).some(
          (reader) => getUserId(reader) === String(currentUserId)
        );

        if (senderId !== String(currentUserId) && !alreadyRead) {
          try {
            await axios.patch(
              `${CHAT_API_URL}/messages/${item._id}/read`,
              {},
              getAuthConfig()
            );
          } catch (readError) {
            console.error("Mark Read Error:", readError);
          }
        }
      }
    } catch (err) {
      console.error("Messages Error:", err);
      setError(
        err.response?.data?.message || "Unable to load messages."
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Open conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowNewChat(false);
    setError("");
    fetchMessages(conversation._id);
  };

  // Create direct chat
  const handleCreateChat = async () => {
    if (!selectedContact) return;

    try {
      setError("");

      const response = await axios.post(
        `${CHAT_API_URL}/direct`,
        { targetUserId: selectedContact },
        getAuthConfig()
      );

      const created =
        response.data?.conversation ||
        response.data?.data ||
        response.data;

      await fetchConversations();

      const conversation =
        conversations.find((item) => {
          const ids = (item.participants || []).map(getUserId);

          return (
            ids.includes(String(currentUserId)) &&
            ids.includes(String(selectedContact))
          );
        }) || created;

      if (conversation?._id) {
        const selected = {
          ...conversation,
          name:
            contacts.find(
              (user) => String(user._id) === String(selectedContact)
            )?.name || getConversationName(conversation),
        };

        setShowNewChat(false);
        setSelectedConversation(selected);
        fetchMessages(selected._id);
      } else {
        await fetchConversations();
      }

      setSelectedContact("");
    } catch (err) {
      console.error("Create Chat Error:", err);
      setError(
        err.response?.data?.message || "Unable to create chat."
      );
    }
  };

  // Send text, PDF or image
  const handleSendMessage = async () => {
    if ((!message.trim() && !attachment) || !selectedConversation || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const formData = new FormData();

      formData.append("conversationId", selectedConversation._id);
      formData.append("message", message.trim());
      formData.append("priority", "NORMAL");

      if (attachment) {
        formData.append("file", attachment);
      }

      await axios.post(
        `${CHAT_API_URL}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("");
      setAttachment(null);

      await fetchMessages(selectedConversation._id);
      await fetchConversations();
    } catch (err) {
      console.error("Send Message Error:", err);
      setError(
        err.response?.data?.message || "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("This file type is not supported.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size cannot exceed 10 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setAttachment(file);
    event.target.value = "";
  };

  const filteredConversations = conversations.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="painter-chat-page">
      <div className="painter-chat-header">
        <div>
          <h2>Internal Chat</h2>
          <p>Communicate with Admin and your assigned Manager</p>
        </div>
      </div>

      {error && (
        <div className="painter-chat-error">
          {error}
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="painter-chat-container">
        {/* Conversation List */}
        <div
          className={`painter-chat-sidebar ${
            selectedConversation ? "mobile-chat-hidden" : ""
          }`}
        >
          <div className="painter-chat-sidebar-header">
            <h3>Messages</h3>

            <button
              className="painter-chat-new-btn"
              onClick={() => {
                setShowNewChat(true);
                setSelectedConversation(null);
                setMessages([]);
                setError("");
              }}
            >
              <Plus size={17} />
              New Chat
            </button>
          </div>

          <div className="painter-chat-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="painter-chat-empty">Loading conversations...</p>
          ) : filteredConversations.length === 0 ? (
            <p className="painter-chat-empty">
              No conversations yet.
            </p>
          ) : (
            <div className="painter-chat-conversation-list">
              {filteredConversations.map((item) => (
                <button
                  key={item._id}
                  className={`painter-chat-conversation ${
                    selectedConversation?._id === item._id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSelectConversation(item)}
                >
                  <div className="painter-chat-avatar">
                    {item.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="painter-chat-conversation-info">
                    <div className="painter-chat-conversation-top">
                      <strong>{item.name}</strong>
                      <span>{item.time}</span>
                    </div>

                    <p>{item.lastMessage || "Start conversation"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div
          className={`painter-chat-main ${
            !selectedConversation && !showNewChat
              ? "mobile-chat-hidden"
              : ""
          }`}
        >
          {showNewChat ? (
            <div className="painter-chat-new-panel">
              <div className="painter-chat-panel-heading">
                <button
                  onClick={() => setShowNewChat(false)}
                  className="painter-chat-back-btn"
                >
                  <ArrowLeft size={19} />
                </button>
                <h3>Start New Chat</h3>
              </div>

              <p>Select an available contact</p>

              <select
                value={selectedContact}
                onChange={(e) => setSelectedContact(e.target.value)}
              >
                <option value="">Select Admin or Manager</option>

                {contacts.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role?.replaceAll("_", " ")})
                  </option>
                ))}
              </select>

              {contacts.length === 0 && (
                <p className="painter-chat-empty">
                  No permitted contacts available.
                </p>
              )}

              <button
                className="painter-chat-create-btn"
                onClick={handleCreateChat}
                disabled={!selectedContact}
              >
                <MessageSquare size={17} />
                Start Chat
              </button>
            </div>
          ) : selectedConversation ? (
            <>
              <div className="painter-chat-main-header">
                <button
                  className="painter-chat-back-btn"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft size={19} />
                </button>

                <div className="painter-chat-avatar">
                  {selectedConversation.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <h3>{selectedConversation.name}</h3>
                  <p>Direct Conversation</p>
                </div>
              </div>

              <div className="painter-chat-messages">
                {loadingMessages ? (
                  <p className="painter-chat-empty">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="painter-chat-empty">
                    No messages yet. Start the conversation.
                  </p>
                ) : (
                  messages.map((item) => (
                    <div
                      key={item._id}
                      className={`painter-chat-message-row ${
                        item.outgoing ? "outgoing" : "incoming"
                      }`}
                    >
                      <div className="painter-chat-message">
                        <span className="painter-chat-sender">
                          {item.senderName}
                        </span>

                        {item.message && <p>{item.message}</p>}

                        {item.attachment && (
                          <a
                            className="painter-chat-attachment"
                            href={
                              item.attachment.fileUrl ||
                              item.attachment.url
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {item.attachment.mimeType?.startsWith("image/") ? (
                              <ImageIcon size={19} />
                            ) : (
                              <FileText size={19} />
                            )}

                            <span>
                              {item.attachment.fileName ||
                                item.attachment.originalName ||
                                item.attachment.name ||
                                "Attachment"}
                            </span>
                          </a>
                        )}

                        <span className="painter-chat-message-time">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="painter-chat-composer">
                {attachment && (
                  <div className="painter-chat-file-preview">
                    <Paperclip size={15} />
                    <span>{attachment.name}</span>
                    <button onClick={() => setAttachment(null)}>
                      <X size={15} />
                    </button>
                  </div>
                )}

                <div className="painter-chat-input-row">
                  <label className="painter-chat-attach-btn">
                    <Paperclip size={20} />
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                      onChange={handleFileChange}
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />

                  <button
                    className="painter-chat-send-btn"
                    onClick={handleSendMessage}
                    disabled={
                      (!message.trim() && !attachment) || sending
                    }
                  >
                    <Send size={19} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="painter-chat-welcome">
              <MessageSquare size={48} />
              <h3>Your Messages</h3>
              <p>Select a conversation or start a new chat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PainterInternalCommunication;
