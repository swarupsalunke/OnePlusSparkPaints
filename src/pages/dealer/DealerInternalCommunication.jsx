
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Search,
  Plus,
  ArrowLeft,
  X,
  Download,
  MessageSquare,
} from "lucide-react";

import "../../css/dealer/internalCommunication.css";

const CHAT_API_URL =
  "https://oneplussparkpaintsserver.onrender.com/api/internal-communication";

const DealerInternalCommunication = () => {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchContacts = useCallback(async () => {
    try {
      const response = await axios.get(
        `${CHAT_API_URL}/contacts`,
        authConfig
      );

      setContacts(response.data.users || []);
    } catch (err) {
      console.error("Dealer contacts error:", err);
      setError("Unable to load chat contacts.");
    }
  }, [token]);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axios.get(CHAT_API_URL, authConfig);

      const list = response.data.conversations || [];
      setConversations(list);
      return list;
    } catch (err) {
      console.error("Dealer conversations error:", err);
      setError("Unable to load conversations.");
      return [];
    }
  }, [token]);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const response = await axios.get(
        `${CHAT_API_URL}/${conversationId}/messages`,
        authConfig
      );

      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Dealer messages error:", err);
      setMessages([]);
    }
  }, [token]);

  useEffect(() => {
    fetchContacts();
    fetchConversations();
  }, [fetchContacts, fetchConversations]);

  useEffect(() => {
    if (selectedConversation?._id) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(
      (participant) =>
        participant._id !== currentUser._id &&
        participant._id !== currentUser.id
    );
  };

  const getConversationName = (conversation) => {
    const otherUser = getOtherParticipant(conversation);
    return otherUser?.name || "Chat";
  };

  const handleCreateChat = async (contact) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${CHAT_API_URL}/direct`,
        {
          participantId: contact._id,
        },
        authConfig
      );

      const conversation =
        response.data.conversation || response.data;

      const updatedConversations = await fetchConversations();

      const existingConversation = updatedConversations.find(
        (item) => item._id === conversation._id
      );

      setSelectedConversation(existingConversation || conversation);
      setShowContacts(false);
      setMessages([]);

      await fetchMessages(conversation._id);
    } catch (err) {
      console.error("Create dealer chat error:", err);
      setError(
        err.response?.data?.message || "Unable to start conversation."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if ((!message.trim() && !file) || !selectedConversation) return;

    try {
      const formData = new FormData();

      formData.append("conversationId", selectedConversation._id);
      formData.append("message", message.trim());
      formData.append("priority", "NORMAL");

      if (file) {
        formData.append("file", file);
      }

      await axios.post(
        `${CHAT_API_URL}/messages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchMessages(selectedConversation._id);
      await fetchConversations();
    } catch (err) {
      console.error("Dealer send message error:", err);
      setError(
        err.response?.data?.message || "Message could not be sent."
      );
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConversations = conversations.filter((conversation) =>
    getConversationName(conversation)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwnMessage = (msg) => {
    const senderId =
      typeof msg.sender === "object"
        ? msg.sender?._id
        : msg.sender;

    return (
      senderId === currentUser._id ||
      senderId === currentUser.id
    );
  };

  return (
    <div className="dealer-chat-page">
      <div className="dealer-chat-header">
        <div>
          <h2>Internal Communication</h2>
          <p>Connect with Admin and your assigned Manager</p>
        </div>

        <button
          className="dealer-chat-new-btn"
          onClick={() => {
            setShowContacts(true);
            setSearch("");
          }}
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {error && (
        <div className="dealer-chat-error">
          {error}
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="dealer-chat-container">
        <aside className="dealer-chat-sidebar">
          <div className="dealer-chat-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="dealer-chat-sidebar-title">
            Conversations
          </div>

          <div className="dealer-chat-conversation-list">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation._id}
                className={`dealer-chat-conversation ${
                  selectedConversation?._id === conversation._id
                    ? "active"
                    : ""
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="dealer-chat-avatar">
                  {getConversationName(conversation)
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="dealer-chat-conversation-info">
                  <strong>
                    {getConversationName(conversation)}
                  </strong>
                  <span>
                    {conversation.lastMessage?.message ||
                      "Start a conversation"}
                  </span>
                </div>
              </button>
            ))}

            {filteredConversations.length === 0 && (
              <div className="dealer-chat-empty">
                No conversations found.
              </div>
            )}
          </div>
        </aside>

        <main className="dealer-chat-main">
          {selectedConversation ? (
            <>
              <div className="dealer-chat-main-header">
                <button
                  className="dealer-chat-back"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft size={19} />
                </button>

                <div className="dealer-chat-avatar">
                  {getConversationName(selectedConversation)
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {getConversationName(selectedConversation)}
                  </strong>
                  <span>Internal Chat</span>
                </div>
              </div>

              <div className="dealer-chat-messages">
                {messages.map((msg) => {
                  const own = isOwnMessage(msg);

                  return (
                    <div
                      key={msg._id}
                      className={`dealer-chat-message ${
                        own ? "own" : "other"
                      }`}
                    >
                      <div className="dealer-chat-message-content">
                        {msg.message && <p>{msg.message}</p>}

                        {msg.attachments?.map((attachment, index) => {
                          const isImage =
                            attachment.mimeType?.startsWith("image/");

                          return (
                            <div
                              className="dealer-chat-attachment"
                              key={index}
                            >
                              {isImage ? (
                                <a
                                  href={attachment.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={attachment.fileUrl}
                                    alt={attachment.fileName}
                                  />
                                </a>
                              ) : (
                                <a
                                  href={attachment.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="dealer-chat-file"
                                >
                                  <FileText size={22} />
                                  <span>
                                    {attachment.fileName}
                                  </span>
                                  <Download size={17} />
                                </a>
                              )}
                            </div>
                          );
                        })}

                        <span className="dealer-chat-message-time">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {messages.length === 0 && (
                  <div className="dealer-chat-empty">
                    No messages yet. Start the conversation.
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {file && (
                <div className="dealer-chat-selected-file">
                  <FileText size={16} />
                  <span>{file.name}</span>
                  <button onClick={() => setFile(null)}>
                    <X size={16} />
                  </button>
                </div>
              )}

              <form
                className="dealer-chat-composer"
                onSubmit={handleSendMessage}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  className="dealer-chat-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                >
                  <Paperclip size={20} />
                </button>

                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <button
                  type="submit"
                  className="dealer-chat-send-btn"
                  disabled={!message.trim() && !file}
                >
                  <Send size={19} />
                </button>
              </form>
            </>
          ) : (
            <div className="dealer-chat-welcome">
              <MessageSquare size={48} />
              <h3>Select a conversation</h3>
              <p>
                Choose an existing conversation or start a new chat.
              </p>
            </div>
          )}
        </main>
      </div>

      {showContacts && (
        <div
          className="dealer-chat-modal-overlay"
          onClick={() => setShowContacts(false)}
        >
          <div
            className="dealer-chat-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dealer-chat-modal-header">
              <div>
                <h3>New Conversation</h3>
                <p>Admin and assigned Manager</p>
              </div>

              <button onClick={() => setShowContacts(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="dealer-chat-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="dealer-chat-contact-list">
              {filteredContacts.map((contact) => (
                <button
                  key={contact._id}
                  className="dealer-chat-contact"
                  onClick={() => handleCreateChat(contact)}
                  disabled={loading}
                >
                  <div className="dealer-chat-avatar">
                    {contact.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{contact.name}</strong>
                    <span>{contact.role?.replaceAll("_", " ")}</span>
                  </div>
                </button>
              ))}

              {filteredContacts.length === 0 && (
                <div className="dealer-chat-empty">
                  No available contacts found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerInternalCommunication;
