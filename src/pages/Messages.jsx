import { useState } from "react";
import {
  Search,
  SquarePen,
  Users,
  Pin,
  Info,
  Paperclip,
  Smile,
  AtSign,
  Send,
  Download,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import messagesData from "../data/messagesData";
import "./Messages.css";

function Messages() {
  const [conversations, setConversations] = useState(messagesData);
  const [activeConversationId, setActiveConversationId] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const [messageText, setMessageText] = useState("");

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  );

  const filteredConversations =
    activeTab === "All"
      ? conversations
      : conversations.filter(
          (conversation) => conversation.type === activeTab.toLowerCase(),
        );

  const handleSendMessage = () => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) return;

    const newMessage = {
      id: Date.now(),
      sender: "You",
      avatar: null,
      time: "Now",
      text: trimmedMessage,
      isOwn: true,
    };

    setConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        conversation.id === activeConversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
              preview: `You: ${trimmedMessage}`,
              time: "Now",
            }
          : conversation,
      ),
    );

    setMessageText("");
  };

  return (
    <MainLayout>
      <div className="messages-page">
        {/* Messages sidebar */}

        <aside className="messages-sidebar">
          <div className="messages-sidebar-header">
            <h1>Messages</h1>

            <button
              type="button"
              className="messages-new-button"
              aria-label="New-message"
            >
              <SquarePen size={18} />
            </button>
          </div>

          <div className="messages-search">
            <Search size={17} />
            <input type="text" placeholder="Jump to conversation..." />
          </div>

          <div className="messages-tabs">
            {["All", "Direct", "Projects"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={
                  activeTab === tab
                    ? "messages-tab messages-tab--active"
                    : "messages-tab"
                }
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="conversation-list">
            {filteredConversations.map((conversation) => {
              const Icon = conversation.icon;
              const isActive = conversation.id === activeConversation;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  className={`conversation-item ${
                    isActive ? "conversation-item--active" : ""
                  }`}
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  <div className="conversation-avatar">
                    {conversation.avatar ? (
                      <img src={conversation.avatar} alt="" />
                    ) : (
                      <>
                        {conversation.shortName ? (
                          <span>{conversation.shortName}</span>
                        ) : Icon ? (
                          <Icon size={20} />
                        ) : (
                          <Users size={20} />
                        )}
                      </>
                    )}
                    {conversation.type === "direct" && (
                      <span className="conversation-online" />
                    )}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-top">
                      <h2>{conversation.name}</h2>
                      <span>{conversation.time}</span>
                    </div>

                    <p>{conversation.preview}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active conversation */}

        <main className="conversation-panel">
          <header className="conversation-header">
            <div className="conversation-heading">
              <div className="conversation-main-avatar">
                {activeConversation?.shortName ? (
                  activeConversation.shortName
                ) : activeConversation?.avatar ? (
                  <img src={activeConversation.avatar} alt="" />
                ) : (
                  "F"
                )}
              </div>
              <div>
                <h2>{activeConversation?.name}</h2>

                {activeConversation?.type === "project" && (
                  <p>{activeConversation.members} members</p>
                )}

                {activeConversation?.activeBuilders && (
                  <span>
                    Active builders: {activeConversation.activeBuilders}
                  </span>
                )}
              </div>
            </div>

            <div className="conversation-header-actions">
              <button type="button" aria-label="Pin conversation">
                <Pin size={18} />
              </button>

              <button type="button" aria-label="Conversation info">
                <Pin size={18} />
              </button>
              <button type="button" aria-label="Conversation info">
                <Info size={18} />
              </button>
            </div>
          </header>

          <div className="conversation-messages">
            <div className="conversation-date">Today</div>

            {activeConversation?.messages.map((message) => (
              <article
                key={message.id}
                className={`message ${message.isOwn ? "message--own" : ""}`}
              >
                {!message.isOwn && (
                  <img src={message.avatar} alt="" className="message-avatar" />
                )}

                <div className="message-content">
                  <div className="message-meta">
                    <strong>{message.sender}</strong>
                    <span>{message.time}</span>
                  </div>

                  <p>{message.text}</p>
                  {message.attachment && (
                    <div className="message-attachment">
                      <div className="message-attachment-icon">
                        <Download size={20} />
                      </div>
                      <div>
                        <strong>{message.attachment.name}</strong>
                        <span>
                          {message.attachment.size} · {message.attachment.type}
                        </span>
                      </div>

                      <button type="button" aria-label="Download attachment">
                        <Download size={17} />
                      </button>
                    </div>
                  )}
                </div>
                {message.isOwn && <div className="message-own-avatar">YOU</div>}
              </article>
            ))}
          </div>

          <div className="message-composer">
            <input
              type="text"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder={`Reply to ${activeConversation?.name}...`}
            />

            <div className="composer-bottom">
              <div className="composer-tools">
                <button type="button" aria-label="Attach file">
                  <Paperclip size={19} />
                </button>
                <button type="button" aria-label="Add emoji">
                  <Smile size={19} />
                </button>
                <button type="button" aria-label="Mention someone">
                  <AtSign size={19} />
                </button>
              </div>

              <button
                type="button"
                className="send-message-button"
                onClick={handleSendMessage}
              >
                Send
                <Send size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}

export default Messages;
