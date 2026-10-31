
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import {
  Search,
  Plus,
  Send,
  Paperclip,
  MessageSquare,
  Users,
  User,
  MoreVertical,
  ArrowLeft,
  X,
  FileText,
  AlertCircle,
  CheckCheck,
} from "lucide-react";

import "../../css/superadmin/internalCommunication.css";

const CHAT_API_URL =
  "https://oneplussparkpaintsserver.onrender.com/api/internal-communication";

const getToken = () => localStorage.getItem("token");

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

const getParticipantName = (participant) => {
  if (!participant) return "User";

  if (typeof participant === "string") return participant;

  return (
    participant.name ||
    participant.fullName ||
    participant.username ||
    participant.email ||
    "User"
  );
};

const getConversationName = (conversation, currentUserId) => {
  if (conversation.type === "DEPARTMENT") {
    return conversation.department
      ? `${conversation.department} Department`
      : "Department Chat";
  }

  const participants = conversation.participants || [];

  const otherParticipant = participants.find((participant) => {
    const participantId =
      typeof participant === "string"
        ? participant
        : participant?._id;

    return participantId !== currentUserId;
  });

  return getParticipantName(otherParticipant);
};

const formatTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InternalCommunication = () => {
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.id;

  const [activeTab, setActiveTab] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [attachment, setAttachment] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatType, setNewChatType] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loadingNewChat, setLoadingNewChat] = useState(false);
  const [directContactsUnavailable, setDirectContactsUnavailable] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      setError("");

      const response = await axios.get(
        CHAT_API_URL,
        getAuthConfig()
      );

      const conversationData =
        response.data?.conversations || [];

      const formattedConversations = conversationData.map(
        (conversation) => ({
          ...conversation,
          name: getConversationName(
            conversation,
            currentUserId
          ),
          lastMessage:
            typeof conversation.lastMessage === "object"
              ? conversation.lastMessage?.message || ""
              : conversation.lastMessage || "",
          time: formatTime(
            conversation.updatedAt || conversation.createdAt
          ),
          unread: 0,
          online: false,
        })
      );

      setConversations(formattedConversations);
      return formattedConversations;
    } catch (err) {
      console.error("Conversation API Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load conversations."
      );
      return [];
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch messages of selected conversation
  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      setMessages([]);

      const response = await axios.get(
        `${CHAT_API_URL}/${conversationId}/messages`,
        getAuthConfig()
      );

      const messageData = response.data?.messages || [];

      const formattedMessages = messageData.map((item) => {
        const senderId =
          typeof item.sender === "object"
            ? item.sender?._id
            : item.sender;

        const outgoing =
          String(senderId) === String(currentUserId);

        const attachments = item.attachments || [];

        return {
          ...item,
          sender:
            outgoing
              ? "You"
              : getParticipantName(item.sender),
          outgoing,
          time: formatTime(item.createdAt),
          attachment:
            attachments.length > 0
              ? {
                name: attachments[0].fileName || "Attachment",
                url: attachments[0].fileUrl,
                type: attachments[0].mimeType || "",
              }
              : null,
        };
      });

      setMessages(formattedMessages);

      // Mark received messages as read
      const unreadMessages = messageData.filter((item) => {
        const senderId =
          typeof item.sender === "object"
            ? item.sender?._id
            : item.sender;

        return (
          String(senderId) !== String(currentUserId) &&
          !(item.readBy || []).some((reader) => {
            const readerId =
              typeof reader === "object" ? reader?._id : reader;

            return String(readerId) === String(currentUserId);
          })
        );
      });

      for (const item of unreadMessages) {
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
    } catch (err) {
      console.error("Messages API Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load messages."
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const filteredConversations = conversations.filter(
    (conversation) => {
      const matchesSearch = conversation.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (activeTab === "departments") {
        return (
          matchesSearch &&
          conversation.type === "DEPARTMENT"
        );
      }

      if (activeTab === "direct") {
        return (
          matchesSearch &&
          conversation.type === "DIRECT"
        );
      }

      return matchesSearch;
    }
  );

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setError("");
    fetchMessages(conversation._id);
  };

  // Send message

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() && !attachment) return;
    if (!selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      setError("");

      const formData = new FormData();

      formData.append(
        "conversationId",
        selectedConversation._id
      );

      formData.append("message", message.trim());
      formData.append("priority", priority);

      if (attachment) {
        formData.append("file", attachment);
      }

      const response = await axios.post(
        `${CHAT_API_URL}/messages`,
        formData,
        getAuthConfig()
      );

      const savedMessage = response.data?.data;

      if (savedMessage) {
        const senderId =
          typeof savedMessage.sender === "object"
            ? savedMessage.sender?._id
            : savedMessage.sender;

        const attachments = savedMessage.attachments || [];

        setMessages((previous) => [
          ...previous,
          {
            ...savedMessage,
            sender: "You",
            outgoing:
              String(senderId) === String(currentUserId),
            time: formatTime(savedMessage.createdAt),
            attachment:
              attachments.length > 0
                ? {
                  name: attachments[0].fileName,
                  url: attachments[0].fileUrl,
                  type: attachments[0].mimeType,
                }
                : null,
          },
        ]);
      } else {
        await fetchMessages(selectedConversation._id);
      }

      setMessage("");
      setAttachment(null);
      setPriority("NORMAL");

      await fetchConversations();

    } catch (err) {
      console.error("Send Message Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to send message."
      );
    } finally {
      setSendingMessage(false);
    }
  };


  const handleAttachment = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      setAttachment(file);
    }

    event.target.value = "";
  };

  // Load active user accounts for the New Chat flow.
  const loadNewChatUsers = async () => {
    try {
      setLoadingNewChat(true);
      setError("");

      const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
      const ownDepartment = currentUser?.department?.trim();
      const canUseUsersApi = [
        "SUPER_ADMIN",
        "DIRECTOR",
        "MANAGER",
        "ACCOUNTANT",
        "SALES_EXECUTIVE",
      ].includes(currentUser?.role);

      setDirectContactsUnavailable(!canUseUsersApi);

      if (!canUseUsersApi) {
        setAvailableUsers([]);
        setAvailableDepartments(ownDepartment ? [ownDepartment] : []);
        setSelectedDepartment(ownDepartment || "");
        setSelectedUserId("");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/users`,
        getAuthConfig()
      );

      const userData = response.data?.users || [];
      const activeUsers = userData.filter(
        (user) =>
          !user.isRegistrationRequest &&
          String(user.status || "").toUpperCase() === "ACTIVE" &&
          user._id
      );

      setAvailableUsers(activeUsers);

      const departments = [
        ...new Set(
          activeUsers
            .map((user) => user.department?.trim())
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b));

      const permittedDepartments = isSuperAdmin
        ? departments
        : ownDepartment
          ? [ownDepartment]
          : [];

      setAvailableDepartments(permittedDepartments);
      setSelectedDepartment(
        isSuperAdmin
          ? permittedDepartments[0] || ""
          : ownDepartment || ""
      );

      const directUsers = activeUsers.filter(
        (user) => String(user._id) !== String(currentUserId)
      );
      setSelectedUserId(directUsers[0]?._id || "");
    } catch (err) {
      console.error("New Chat Users API Error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load users for a new conversation."
      );
    } finally {
      setLoadingNewChat(false);
    }
  };

  const handleCreateConversation = () => {
    setNewChatType("");
    setShowNewChat(true);
    loadNewChatUsers();
  };

  const handleCreateDepartmentChat = async () => {
    if (creatingConversation || !selectedDepartment) return;

    try {
      setCreatingConversation(true);
      setError("");

      const payload =
        currentUser?.role === "SUPER_ADMIN"
          ? { department: selectedDepartment }
          : {};

      await axios.post(
        `${CHAT_API_URL}/department`,
        payload,
        getAuthConfig()
      );

      const updatedConversations = await fetchConversations();
      const departmentConversation = updatedConversations.find(
        (conversation) =>
          conversation.type === "DEPARTMENT" &&
          String(
            conversation.departmentKey || conversation.department || ""
          ).toLowerCase() === selectedDepartment.toLowerCase()
      );

      if (departmentConversation) {
        setShowNewChat(false);
        setNewChatType("");
        setActiveTab("departments");
        handleSelectConversation(departmentConversation);
      } else {
        setError("Department chat was created, but could not be loaded.");
      }
    } catch (err) {
      console.error("Create Department Chat Error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to create department conversation."
      );
    } finally {
      setCreatingConversation(false);
    }
  };

  const handleCreateDirectChat = async () => {
    if (creatingConversation || !selectedUserId) return;

    try {
      setCreatingConversation(true);
      setError("");

      const response = await axios.post(
        `${CHAT_API_URL}/direct`,
        { targetUserId: selectedUserId },
        getAuthConfig()
      );

      const createdConversation =
        response.data?.conversation ||
        response.data?.data ||
        response.data;

      const updatedConversations = await fetchConversations();
      const directConversation = updatedConversations.find(
        (conversation) => {
          if (conversation.type !== "DIRECT") return false;

          const participantIds = (conversation.participants || []).map(
            (participant) =>
              String(
                typeof participant === "object"
                  ? participant?._id
                  : participant
              )
          );

          return (
            participantIds.includes(String(selectedUserId)) &&
            participantIds.includes(String(currentUserId))
          );
        }
      );

      const conversationToOpen =
        directConversation ||
        (createdConversation?._id
          ? {
            ...createdConversation,
            name:
              availableUsers.find(
                (user) => String(user._id) === String(selectedUserId)
              )?.name ||
              getConversationName(createdConversation, currentUserId),
          }
          : null);

      if (conversationToOpen?._id) {
        setShowNewChat(false);
        setNewChatType("");
        setActiveTab("direct");
        handleSelectConversation(conversationToOpen);
        await fetchConversations();
      } else {
        setError("Direct conversation was created, but could not be loaded.");
      }
    } catch (err) {
      console.error("Create Direct Chat Error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to create direct conversation."
      );
    } finally {
      setCreatingConversation(false);
    }
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
        <div
          className={`ic-conversation-panel ${selectedConversation ? "ic-mobile-hidden" : ""
            }`}
        >
          <div className="ic-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
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
              className={
                activeTab === "departments" ? "active" : ""
              }
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
            {loadingConversations ? (
              <div className="ic-empty-conversations">
                <p>Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="ic-empty-conversations">
                <MessageSquare size={30} />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation._id}
                  className={`ic-conversation-item ${selectedConversation?._id === conversation._id
                    ? "selected"
                    : ""
                    }`}
                  onClick={() =>
                    handleSelectConversation(conversation)
                  }
                >
                  <div className="ic-avatar">
                    {conversation.type === "DEPARTMENT" ? (
                      <Users size={21} />
                    ) : (
                      <User size={21} />
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
        <div
          className={`ic-chat-panel ${!selectedConversation ? "ic-mobile-hidden" : ""
            }`}
        >
          {!selectedConversation ? (
            <div className="ic-welcome-screen">
              <div className="ic-welcome-icon">
                <MessageSquare size={38} />
              </div>

              <h3>Internal Communication</h3>
              <p>
                Select a conversation to start communicating with
                your team.
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
                      : "Direct Message"}
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
                  <span>Messages</span>
                </div>

                {loadingMessages ? (
                  <div className="ic-empty-conversations">
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="ic-empty-conversations">
                    <MessageSquare size={30} />
                    <p>No messages yet. Start the conversation.</p>
                  </div>
                ) : (
                  messages.map((item) => (
                    <div
                      key={item._id}
                      className={`ic-message-row ${item.outgoing ? "outgoing" : "incoming"
                        }`}
                    >
                      <div className="ic-message-content">
                        {!item.outgoing && (
                          <span className="ic-message-sender">
                            {item.sender}
                          </span>
                        )}

                        <div className="ic-message-bubble">
                          {item.priority &&
                            item.priority !== "NORMAL" && (
                              <div
                                className={`ic-message-priority ${item.priority.toLowerCase()}`}
                              >
                                <AlertCircle size={13} />
                                {item.priority}
                              </div>
                            )}

                          {item.message && <p>{item.message}</p>}

                          {item.attachment && (
                            <a
                              className="ic-message-attachment"
                              href={item.attachment.url || undefined}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FileText size={20} />
                              <span>{item.attachment.name}</span>
                            </a>
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
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="ic-message-composer">
                {attachment && (
                  <div className="ic-attachment-preview">
                    <FileText size={17} />
                    <span>{attachment.name}</span>
                    <button
                      onClick={() => setAttachment(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="ic-composer-toolbar">
                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value)
                    }
                    aria-label="Message priority"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Priority</option>
                  </select>
                </div>

                <div className="ic-composer-input-row">
                  <label
                    className="ic-attachment-btn"
                    title="Attach file"
                  >
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
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />

                  <button
                    className="ic-send-btn"
                    onClick={handleSendMessage}
                    disabled={
                      (!message.trim() && !attachment) ||
                      sendingMessage
                    }
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

      {/* Error Message */}
      {error && (
        <div className="ic-error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="ic-modal-overlay">
          <div className="ic-new-chat-modal">
            <div className="ic-modal-header">
              <div>
                <h3>New Conversation</h3>
                <p>
                  {newChatType
                    ? newChatType === "DEPARTMENT"
                      ? "Choose a department for the group chat."
                      : "Choose an active user for a direct message."
                    : "Start a new team conversation."}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowNewChat(false);
                  setNewChatType("");
                }}
              >
                <X size={20} />
              </button>
            </div>

            {!newChatType ? (
              <div className="ic-new-chat-options">
                <button onClick={() => setNewChatType("DEPARTMENT")}>
                  <Users size={22} />
                  <span>
                    <strong>Department Chat</strong>
                    <small>Communicate with a department.</small>
                  </span>
                </button>

                <button onClick={() => setNewChatType("DIRECT")}>
                  <User size={22} />
                  <span>
                    <strong>Direct Message</strong>
                    <small>Start a one-to-one conversation.</small>
                  </span>
                </button>
              </div>
            ) : (
              <div className="ic-new-chat-options">
                {loadingNewChat ? (
                  <div className="ic-empty-conversations">
                    <p>Loading...</p>
                  </div>
                ) : newChatType === "DEPARTMENT" ? (
                  <>
                    <label>
                      <strong>Department</strong>
                      <select
                        value={selectedDepartment}
                        onChange={(event) =>
                          setSelectedDepartment(event.target.value)
                        }
                        disabled={availableDepartments.length === 0}
                      >
                        <option value="">Select department</option>
                        {availableDepartments.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                    </label>
                    {availableDepartments.length === 0 && (
                      <p>No department is assigned to your account.</p>
                    )}
                    <button
                      onClick={handleCreateDepartmentChat}
                      disabled={!selectedDepartment || creatingConversation}
                    >
                      <Users size={20} />
                      <span>
                        <strong>
                          {creatingConversation ? "Creating..." : "Open Department Chat"}
                        </strong>
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <label>
                      <strong>Select User</strong>
                      <select
                        value={selectedUserId}
                        onChange={(event) =>
                          setSelectedUserId(event.target.value)
                        }
                        disabled={availableUsers.filter(
                          (user) => String(user._id) !== String(currentUserId)
                        ).length === 0}
                      >
                        <option value="">Select user</option>
                        {availableUsers
                          .filter(
                            (user) =>
                              String(user._id) !== String(currentUserId)
                          )
                          .map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name} ({String(user.role || "").replaceAll("_", " ")})
                            </option>
                          ))}
                      </select>
                    </label>
                    {directContactsUnavailable ? (
                      <p>Your role needs a permitted-contacts API to start a new direct chat.</p>
                    ) : availableUsers.filter(
                      (user) => String(user._id) !== String(currentUserId)
                    ).length === 0 ? (
                      <p>No active users available.</p>
                    ) : null}
                    <button
                      onClick={handleCreateDirectChat}
                      disabled={!selectedUserId || creatingConversation}
                    >
                      <User size={20} />
                      <span>
                        <strong>
                          {creatingConversation ? "Creating..." : "Start Direct Chat"}
                        </strong>
                      </span>
                    </button>
                  </>
                )}

                <button onClick={() => setNewChatType("")}>
                  <ArrowLeft size={18} />
                  <span><strong>Back</strong></span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalCommunication;
