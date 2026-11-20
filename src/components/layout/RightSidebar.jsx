import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, Users, UserPlus, ChevronRight, Loader2 } from "lucide-react";
import api from "../../services/api";
import { followUserApi } from "../../services/users";
import { AvatarFallback, getUserAvatar, getUserName } from "../../utils/Avatar";

const listOf = (res, ...keys) => {
  const body = res.data?.data ?? res.data;
  if (Array.isArray(body)) return body;
  for (const k of keys) if (Array.isArray(body?.[k])) return body[k];
  if (Array.isArray(body?.items)) return body.items;
  return Object.values(body || {}).find(Array.isArray) || [];
};

const formatCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n);

const TAG_RE = /(^|[^\w&])#([A-Za-z0-9_]+)/g;

// every distinct #tag used in a post (text, title and the tags field)
const tagsOfPost = (p) => {
  const found = new Set();
  const add = (t) => {
    const clean = String(t).replace(/^#/, "").trim();
    if (clean) found.add(clean);
  };
  for (const text of [p.content, p.title]) {
    if (!text) continue;
    TAG_RE.lastIndex = 0;
    let m;
    while ((m = TAG_RE.exec(String(text))) !== null) add(m[2]);
  }
  const t = p.tags;
  if (Array.isArray(t)) t.forEach(add);
  else if (typeof t === "string") t.split(/[,\s]+/).forEach(add);
  return [...found];
};

const toCommunity = (c) => {
  const name = c.name || c.title || "Community";
  return {
    id: c.id || c._id,
    slug: c.slug,
    name,
    badge: name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join(""),
    members: c.builders_count ?? c.members_count ?? c.member_count ?? 0,
    joined: Boolean(c.is_joined ?? c.is_member ?? c.isMember ?? false),
  };
};

const BADGE_COLORS = ["bg-[#D97757]", "bg-zinc-700", "bg-slate-800", "bg-[#A04622]"];

const RightSidebar = ({ onSelectTopic, selectedTopic, dark = false }) => {
  const navigate = useNavigate();

  /* ---------- trending topics (counted from the trending posts) ---------- */
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get("/api/posts/trending", { params: { page: 1, limit: 50 } })
      .catch(() => api.get("/api/posts", { params: { page: 1, limit: 50 } }))
      .then((res) => {
        const counts = new Map();
        listOf(res, "posts").forEach((p) =>
          tagsOfPost(p).forEach((t) => {
            const key = t.toLowerCase();
            const prev = counts.get(key);
            counts.set(key, { tag: prev?.tag || t, count: (prev?.count || 0) + 1 });
          }),
        );
        if (alive) {
          setTopics(
            [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5),
          );
        }
      })
      .catch((err) => console.error("trending topics failed:", err.response?.status))
      .finally(() => alive && setTopicsLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  /* ---------- communities ---------- */
  const [communities, setCommunities] = useState([]);
  const [commLoading, setCommLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get("/api/communities")
      .then((res) => {
        if (!alive) return;
        setCommunities(
          listOf(res, "communities")
            .map(toCommunity)
            .sort((a, b) => b.members - a.members)
            .slice(0, 3),
        );
      })
      .catch((err) => console.error("communities failed:", err.response?.status))
      .finally(() => alive && setCommLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const toggleJoin = async (c) => {
    const was = c.joined;
    try {
      await api.post(`/api/communities/${c.id}/${was ? "leave" : "join"}`);
      setCommunities((prev) =>
        prev.map((x) =>
          x.id === c.id
            ? { ...x, joined: !was, members: Math.max(0, x.members + (was ? -1 : 1)) }
            : x,
        ),
      );
    } catch (err) {
      if (err.response?.status === 409) {
        setCommunities((prev) => prev.map((x) => (x.id === c.id ? { ...x, joined: true } : x)));
      } else {
        console.error("join/leave failed:", err.response?.status, err.response?.data);
      }
    }
  };

  /* ---------- suggested builders ---------- */
  const [builders, setBuilders] = useState([]);
  const [buildersLoading, setBuildersLoading] = useState(true);
  const [followed, setFollowed] = useState({}); // username -> true
  const [busy, setBusy] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const meRes = await api.get("/api/auth/me");
        const me = meRes.data?.data || meRes.data?.user || meRes.data;
        const [usersRes, followingRes] = await Promise.all([
          api.get("/api/users", { params: { page: 1, limit: 50 } }).catch(() => api.get("/api/users")),
          me?.username
            ? api.get(`/api/users/${me.username}/following`, { params: { limit: 500 } }).catch(() => null)
            : Promise.resolve(null),
        ]);
        const followingNames = new Set(
          (followingRes ? listOf(followingRes, "following", "users") : [])
            .map((u) => (typeof u === "string" ? u : u?.username || u?.user?.username))
            .filter(Boolean)
            .map((n) => String(n).toLowerCase()),
        );
        const suggestions = listOf(usersRes, "users")
          .filter((u) => u?.username)
          .filter((u) => String(u.username).toLowerCase() !== String(me?.username || "").toLowerCase())
          .filter((u) => !followingNames.has(String(u.username).toLowerCase()))
          .slice(0, 3);
        if (alive) setBuilders(suggestions);
      } catch (err) {
        console.error("suggested builders failed:", err.response?.status);
      } finally {
        if (alive) setBuildersLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const follow = async (username) => {
    if (busy[username]) return;
    setBusy((b) => ({ ...b, [username]: true }));
    try {
      await followUserApi(username, true);
      setFollowed((f) => ({ ...f, [username]: true }));
    } catch (err) {
      if (err.response?.status === 409) setFollowed((f) => ({ ...f, [username]: true }));
      else console.error("follow failed:", err.response?.status, err.response?.data);
    } finally {
      setBusy((b) => ({ ...b, [username]: false }));
    }
  };

  const rowSkeleton = (n = 3) => (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`h-8 rounded-lg ${dark ? "bg-white/5" : "bg-stone-200/60"}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Trending topics */}
      <div className={dark ? "bg-[#16181c] rounded-2xl py-3" : "bg-[#FEF2EC] rounded-2xl p-4 border border-[#EFECE6]"}>
        <div className={`flex items-center justify-between mb-3 ${dark ? "px-4" : ""}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${dark ? "text-[#e7e9ea]" : "text-[#D97757]"}`} />
            <h3 className={dark ? "text-xl font-extrabold text-[#e7e9ea]" : "text-xs font-bold text-[#1F1F1F]"}>Trending Topics</h3>
          </div>
          <span className={`text-[10px] font-medium ${dark ? "text-[#71767b]" : "text-gray-500"}`}>Live</span>
        </div>
        {topicsLoading ? (
          rowSkeleton(4)
        ) : topics.length === 0 ? (
          <p className={`text-[11px] leading-relaxed ${dark ? "px-4 text-[#71767b]" : "text-stone-500"}`}>
            No hashtags yet. Add a <strong>#tag</strong> to your next post and it will show up here.
          </p>
        ) : (
          <div className="space-y-1">
            {topics.map((item) => {
              const tag = `#${item.tag}`;
              const isActive = String(selectedTopic || "").toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => onSelectTopic && onSelectTopic(isActive ? null : tag)}
                  className={`w-full flex items-center justify-between transition-all cursor-pointer group text-left ${
                    dark
                      ? `px-4 py-3 ${isActive ? "bg-white/10" : "hover:bg-white/5"}`
                      : `p-2.5 rounded-xl ${isActive ? "bg-[#A04622]/10 border border-[#A04622]/30" : "hover:bg-stone-200/60 border border-transparent"}`
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`font-bold truncate transition-colors ${
                        dark ? "text-[15px] text-[#e7e9ea]" : `text-xs ${isActive ? "text-[#A04622]" : "text-stone-800 group-hover:text-[#A04622]"}`
                      }`}
                    >
                      {tag}
                    </p>
                    <p className={`${dark ? "text-[13px] text-[#71767b]" : "text-[10px] text-[#737373]"}`}>
                      {formatCount(item.count)} {item.count === 1 ? "post" : "posts"}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isActive
                        ? "text-[#A04622] translate-x-0.5"
                        : "text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active communities */}
      <div className={dark ? "bg-[#16181c] rounded-2xl py-3" : "bg-[#F4F2E2] rounded-2xl p-4 border border-[#EFECE6]"}>
        <div className={`flex items-center justify-between mb-3 ${dark ? "px-4" : ""}`}>
          <div className="flex items-center gap-2">
            <Users className={`w-4 h-4 ${dark ? "text-[#e7e9ea]" : "text-[#D97757]"}`} />
            <h3 className={dark ? "text-xl font-extrabold text-[#e7e9ea]" : "text-xs font-bold text-[#1F1F1F]"}>Active Communities</h3>
          </div>
          <button
            type="button"
            onClick={() => navigate("/communities")}
            className={`text-[11px] hover:underline cursor-pointer ${dark ? "text-[#1d9bf0]" : "text-gray-500"}`}
          >
            Explore all
          </button>
        </div>
        {commLoading ? (
          rowSkeleton(3)
        ) : communities.length === 0 ? (
          <p className={`text-[11px] ${dark ? "px-4 text-[#71767b]" : "text-stone-500"}`}>
            No communities yet.{" "}
            <Link to="/communities/create" className="font-semibold text-[#A04622] hover:underline">
              Create one
            </Link>
          </p>
        ) : (
          <div className={dark ? "" : "space-y-3"}>
            {communities.map((c, i) => (
              <div key={c.id} className={`flex items-center justify-between gap-2 text-xs ${dark ? "px-4 py-3 hover:bg-white/5" : ""}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg ${BADGE_COLORS[i % BADGE_COLORS.length]} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}
                  >
                    {c.badge}
                  </div>
                  <div className="min-w-0">
                    {c.slug ? (
                      <Link
                        to={`/communities/${c.slug}`}
                        className={`block font-bold truncate ${dark ? "text-[15px] text-[#e7e9ea] hover:underline" : "font-semibold text-[#2D2D2D] hover:text-[#D97757] text-[11px]"}`}
                      >
                        {c.name}
                      </Link>
                    ) : (
                      <p className={`font-bold truncate ${dark ? "text-[15px] text-[#e7e9ea]" : "text-[#2D2D2D] text-[11px]"}`}>{c.name}</p>
                    )}
                    <p className={dark ? "text-[13px] text-[#71767b]" : "text-[10px] text-[#737373]"}>
                      {c.members.toLocaleString()} {c.members === 1 ? "builder" : "builders"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleJoin(c)}
                  className={`cursor-pointer shrink-0 ${
                    dark
                      ? `px-4 h-8 rounded-full text-sm font-bold ${c.joined ? "border border-[#536471] text-[#e7e9ea] hover:bg-white/10" : "bg-[#eff3f4] text-black hover:bg-white"}`
                      : `px-2.5 py-1 rounded-md text-[11px] font-medium border ${c.joined ? "bg-transparent border-gray-300 text-gray-500 hover:bg-white" : "bg-white hover:bg-gray-100 border-gray-200"}`
                  }`}
                >
                  {c.joined ? "Joined" : "Join"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested builders */}
      <div className={dark ? "bg-[#16181c] rounded-2xl py-3" : "bg-[#FEF2EC] rounded-2xl p-4 border border-[#EFECE6]"}>
        <div className={`flex items-center gap-2 mb-3 ${dark ? "px-4" : ""}`}>
          <UserPlus className={`w-4 h-4 ${dark ? "text-[#e7e9ea]" : "text-[#D97757]"}`} />
          <h3 className={dark ? "text-xl font-extrabold text-[#e7e9ea]" : "text-xs font-bold text-[#1F1F1F]"}>Suggested Builders</h3>
        </div>
        {buildersLoading ? (
          rowSkeleton(3)
        ) : builders.length === 0 ? (
          <p className={`text-[11px] ${dark ? "px-4 text-[#71767b]" : "text-stone-500"}`}>
            You are following everyone for now. Check back later.
          </p>
        ) : (
          <div className={dark ? "" : "space-y-3"}>
            {builders.map((u) => {
              const name = u.full_name || u.name || getUserName(u) || u.username;
              const isFollowed = followed[u.username];
              return (
                <div key={u.username} className={`flex items-center justify-between gap-2 text-xs ${dark ? "px-4 py-3 hover:bg-white/5" : ""}`}>
                  <Link to={`/profile/${u.username}`} className="flex items-center gap-2 min-w-0 group">
                    <img
                      src={getUserAvatar(u) || AvatarFallback(name)}
                      alt={name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = AvatarFallback(name);
                      }}
                      className={`rounded-full object-cover shrink-0 ${dark ? "w-10 h-10 bg-[#16181c]" : "w-8 h-8 bg-white border border-stone-200"}`}
                    />
                    <div className="min-w-0">
                      <p className={`truncate ${dark ? "text-[15px] font-bold text-[#e7e9ea] group-hover:underline" : "font-semibold text-[#2D2D2D] group-hover:text-[#D97757]"}`}>
                        {name}
                      </p>
                      <p className={`truncate ${dark ? "text-[15px] text-[#71767b]" : "text-[10px] text-[#737373]"}`}>
                        {u.headline || `@${u.username}`}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => follow(u.username)}
                    disabled={isFollowed || busy[u.username]}
                    className={`shrink-0 inline-flex items-center gap-1 ${
                      dark
                        ? `px-4 h-8 rounded-full text-sm font-bold ${isFollowed ? "border border-[#536471] text-[#e7e9ea] cursor-default" : "bg-[#eff3f4] text-black hover:bg-white cursor-pointer"}`
                        : `px-3 py-1 rounded-md font-medium text-[11px] ${isFollowed ? "bg-white border border-gray-300 text-gray-500 cursor-default" : "bg-[#803323] text-white hover:opacity-90 cursor-pointer"}`
                    }`}
                  >
                    {busy[u.username] && <Loader2 size={11} className="animate-spin" />}
                    {isFollowed ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;