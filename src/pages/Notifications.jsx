import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  CheckCheck,
  Settings,
  ChevronDown,
  Bell,
  ArrowUpRight,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import notificationsData from "../data/notificationsData";

import "./Notifications.css";
function Notifications() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    {
      label: "All",
    },
    {
      label: "Mentions",
      count: 2,
      type: "mention",
    },
    {
      label: "Project Updates",
      type: "project",
    },
    {
      label: "Opportunities",
      type: "opportunity",
    },
    {
      label: "Follows",
      type: "follow",
    },
  ];

  const selectedFilter = filters.find((filter) => filter.label === "earlier");
  const renderNotification = (notification) => {
    const Icon = notification.icon;

    return (
      <article
        key={notification.id}
        className={`notification-card ${
          notification.unread ? "notification-card--unread" : ""
        }`}
      >
        <div className="notification-card__left">
          {notification.avatar ? (
            <img
              src={notification.avatar}
              alt={notification.actor}
              className="notification-avatar"
            />
          ) : (
            <div
              className={`notification-icon ${
                notification.iconStyle === "accent"
                  ? "notification-icon--accent"
                  : ""
              }`}
            >
              {Icon ? <Icon size={19} strokeWidth={2} /> : <Bell size={19} />}
            </div>
          )}
        </div>
        <div className="notification-card__content">
            <div className="notificattion-card__top">
                <div className="notification-card__text">
                    <p className="notification-card__message">
                        <strong>{notification.actor}</strong>{" "}
                        {notification.action}
                    </p>
                    <span className="notification-card__time">
                        {notification.time}
                    </span>
                </div>
                {notification.unread && (
                    <span 
                        className="notification-unread-dot"
                        aria-label="Unread notification"
                        />
                )}
            </div>
            <p className="notification-card__description">
                {notification.message}
            </p>
            {notification.actions?.length > 0 && (
                <div className="notification-card-actions">
                    {notification.actions.map((action) => (
                        <button
                            key={action.label}
                            type="button"
                            className={`notification-action notification-action--${action.variant}`}
                        >
                            {action.label}
                            {action.variant === "dark" && (
                                <ArrowUpRight size={15} strokeWidth={2} />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
      </article>
    );
  };
  return (
    <MainLayout>
        <div className="notifications-page">
            
        </div>
    </MainLayout>
  )
}
