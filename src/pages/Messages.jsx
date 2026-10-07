import { useState } from "react";
import {
    Search, 
    SquarePen,
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
  (conversation) => conversation.id === activeConversationId
);

    const filteredConversations =
  activeTab === "All"
    ? conversations
    : conversations.filter(
        (conversation) =>
          conversation.type === activeTab.toLowerCase()
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
        : conversation
    )
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
                        <input 
                            type="text"
                            placeholder="Jump to conversation..."
                        />
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
                            const isActive =
                                conversation.id === activeConversation;

                            return(
                                
                            )
                        })}
                    </div>
                </aside>
            </div>
        </MainLayout>
    )
}


export default Messages;