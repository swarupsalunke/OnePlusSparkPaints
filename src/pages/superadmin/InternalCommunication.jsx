
import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Send,
  Paperclip,
  MessageSquare,
  Users,
  User,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  X,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Check,
  CheckCheck,
} from "lucide-react";

import "../../css/superadmin/internalCommunication.css";

const InternalCommunication = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [attachment, setAttachment] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const messagesEndRef = useRef(null);

  // Temporary UI data. Replace with API data.
  const [conversations, setConversations] = useState([
    {
      _id: "department-sales",
      type: "DEPARTMENT",
      name: "Sales Department",
      department: "Sales",
      lastMessage: "Monthly sales report is ready.",
      time: "10:45 AM",
      unread: 2,
      online: true,
    },
    {
      _id: "department-accounts",
      type: "DEPARTMENT",
      name: "Accounts Department",
      department: "Accounts",
      lastMessage: "Please check the payment details.",
      time: "09:30 AM",
      unread: 0,
      online: true,
    },
    {
      _id: "department-production",
      type: "DEPARTMENT",
      name: "Production Department",
      department: "Production",
      lastMessage: "Batch production completed.",
      time: "Yesterday",
      unread: 0,
      online: false,
    },
    {
      _id: "direct-1",
      type: "DIRECT",
      name: "Rahul Patil",
      role: "Sales Executive",
      lastMessage: "Okay, I will update you.",
      time: "Yesterday",
      unread: 1,
      online: true,
    },
  ]);

  const [messages, setMessages] = useState([
    {
      _id: "msg-1",
      sender: "Rahul Patil",
      message: "Good morning! How is the sales progress?",
      time: "10:30 AM",
      outgoing: false,
      priority: "NORMAL",
    },
    {
      _id: "msg-2",
      sender: "You",
      message: "Good morning! Sales progress is going well.",
      time: "10:35 AM",
      outgoing: true,
      priority: "NORMAL",
    },
    {
      _id: "msg-3",
      sender: "Rahul Patil",
      message: "Monthly sales report is ready.",
      time: "10:45 AM",
      outgoing: false,
      priority: "HIGH",
    },
  ]);

  const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch = conversation.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (activeTab === "departments") {
      return matchesSearch && conversation.type === "DEPARTMENT";
    }

    if (activeTab === "direct") {
      return matchesSearch && conversation.type === "DIRECT";
    }

    return matchesSearch;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
  };

  const handleSendMessage = () => {
    if (!message.trim() && !attachment) return;
    if (!selectedConversation) return;

    const newMessage = {
      _id: Date.now().toString(),
      sender: "You",
      message: message.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      outgoing: true,
      priority,
      attachment: attachment
        ? {
            name: attachment.name,
            type: attachment.type,
            url: URL.createObjectURL(attachment),
          }
        : null,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setPriority("NORMAL");
    setAttachment(null);
  };

  const handleAttachment = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setAttachment(file);
    }

    event.target.value = "";
  };

  const handleCreateConversation = () => {
    setShowNewChat(true);
  };

  return (
    <div className="internal-communication-page">

      {/* Page Header */}
      <div className="ic-page-header">
        <div>
          <h2>Internal Communication</h2>
          <p>Connect and communicate with your team.</p>
        </div>

        <button
          className="ic-new-chat-btn"
          onClick={handleCreateConversation}
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Chat Layout */}
      <div className="ic-chat-layout">

        {/* Conversation Sidebar */}
        <div className={`ic-conversation-panel ${selectedConversation ? "ic-mobile-hidden" : ""}`}>

          <div className="ic-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="ic-conversation-tabs">
            <button
              className={activeTab === "all" ? "active" : ""}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>

            <button
              className={activeTab === "departments" ? "active" : ""}
              onClick={() => setActiveTab("departments")}
            >
              Departments
            </button>

            <button
              className={activeTab === "direct" ? "active" : ""}
              onClick={() => setActiveTab("direct")}
            >
              Direct
            </button>
          </div>

          {/* Conversation List */}
          <div className="ic-conversation-list">

            {filteredConversations.length === 0 ? (
              <div className="ic-empty-conversations">
                <MessageSquare size={30} />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation._id}
                  className={`ic-conversation-item ${
                    selectedConversation?._id === conversation._id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="ic-avatar">
                    {conversation.type === "DEPARTMENT" ? (
                      <Users size={21} />
                    ) : (
                      <User size={21} />
                    )}

                    {conversation.online && (
                      <span className="ic-online-dot"></span>
                    )}
                  </div>

                  <div className="ic-conversation-info">
                    <div className="ic-conversation-top">
                      <h4>{conversation.name}</h4>
                      <span>{conversation.time}</span>
                    </div>

                    <div className="ic-conversation-bottom">
                      <p>{conversation.lastMessage}</p>

                      {conversation.unread > 0 && (
                        <span className="ic-unread-count">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}

          </div>
        </div>

        {/* Chat Window */}
        <div className={`ic-chat-panel ${!selectedConversation ? "ic-mobile-hidden" : ""}`}>

          {!selectedConversation ? (
            <div className="ic-welcome-screen">
              <div className="ic-welcome-icon">
                <MessageSquare size={38} />
              </div>

              <h3>Internal Communication</h3>
              <p>
                Select a conversation to start communicating with your team.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="ic-chat-header">

                <button
                  className="ic-back-btn"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="ic-avatar">
                  {selectedConversation.type === "DEPARTMENT" ? (
                    <Users size={21} />
                  ) : (
                    <User size={21} />
                  )}
                </div>

                <div className="ic-chat-user-info">
                  <h3>{selectedConversation.name}</h3>
                  <span>
                    {selectedConversation.type === "DEPARTMENT"
                      ? `${selectedConversation.department} Department`
                      : selectedConversation.online
                        ? "Online"
                        : "Offline"}
                  </span>
                </div>

                <div className="ic-chat-header-actions">
                  <button title="More options">
                    <MoreVertical size={20} />
                  </button>
                </div>

              </div>

              {/* Messages */}
              <div className="ic-messages-area">

                <div className="ic-date-divider">
                  <span>Today</span>
                </div>

                {messages.map((item) => (
                  <div
                    key={item._id}
                    className={`ic-message-row ${
                      item.outgoing ? "outgoing" : "incoming"
                    }`}
                  >
                    <div className="ic-message-content">

                      {!item.outgoing && (
                        <span className="ic-message-sender">
                          {item.sender}
                        </span>
                      )}

                      <div className="ic-message-bubble">

                        {item.priority !== "NORMAL" && (
                          <div className={`ic-message-priority ${item.priority.toLowerCase()}`}>
                            <AlertCircle size={13} />
                            {item.priority}
                          </div>
                        )}

                        {item.message && <p>{item.message}</p>}

                        {item.attachment && (
                          <div className="ic-message-attachment">
                            <FileText size={20} />
                            <span>{item.attachment.name}</span>
                          </div>
                        )}

                        <div className="ic-message-meta">
                          <span>{item.time}</span>
                          {item.outgoing && (
                            <CheckCheck size={15} />
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                ))}

                <div ref={messagesEndRef} />

              </div>

              {/* Message Input */}
              <div className="ic-message-composer">

                {attachment && (
                  <div className="ic-attachment-preview">
                    <FileText size={17} />
                    <span>{attachment.name}</span>
                    <button onClick={() => setAttachment(null)}>
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="ic-composer-toolbar">
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    aria-label="Message priority"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Priority</option>
                  </select>
                </div>

                <div className="ic-composer-input-row">

                  <label className="ic-attachment-btn" title="Attach file">
                    <Paperclip size={20} />
                    <input
                      type="file"
                      hidden
                      onChange={handleAttachment}
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />

                  <button
                    className="ic-send-btn"
                    onClick={handleSendMessage}
                    disabled={!message.trim() && !attachment}
                    title="Send message"
                  >
                    <Send size={18} />
                  </button>

                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="ic-modal-overlay">
          <div className="ic-new-chat-modal">

            <div className="ic-modal-header">
              <div>
                <h3>New Conversation</h3>
                <p>Start a new team conversation.</p>
              </div>

              <button onClick={() => setShowNewChat(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="ic-new-chat-options">
              <button
                onClick={() => {
                  setActiveTab("departments");
                  setShowNewChat(false);
                }}
              >
                <Users size={22} />
                <span>
                  <strong>Department Chat</strong>
                  <small>Communicate with a department.</small>
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("direct");
                  setShowNewChat(false);
                }}
              >
                <User size={22} />
                <span>
                  <strong>Direct Message</strong>
                  <small>Start a one-to-one conversation.</small>
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InternalCommunication;
