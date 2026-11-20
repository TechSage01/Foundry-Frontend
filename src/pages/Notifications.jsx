import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCheck,
  Settings,
  Bell,
  UserPlus,
  Heart,
  MessageSquare,
  AtSign,
  FolderKanban,
  Briefcase,
  Repeat2,
  Loader2,
  RefreshCw,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import {
  fetchNotificationsApi,
  markNotificationReadApi,
} from "../services/notifications";
import { AvatarFallback } from "../utils/Avatar";
import { connectSocket } from "../services/socket";

/* ---------- mapping the API's entity_type to what the page shows ---------- */

const norm = (v) => String(v ?? "").toLowerCase();

const groupOf = (type) => {
  const t = norm(type);
  if (t.includes("mention")) return "mention";
  if (t.includes("follow")) return "follow";
  if (t.includes("project")) return "project";
  if (t.includes("opportunit") || t.includes("job")) return "opportunity";
  if (t.includes("post") || t.includes("comment") || t.includes("repost") || t.includes("like"))
    return "post";
  return "other";
};

const iconFor = (type) => {
  const t = norm(type);
  if (t.includes("like")) return Heart;
  if (t.includes("repost")) return Repeat2;
  if (t.includes("mention")) return AtSign;
  if (t.includes("follow")) return UserPlus;
  if (t.includes("project")) return FolderKanban;
  if (t.includes("opportunit") || t.includes("job")) return Briefcase;
  if (t.includes("comment") || t.includes("reply") || t.includes("post")) return MessageSquare;
  return Bell;
};

const BADGE_COLOR = {
  follow: "bg-sky-500",
  mention: "bg-violet-500",
  post: "bg-[#A04622]",
  project: "bg-emerald-600",
  opportunity: "bg-amber-500",
  other: "bg-stone-500",
};

const humanize = (type) => norm(type).replace(/[_-]+/g, " ").trim();

const actionText = (type) => {
  const t = norm(type);
  if (t.includes("follow")) return "started following you";
  if (t.includes("mention")) return "mentioned you";
  if (t.includes("repost")) return "reposted your post";
  if (t.includes("like")) return "liked your post";
  if (t.includes("reply")) return "replied to your comment";
  if (t.includes("comment")) return "commented on your post";
  if (t.includes("conversation") || t.includes("join_request") || t.includes("request"))
    return "asked to join your group";
  if (t.includes("message")) return "sent you a message";
  if (t.includes("project")) return `had a project update (${humanize(type)})`;
  if (t.includes("opportunit")) return `shared an opportunity (${humanize(type)})`;
  return humanize(type) || "sent you a notification";
};

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const dayBucket = (d) => {
  if (!d) return "Earlier";
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((start.getTime() - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return "This week";
  return "Earlier";
};
const BUCKETS = ["Today", "Yesterday", "This week", "Earlier"];

const normalize = (n) => {
  const meta = n.metadata && typeof n.metadata === "object" ? n.metadata : {};
  const actor = meta.actor && typeof meta.actor === "object" ? meta.actor : {};
  const username = meta.username || actor.username || n.actor_username || "";
  const name =
    meta.full_name || actor.full_name || meta.name || actor.name || username || "Someone";
  const read = n.is_read ?? n.read ?? n.isRead ?? Boolean(n.read_at || n.readAt);
  const raw = n.created_at || n.createdAt || n.timestamp;
  const date = raw && !Number.isNaN(new Date(raw).getTime()) ? new Date(raw) : null;
  return {
    id: n.id || n._id,
    type: n.entity_type || n.type || "",
    entityId: n.entity_id || n.entityId || "",
    meta,
    group: groupOf(n.entity_type || n.type),
    actorName: name,
    username,
    avatar:
      meta.avatar_url || actor.avatar_url || meta.actor_avatar_url || n.actor_avatar_url || "",
    detail:
      meta.post_comment ||
      meta.comment ||
      meta.post_title ||
      meta.post_content ||
      meta.project_title ||
      meta.message ||
      "",
    date,
    time: date ? timeAgo(date) : "",
    unread: !read,
  };
};

const FILTERS = [
  { label: "All" },
  { label: "Mentions", type: "mention" },
  { label: "Posts", type: "post" },
  { label: "Projects", type: "project" },
  { label: "Opportunities", type: "opportunity" },
  { label: "Follows", type: "follow" },
];

const Skeleton = () => (
  <div className="space-y-px">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex gap-3 px-5 py-4 animate-pulse">
        <div className="w-11 h-11 rounded-full bg-stone-200" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-2/3 rounded bg-stone-200" />
          <div className="h-3 w-1/3 rounded bg-stone-100" />
        </div>
      </div>
    ))}
  </div>
);

function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError("");
      const list = await fetchNotificationsApi();
      setItems(list.map(normalize));
    } catch (err) {
      console.error("notifications failed:", err.code, err.response?.status, err.response?.data);
      setError(
        err.code === "ECONNABORTED"
          ? "The server took too long to answer. It may be waking up, so try again in a moment."
          : "Could not load your notifications. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // realtime: the backend pushes `notification:new`
  useEffect(() => {
    const s = connectSocket();
    const onNew = () => {
      fetchNotificationsApi()
        .then((list) => setItems(list.map(normalize)))
        .catch(() => {});
    };
    s.on("notification:new", onNew);
    return () => {
      s.off("notification:new", onNew);
    };
  }, []);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    try {
      await markNotificationReadApi(id);
      try { connectSocket().emit("notification:read", id); } catch {}
    } catch (err) {
      console.error("mark read failed:", err.response?.status, err.response?.data);
      // a 404 means the server has no such notification to mark; keep it read here
      if (err.response?.status !== 404) {
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: true } : n)));
      }
    }
  };

  // there is no "mark all" endpoint yet, so mark each unread one
  const markAllRead = async () => {
    const unread = items.filter((n) => n.unread);
    if (!unread.length || markingAll) return;
    setMarkingAll(true);
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    const results = await Promise.allSettled(unread.map((n) => markNotificationReadApi(n.id)));
    const failed = new Set(
      unread.filter((_, i) => results[i].status === "rejected").map((n) => n.id),
    );
    if (failed.size) {
      setItems((prev) => prev.map((n) => (failed.has(n.id) ? { ...n, unread: true } : n)));
    }
    setMarkingAll(false);
  };

  // where each kind of notification should take you
  const destinationOf = (n) => {
    const t = norm(n.type);
    const m = n.meta || {};
    const id = n.entityId;
    if (t.includes("follow") && n.username) return `/profile/${n.username}`;
    if (t.includes("conversation") || t.includes("request") || t.includes("message")) {
      const conv = m.conversation_id || m.conversationId || id;
      return conv ? `/messages?c=${conv}&requests=1` : "/messages";
    }
    if (t.includes("project")) {
      const slug = m.slug || m.project_slug;
      return slug ? `/projects/${slug}` : "/discover";
    }
    if (t.includes("opportunit") || t.includes("job")) return id ? `/opportunities/${id}` : "/opportunities";
    if (t.includes("communit")) {
      const slug = m.slug || m.community_slug;
      return slug ? `/communities/${slug}` : "/communities";
    }
    if (t.includes("mention")) return "/home";
    // likes, comments, reposts on your posts
    if (t.includes("post") || t.includes("comment") || t.includes("like") || t.includes("repost"))
      return "/profile";
    return null;
  };

  const openNotification = (n) => {
    if (n.unread) markRead(n.id);
    const to = destinationOf(n);
    if (to) navigate(to);
  };

  const selected = FILTERS.find((f) => f.label === activeFilter);
  const filtered = useMemo(
    () =>
      items.filter(
        (n) =>
          (activeFilter === "All" || n.group === selected?.type) && (!unreadOnly || n.unread),
      ),
    [items, activeFilter, selected, unreadOnly],
  );
  const grouped = useMemo(
    () =>
      BUCKETS.map((b) => ({ label: b, rows: filtered.filter((n) => dayBucket(n.date) === b) })).filter(
        (g) => g.rows.length,
      ),
    [filtered],
  );
  const unreadCount = items.filter((n) => n.unread).length;
  const countOf = (g) => items.filter((n) => n.group === g).length;

  const Row = ({ n }) => {
    const Icon = iconFor(n.type);
    return (
      <li>
        <div
          role="button"
          tabIndex={0}
          onClick={() => openNotification(n)}
          onKeyDown={(e) => e.key === "Enter" && openNotification(n)}
          className={`relative flex gap-3.5 px-5 py-4 cursor-pointer transition-colors outline-none focus-visible:bg-stone-50 ${
            n.unread ? "bg-[#FDF6F2] hover:bg-[#FBEFE8]" : "hover:bg-stone-50"
          }`}
        >
          {n.unread && (
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#A04622]" aria-hidden />
          )}
          <div className="relative shrink-0">
            <img
              src={n.avatar || AvatarFallback(n.actorName)}
              alt={n.actorName}
              onLoad={(e) => {
                const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                // wide logos used as avatars: show them whole instead of cropped
                if (w && h && (w / h > 1.35 || w / h < 0.74)) {
                  e.currentTarget.classList.remove("object-cover");
                  e.currentTarget.classList.add("object-contain", "p-1.5");
                }
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = AvatarFallback(n.actorName);
              }}
              className="w-11 h-11 rounded-full object-cover bg-white border border-stone-200"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center text-white ${
                BADGE_COLOR[n.group] || BADGE_COLOR.other
              }`}
            >
              <Icon size={11} strokeWidth={2.5} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-stone-700 leading-snug">
              {n.username ? (
                <Link
                  to={`/profile/${n.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-stone-900 hover:underline"
                >
                  {n.actorName}
                </Link>
              ) : (
                <span className="font-semibold text-stone-900">{n.actorName}</span>
              )}{" "}
              {actionText(n.type)}
            </p>
            {n.detail && (
              <p className="mt-1.5 text-[13px] text-stone-500 line-clamp-2 pl-3 border-l-2 border-stone-200">
                {n.detail}
              </p>
            )}
          </div>

          <div className="shrink-0 flex flex-col items-end gap-2">
            <span className="text-[11px] text-stone-400">{n.time}</span>
            {n.unread && <span className="w-2 h-2 rounded-full bg-[#A04622]" aria-label="Unread" />}
          </div>
        </div>
      </li>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        <main className="min-w-0 space-y-4">
          {/* header */}
          <header className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#A04622]">
                Activity feed
              </p>
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 align-middle text-xs font-bold bg-[#A04622] text-white rounded-full px-2 py-0.5">
                    {unreadCount} new
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAllRead}
                disabled={unreadCount === 0 || markingAll}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {markingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                Mark all as read
              </button>
              <Link
                to="/settings/notifications"
                aria-label="Notification settings"
                title="Notification settings"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50"
              >
                <Settings size={16} />
              </Link>
            </div>
          </header>

          {/* filters */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {FILTERS.map((f) => {
                const count = f.type ? items.filter((n) => n.group === f.type && n.unread).length : 0;
                const active = activeFilter === f.label;
                return (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => setActiveFilter(f.label)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? "bg-stone-900 text-white"
                        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {f.label}
                    {count > 0 && (
                      <span
                        className={`min-w-4 h-4 px-1 rounded-full text-[10px] flex items-center justify-center ${
                          active ? "bg-white text-stone-900" : "bg-[#A04622] text-white"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <label className="shrink-0 hidden sm:flex items-center gap-2 text-xs text-stone-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="accent-[#A04622]"
              />
              Unread only
            </label>
          </div>

          {/* list */}
          <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <Skeleton />
            ) : error ? (
              <div className="py-14 px-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center">
                  <Bell size={22} />
                </div>
                <p className="text-sm font-semibold text-stone-800">Something went wrong</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">{error}</p>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#A04622] text-white hover:bg-[#85381a] cursor-pointer"
                >
                  <RefreshCw size={13} /> Try again
                </button>
              </div>
            ) : grouped.length === 0 ? (
              <div className="py-14 px-6 text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-[#FDF4F0] text-[#A04622] flex items-center justify-center">
                  <Bell size={22} />
                </div>
                <p className="text-sm font-semibold text-stone-800">
                  {items.length === 0 ? "Nothing here yet" : "No notifications in this view"}
                </p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  {items.length === 0
                    ? "When someone follows you or interacts with your posts, you will see it here."
                    : "Try another filter, or turn off “Unread only”."}
                </p>
              </div>
            ) : (
              grouped.map((g) => (
                <div key={g.label}>
                  <h2 className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-400 bg-stone-50/70 border-y border-stone-100 first:border-t-0">
                    {g.label}
                  </h2>
                  <ul className="divide-y divide-stone-100">
                    {g.rows.map((n) => (
                      <Row key={n.id} n={n} />
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
        </main>

        {/* right rail */}
        <aside className="space-y-4 lg:sticky lg:top-20">
          <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-bold text-stone-900">Activity summary</h2>
            <dl className="text-sm space-y-2.5">
              {[
                ["Project updates", countOf("project")],
                ["New followers", countOf("follow")],
                ["Post activity", countOf("post")],
                ["Mentions", countOf("mention")],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-stone-500">{label}</dt>
                  <dd className="font-semibold text-stone-800 bg-stone-100 rounded-full px-2.5 py-0.5 text-xs">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="bg-[#FDF4F0] rounded-2xl border border-[#f6e2d9] p-5 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#A04622] flex items-center justify-center">
              <Settings size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">Notification settings</h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Choose what Foundry tells you about, and how.
              </p>
            </div>
            <Link
              to="/settings/notifications"
              className="inline-block text-xs font-semibold text-[#A04622] hover:underline"
            >
              Open settings
            </Link>
          </section>
        </aside>
      </div>
    </MainLayout>
  );
}

export default Notifications;