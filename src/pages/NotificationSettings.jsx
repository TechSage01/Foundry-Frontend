import { useState } from "react";
import {
  Bell,
  Mail,
  AtSign,
  Rocket,
  UserPlus,
  BriefcaseBusiness,
  Save,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

import "./NotificationSettings.css";

function NotificationSettings() {
  const [settings, setSettings] = useState({
    mentions: true,
    projectUpdates: true,
    followers: true,
    opportunities: true,
    inApp: true,
    email: false,
  });

  const [saved, setSaved] = useState(false);

  const toggleSetting = (setting) => {
    setSettings((current) => ({
      ...current,
      [setting]: !current[setting],
    }));

    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
  };

  const notificationTypes = [
    {
      id: "mentions",
      icon: AtSign,
      title: "Mentions",
      description: "When someone mentions you in a discussion or update.",
    },
    {
      id: "projectUpdates",
      icon: Rocket,
      title: "Project updates",
      description: "Updates from projects and builders you follow.",
    },
    {
      id: "followers",
      icon: UserPlus,
      title: "New followers",
      description: "When someone starts following your profile.",
    },
    {
      id: "opportunities",
      icon: BriefcaseBusiness,
      title: "Opportunity matches",
      description: "When a new opportunity matches your profile and interests.",
    },
  ];

  return (
    <MainLayout>
      <div className="notification-settings-page">
        <main className="notification-settings-main">
          <header className="notification-settings-header">
            <span className="notification-settings-eyebrow">
              NOTIFICATION PREFERENCES
            </span>
            <h1>Notification Settings</h1>
            <p>Choose what you want Foundry to keep you updated about</p>
          </header>
          <section className="notification-settings-card">
            <div className="notification-settings-card-header">
              <div className="notification-settings-card-icon">
                <Bell size={19} />
              </div>
              <div>
                <h2>Activity notifications</h2>
                <p>Control the updates you receive about your activity.</p>
              </div>
            </div>
            <div className="notification-settings-list">
              {notificationTypes.map((item) => {
                const Icon = item.icon;
                const enabled = settings[item.id];

                return (
                  <div key={item.id} className="notification-setting-row">
                    <div className="notification-setting-icon">
                      <Icon size={18} />
                    </div>
                    <div className="notification-setting-info">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                    <button
                      type="button"
                      className={`notification-toggle ${
                        enabled ? "notification-toggle-active" : ""
                      }`}
                      onClick={() => toggleSetting(item.id)}
                      aria-pressed={enabled}
                      aria-label={`Turn ${item.title} ${
                        enabled ? "off" : "on"
                      }`}
                    >
                      <span className="notification-toggle__knob" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="notification-settings-card">
            <div className="notification-settings-card-header">
              <div className="notification-settings-card-icon">
                <Mail size={19} />
              </div>
              <div>
                <h2>Notification channels</h2>
                <p>Choose where Foundry should send your notifications.</p>
              </div>
            </div>
            <div className="notification-settings-list">
              <div className="notification-setting-row">
                <div className="notification-setting-icon">
                  <Bell size={18} />
                </div>
                <div className="notification-setting-info">
                  <h3>In-app notifications</h3>
                  <p>Show notifications directly inside Foundry.</p>
                </div>
                <button
                  type="button"
                  className={`notification-toggle ${
                    settings.inApp ? "notification-toggle--active" : ""
                  }`}
                  onClick={() => toggleSetting("inApp")}
                  aria-pressed={settings.inApp}
                >
                  <span className="notification-toggle__knob" />
                </button>
              </div>
              <div className="notification-setting-row">
                <div className="notification-setting-icon">
                  <Mail size={18} />
                </div>
                <div className="notification-setting-info">
                  <h3>Email notifications</h3>
                  <p>Receive important Foundry activity by email.</p>
                </div>
                <button
                  type="button"
                  className={`notification-toggle ${
                    settings.email ? "notification-toggle--active" : ""
                  }`}
                  onClick={() => toggleSetting("email")}
                  aria-pressed={settings.email}
                >
                  <span className="notification-toggle__knob" />
                </button>
              </div>
            </div>
          </section>
          <div className="notification-settings-footer">
            <button
              type="button"
              className="notification-save-button"
              onClick={handleSave}
            >
              <Save size={16} />
              {saved ? "Changes saved" : "Save changes"}
            </button>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}

export default NotificationSettings;
