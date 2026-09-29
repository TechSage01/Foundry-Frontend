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

  const selectedFilter = filters.find(
    (filter) => filter.label === activeFilter,
  );

  const filteredNotifications =
    activeFilter === "All"
      ? notificationsData
      : notificationsData.filter(
          (notification) => notification.type === selectedFilter?.type,
        );

  const newNotifications = filteredNotifications.filter(
    (notification) => notification.section === "new",
  );

  const earlierNotifications = filteredNotifications.filter(
    (notification) => notification.section === "earlier",
  );

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
                <strong>{notification.actor}</strong> {notification.action}
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
        <main className="notifications-main">
          <header className="notifications-header">
            <div className="notifications-heading">
              <span className="notifications-eyebrow">
                ACTIVITY FEED •{" "}
                {notificationsData.filter((item) => item.unread).length} unread
                updates
              </span>
              <h1>Notifications</h1>
            </div>
            <div className="notifications-header-actions">
              <button type="button" className="notifications-mark-read">
                <CheckCheck size={17} />
                Mark all as read
              </button>
              <Link to="/settings" className="notifications-settings">
                <Settings size={17} />
                Settings
              </Link>
            </div>
          </header>
          <div className="notifications-filters">
            {filters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                className={`notification-filter ${
                  activeFilter === filter.label
                    ? "notification-filter--active"
                    : ""
                }`}
                onClick={() => setActiveFilter(filter.label)}
              >
                {filter.label}
                {filter.count && (
                  <span className="notification-filter__count">
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          {newNotifications.length > 0 && (
            <section className="notification-section">
              <div className="notification-section__heading">
                <h2>New &amp; Unread</h2>
                <span>{newNotifications.length}</span>
              </div>
              <div className="notification-list">
                {newNotifications.map(renderNotification)}
              </div>
            </section>
          )}
          {earlierNotifications.length > 0 && (
            <section className="notification-section">
              <div className="notification-section__heading">
                <h2>Earlier This Week</h2>
              </div>
              <div className="notification-list">
                {earlierNotifications.map(renderNotification)}
              </div>
            </section>
          )}
          {filteredNotifications.length === 0 && (
            <div className="notifications-empty">
              <div className="notifications-empty__icon">
                <Bell size={24} />
              </div>
              <h2>No notifications here</h2>
              <p>
                You&apos;re all caught up for this category. Check another
                filter to see more activity.
              </p>
            </div>
          )}
        </main>
        <aside className="notifications-sidebar">
          <section className="notification-summary-card">
            <div className="notification-sidebar-heading">
              <div>
                <span className="notification-sidebar-eyebrow">
                  YOUR ACTIVITY
                </span>
                <h2>Activity Summary</h2>
              </div>
              <ChevronDown size={18} />
            </div>
            <div className="activity-summary-list">
              <div className="activity-summary-item">
                <span>Project Updates</span>
                <strong>28</strong>
              </div>
              <div className="activity-summary-item">
                <span>New Followers</span>
                <strong>45</strong>
              </div>
              <div className="activity-summary-item">
                <span>Opportunity Matches</span>
                <strong>4</strong>
              </div>          
            </div>
          </section>
          <section className="notification-preferences-card">
            <div className="notification-preferences-icon">
              <Bell size={19} />
            </div>
            <div>
              <span className="notification-sidebar-eyebrow">
                NOTIFICATION PREFERENCES
              </span>
              <h2>Stay in the loop</h2>
              <p>
                Choose how and when Foundry keeps you updated about your activity.
              </p>
            </div>
            <Link 
              to="/settings"
              className="notification-configure-button"
              >
                Configure Channels
                <ArrowUpRight size={16} />
            </Link>
          </section>
        </aside>
      </div>
    </MainLayout>
  );
}

export default Notifications;
