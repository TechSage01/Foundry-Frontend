import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Search,
  SquarePen,
  Paperclip,
  Send,
  Download,
  X,
  ArrowLeft,
  MessageCircle,
  Users,
  Loader2,
  Copy,
  Check,
  Info,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import api from "../services/api";
import {
  fetchConversationsApi,
  fetchMessagesApi,
  sendMessageApi,
  createConversationApi,
  markConversationReadApi,
  fetchJoinRequestsApi,
  reviewJoinRequestApi,
  joinConversationApi as joinByCodeApi,
  normalizeMessage,
  mergeMessages,
  formatTime,
} from "../services/messages";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "../services/socket";
import { AvatarFallback, getUserAvatar, getUserName } from "../utils/Avatar";

const PAGE_SIZE = 30;
const CHAT_FILTERS = { All: null, Direct: "direct", Groups: "group", Projects: "project" };
const PEOPLE_FILTERS = ["Following", "Followers", "Friends", "Everyone"];

const errText = (err, fallback) =>
  err?.response?.data?.message ||
  Object.values(err?.response?.data?.errors || {}).flat().join(", ") ||
  fallback;

const toPerson = (row) => {
  const u =
    row?.follower ||
    row?.following ||
    row?.followee ||
    row?.followed ||
    row?.user ||
    row ||
    {};
  return {
    id: String(
      u.id || u._id || u.user_id || u.follower_id || u.following_id || u.followee_id || "",
    ),
    username: u.username || "",
    name: getUserName(u),
    avatar: getUserAvatar(u),
  };
};

const readUsers = (res) => {
  const body = res?.data?.data ?? res?.data;
  const arr = Array.isArray(body)
    ? body
    : body?.followers || body?.following || body?.users || body?.items || [];
  return arr.map(toPerson).filter((p) => p.id || p.username);
};

const dayLabel = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// find the object that belongs to `username` anywhere in an API response
const findUserId = (body, username) => {
  const queue = [body];
  let guard = 0;
  while (queue.length && guard++ < 200) {
    const node = queue.shift();
    if (!node || typeof node !== "object") continue;
    const id = node.id || node._id || node.user_id || node.userId;
    if (id && (!username || node.username === username)) return String(id);
    queue.push(...(Array.isArray(node) ? node : Object.values(node)));
  }
  return "";
};

const directPartnerId = (c) =>
  String(
    c.raw?.partner?.id ||
      c.raw?.other_user?.id ||
      c.raw?.otherUser?.id ||
      c.raw?.recipient?.id ||
      c.raw?.participant?.id ||
      "",
  );

/* ---------- small pieces ---------- */

const Avatar = ({ src, name, size = 40, group = false }) => {
  if (group && !src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-[#F1E4DC] text-[#A04622] flex items-center justify-center shrink-0"
      >
        <Users size={size * 0.45} />
      </div>
    );
  }
  return (
    <img
      src={src || AvatarFallback(name)}
      alt=""
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = AvatarFallback(name);
      }}
      style={{ width: size, height: size }}
      className="rounded-full object-cover shrink-0 bg-[#F5F0EB]"
    />
  );
};

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
      active
        ? "bg-[#A04622] text-white"
        : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
    }`}
  >
    {children}
  </button>
);

const EmptyBox = ({ icon: Icon, title, text }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 gap-2 text-stone-500">
    <div className="w-14 h-14 rounded-full bg-[#F1E4DC] text-[#A04622] flex items-center justify-center">
      <Icon size={26} />
    </div>
    <p className="text-sm font-semibold text-stone-800">{title}</p>
    {text && <p className="text-xs max-w-xs">{text}</p>}
  </div>
);

/* ---------- page ---------- */

function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toParam = searchParams.get("to"); // /messages?to=<userId> starts a DM
  const convParam = searchParams.get("c"); // /messages?c=<conversationId> opens a chat (from a notification)
  const wantRequests = searchParams.get("requests") === "1";

  const [me, setMe] = useState(null);
  const myId = String(me?.id || me?._id || "");
  const myIdRef = useRef(myId);
  myIdRef.current = myId;

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [recipient, setRecipient] = useState(null); // person we're about to DM
  const [section, setSection] = useState("Chats"); // Chats | People
  const [chatFilter, setChatFilter] = useState("All");
  const [peopleFilter, setPeopleFilter] = useState("Following");
  const [search, setSearch] = useState("");

  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleLoaded, setPeopleLoaded] = useState(false);
  const [everyone, setEveryone] = useState([]);
  const [everyoneLoaded, setEveryoneLoaded] = useState(false);
  const [peopleError, setPeopleError] = useState("");

  const [messagesByConv, setMessagesByConv] = useState({});
  const [hasMore, setHasMore] = useState({});
  const [cursors, setCursors] = useState({});
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [socketOn, setSocketOn] = useState(false);

  const [groupOpen, setGroupOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinMsg, setJoinMsg] = useState("");
  const [requests, setRequests] = useState([]);
  const [reqOpen, setReqOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [typing, setTyping] = useState(null); // { conversationId, name }
  const typingTimer = useRef(null);
  const lastTypingEmit = useRef(0);
  const stopTypingTimer = useRef(null);
  const [groupForm, setGroupForm] = useState({ name: "", type: "Group", join_policy: "Open" });
  const [groupSaving, setGroupSaving] = useState(false);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const activeIdRef = useRef(null);
  const conversationsRef = useRef([]);
  activeIdRef.current = activeId;
  conversationsRef.current = conversations;

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = (activeId && messagesByConv[activeId]) || [];
  const chatOpen = Boolean(activeId || recipient);
  const isGroupChat = activeConversation && activeConversation.type !== "direct";

  /* ---------- who am I ---------- */
  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((res) => setMe(res.data?.data || res.data?.user || res.data))
      .catch(() => {});
  }, []);

  /* ---------- conversations ---------- */
  const loadConversations = useCallback(async (opts = {}) => {
    try {
      const list = await fetchConversationsApi();
      setConversations(
        list.map((c) => (c.id === activeIdRef.current ? { ...c, unread: 0 } : c)),
      );
      if (!opts.silent) setError("");
      return list;
    } catch (err) {
      if (!opts.silent) {
        console.error("conversations failed:", err.response?.status, err.response?.data);
        setError(errText(err, "Could not load conversations."));
      }
      return [];
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // /messages?to=<userId>: open the existing chat with that person, or start a new one
  useEffect(() => {
    if (!convParam || !conversations.length) return;
    const target = conversations.find((c) => c.id === String(convParam));
    if (target) {
      setActiveId(target.id);
      setRecipient(null);
      if (wantRequests && target.type !== "direct") setInfoOpen(true);
    }
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line
  }, [convParam, conversations.length]);

  useEffect(() => {
    if (!toParam) return;
    const existing = conversations.find(
      (c) => c.type === "direct" && directPartnerId(c) === String(toParam),
    );
    if (existing) {
      setActiveId(existing.id);
      setRecipient(null);
      setSearchParams({}, { replace: true });
    } else if (!loadingList) {
      setRecipient({ id: String(toParam), name: "New message" });
      setActiveId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toParam, conversations, loadingList]);

  /* ---------- people (following / followers) ---------- */
  useEffect(() => {
    const username = me?.username;
    if (section !== "People" || peopleLoaded || !me) return;
    if (!username) {
      setPeopleError("Could not find your username. Try signing in again.");
      return;
    }
    setPeopleLoading(true);
    setPeopleError("");
    const load = (kind) =>
      api
        .get(`/api/users/${username}/${kind}`)
        .then((res) => {
          console.log(`${kind} response:`, res.data);
          return readUsers(res);
        })
        .catch((err) => {
          console.error(`${kind} failed:`, err.response?.status, err.response?.data);
          setPeopleError(errText(err, `Could not load your ${kind}.`));
          return [];
        });
    Promise.all([load("following"), load("followers")])
      .then(([fing, fers]) => {
        setFollowing(fing);
        setFollowers(fers);
        setPeopleLoaded(true);
      })
      .finally(() => setPeopleLoading(false));
  }, [section, me, peopleLoaded]);

  // "Everyone": the paginated user list, GET /api/users
  useEffect(() => {
    if (section !== "People" || peopleFilter !== "Everyone" || everyoneLoaded) return;
    setPeopleLoading(true);
    setPeopleError("");
    api
      .get("/api/users", { params: { page: 1, limit: 100 } })
      .catch(() => api.get("/api/users"))
      .then((res) => {
        console.log("users response:", res.data);
        setEveryone(readUsers(res));
        setEveryoneLoaded(true);
      })
      .catch((err) => {
        console.error("users failed:", err.response?.status, err.response?.data);
        setPeopleError(errText(err, "Could not load users."));
      })
      .finally(() => setPeopleLoading(false));
  }, [section, peopleFilter, everyoneLoaded]);

  // directory of users, loaded once, used to find a chat partner's username
  const [directory, setDirectory] = useState([]);
  useEffect(() => {
    let alive = true;
    api
      .get("/api/users", { params: { page: 1, limit: 200 } })
      .catch(() => api.get("/api/users"))
      .then((res) => alive && setDirectory(readUsers(res)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const pkey = (p) => p.id || p.username;
  const followingIds = new Set(following.map(pkey));
  const followerIds = new Set(followers.map(pkey));
  const peopleSource =
    peopleFilter === "Following"
      ? following
      : peopleFilter === "Followers"
        ? followers
        : peopleFilter === "Everyone"
          ? everyone.filter((p) => p.username !== me?.username && p.id !== myId)
          : following.filter((p) => followerIds.has(pkey(p))); // friends = follow each other

  /* ---------- message history ---------- */
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    setLoadingMsgs(true);
    fetchMessagesApi(activeId, { limit: PAGE_SIZE })
      .then(({ items, hasMore: more, nextCursor }) => {
        if (cancelled) return;
        setMessagesByConv((p) => ({ ...p, [activeId]: mergeMessages(p[activeId], items) }));
        setHasMore((h) => ({ ...h, [activeId]: more }));
        setCursors((c) => ({ ...c, [activeId]: nextCursor }));
        setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c)));
        markConversationReadApi(activeId).catch(() => {});
      })
      .catch((err) => {
        console.error("messages failed:", err.response?.status, err.response?.data);
        if (!cancelled) setError(errText(err, "Could not load messages."));
      })
      .finally(() => !cancelled && setLoadingMsgs(false));
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const loadEarlier = async () => {
    const cursor = cursors[activeId] || messages[0]?.createdAt;
    if (!activeId || !cursor) return;
    try {
      const { items, hasMore: more, nextCursor } = await fetchMessagesApi(activeId, {
        limit: PAGE_SIZE,
        cursor,
      });
      setMessagesByConv((p) => ({ ...p, [activeId]: mergeMessages(p[activeId], items) }));
      setHasMore((h) => ({ ...h, [activeId]: more }));
      setCursors((c) => ({ ...c, [activeId]: nextCursor }));
    } catch (err) {
      setError(errText(err, "Could not load earlier messages."));
    }
  };

  /* ---------- realtime (socket.io, cookie auth) ---------- */
  useEffect(() => {
    const s = connectSocket();
    const onConnect = () => setSocketOn(true);
    const onDisconnect = () => setSocketOn(false);
    const onConnectError = (e) => {
      console.warn("socket connect_error:", e?.message);
      setSocketOn(false);
    };

    const onIncoming = (payload) => {
      const raw = payload?.message || payload?.data || payload;
      if (!raw || typeof raw !== "object") return;
      const msg = normalizeMessage({
        ...raw,
        conversation_id: raw.conversation_id || raw.conversationId || payload?.conversation_id,
      });
      if (!msg.conversationId) return;

      setMessagesByConv((p) =>
        p[msg.conversationId]
          ? { ...p, [msg.conversationId]: mergeMessages(p[msg.conversationId], [msg]) }
          : p,
      );

      const known = conversationsRef.current.find((c) => c.id === msg.conversationId);
      if (!known) {
        loadConversations();
        return;
      }
      const isActive = msg.conversationId === activeIdRef.current;
      if (isActive) markConversationReadApi(msg.conversationId).catch(() => {});
      setConversations((prev) => {
        const target = prev.find((c) => c.id === msg.conversationId);
        if (!target) return prev;
        const updated = {
          ...target,
          preview: msg.text || "Sent an attachment",
          time: msg.time,
          unread: isActive ? 0 : (target.unread || 0) + 1,
        };
        return [updated, ...prev.filter((c) => c.id !== msg.conversationId)];
      });
    };

    // We don't know the backend's event name yet, so listen to every event and
    // treat anything that looks like a message (content + conversation id) as one.
    const onAny = (event, ...args) => {
      console.log("socket event:", event, args);
      const payload = args[0];
      const raw = payload?.message || payload?.data || payload;
      if (
        raw &&
        typeof raw === "object" &&
        (raw.content !== undefined || raw.text !== undefined) &&
        (raw.conversation_id || raw.conversationId || payload?.conversation_id)
      ) {
        onIncoming(payload);
      }
    };
    s.onAny(onAny);
    const onTypingDisplay = (p) => {
      const convId = p?.conversationId || p?.conversation_id;
      const who = String(p?.userId || p?.user_id || "");
      if (!convId || (who && who === myIdRef.current)) return;
      const on = p?.isTyping ?? p?.is_typing ?? p?.typing ?? true;
      clearTimeout(typingTimer.current);
      if (!on) {
        setTyping(null);
        return;
      }
      setTyping({ conversationId: convId, name: p?.username || p?.full_name || p?.name || "" });
      typingTimer.current = setTimeout(() => setTyping(null), 4000);
    };
    let readTimer;
    const onConvRead = () => {
      clearTimeout(readTimer);
      readTimer = setTimeout(() => loadConversations({ silent: true }), 1500);
    };
    s.on("typing:display", onTypingDisplay);
    s.on("conversation:read", onConvRead);
    s.on("error", (e) => console.warn("socket error event:", e));
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);
    if (s.connected) setSocketOn(true);

    return () => {
      s.offAny(onAny);
      s.off("typing:display", onTypingDisplay);
      s.off("conversation:read", onConvRead);
      clearTimeout(typingTimer.current);
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onConnectError);
      disconnectSocket();
    };
  }, [loadConversations]);

  // join the open conversation's room so events for it reach us
  useEffect(() => {
    if (!activeId || !socketOn) return;
    const s = getSocket();
    s.emit("conversation:join", activeId);
    return () => {
      s.emit("conversation:leave", activeId);
    };
  }, [activeId, socketOn]);

  // pending join requests (only works for the owner; everyone else gets an error we ignore)
  useEffect(() => {
    setRequests([]);
    setReqOpen(false);
    const c = conversations.find((x) => x.id === activeId);
    if (!activeId || !c || c.type === "direct") return;
    let cancelled = false;
    fetchJoinRequestsApi(activeId)
      .then((list) => !cancelled && setRequests(list))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [activeId]);

  const reviewRequest = async (r, action) => {
    const person = r.applicant || r.user || r;
    const applicantId = r.applicant_id || r.user_id || person.id || person._id;
    try {
      await reviewJoinRequestApi(activeId, applicantId, action);
      setRequests((prev) => prev.filter((x) => x !== r));
    } catch (err) {
      setError(errText(err, "Could not update that request."));
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setJoinMsg("Joining...");
    try {
      await joinByCodeApi(joinCode);
      setJoinMsg("Done. If approval is required, the owner will review your request.");
      setJoinCode("");
      loadConversations({ silent: true });
    } catch (err) {
      setJoinMsg(errText(err, "That code didn't work."));
    }
  };

  const notifyTyping = () => {
    if (!activeId) return;
    const s = getSocket();
    if (!s.connected) return;
    const now = Date.now();
    if (now - lastTypingEmit.current > 2500) {
      s.emit("typing:start", activeId);
      lastTypingEmit.current = now;
    }
    clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => {
      s.emit("typing:stop", activeId);
      lastTypingEmit.current = 0;
    }, 1800);
  };

  // Safety net only when the live socket is down: poll slowly, and back off
  // for a minute if the server answers 429 (too many requests).
  const pausedUntil = useRef(0);
  useEffect(() => {
    if (socketOn) return;
    const tick = () => {
      if (document.hidden || Date.now() < pausedUntil.current) return;
      const onErr = (err) => {
        if (err?.response?.status === 429) pausedUntil.current = Date.now() + 60000;
      };
      loadConversations({ silent: true });
      const id = activeIdRef.current;
      if (!id) return;
      fetchMessagesApi(id, { limit: PAGE_SIZE })
        .then(({ items }) =>
          setMessagesByConv((p) => ({ ...p, [id]: mergeMessages(p[id], items) })),
        )
        .catch(onErr);
    };
    const timer = setInterval(tick, 20000);
    return () => clearInterval(timer);
  }, [loadConversations, socketOn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, activeId]);

  /* ---------- actions ---------- */
  const clearToParam = () => {
    if (toParam) setSearchParams({}, { replace: true });
  };

  const openConversation = (id) => {
    setActiveId(id);
    setRecipient(null);
    setError("");
    clearToParam();
  };

  const closeChat = () => {
    setActiveId(null);
    setRecipient(null);
    clearToParam();
  };

  const startChatWith = async (person) => {
    console.log("Message clicked:", person);
    let target = person;
    // follower/following rows may only carry a username: look up the user id
    if (!target.id && target.username) {
      try {
        const res = await api.get(`/api/users/${target.username}`);
        console.log("user lookup:", res.data);
        target = { ...target, id: findUserId(res.data, target.username) };
      } catch (err) {
        console.error("user lookup failed:", err.response?.status, err.response?.data);
        setError(errText(err, "Could not find that user."));
        return;
      }
    }
    if (!target.id) {
      setError("Could not get this user's id from the API.");
      return;
    }
    const existing = conversations.find(
      (c) => c.type === "direct" && directPartnerId(c) === target.id,
    );
    if (existing) return openConversation(existing.id);
    setActiveId(null);
    setRecipient(target);
    setError("");
    clearToParam();
  };

  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
  };

  const handleSendMessage = async () => {
    const text = messageText.trim();
    if ((!text && !files.length) || sending || !chatOpen) return;

    setSending(true);
    setError("");
    try {
      const sent = await sendMessageApi({
        content: text || "Sent an attachment",
        conversationId: activeId,
        recipientId: activeId ? undefined : recipient?.id,
        files,
      });
      const mine = { ...sent, isOwn: true, time: sent.time || formatTime(new Date()) };
      const convId = activeId || mine.conversationId;

      if (convId) {
        setMessagesByConv((p) => ({ ...p, [convId]: mergeMessages(p[convId], [mine]) }));
      }

      if (!activeId) {
        const list = await loadConversations();
        const found =
          convId ||
          list.find((c) => c.type === "direct" && directPartnerId(c) === recipient?.id)?.id ||
          list[0]?.id;
        if (found) setActiveId(String(found));
        setRecipient(null);
        clearToParam();
      } else {
        setConversations((prev) => {
          const target = prev.find((c) => c.id === activeId);
          if (!target) return prev;
          return [
            { ...target, preview: `You: ${text || "Sent an attachment"}`, time: "Now" },
            ...prev.filter((c) => c.id !== activeId),
          ];
        });
      }
      setMessageText("");
      setFiles([]);
    } catch (err) {
      console.error("send failed:", err.response?.status, err.response?.data);
      setError(errText(err, "Message was not sent. Try again."));
    } finally {
      setSending(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name.trim() || groupSaving) return;
    setGroupSaving(true);
    setError("");
    try {
      const created = await createConversationApi({
        type: groupForm.type,
        name: groupForm.name.trim(),
        join_policy: groupForm.join_policy,
      });
      await loadConversations();
      if (created?.id) {
        setSection("Chats");
        openConversation(created.id);
      }
      setGroupOpen(false);
      setGroupForm({ name: "", type: "Group", join_policy: "Open" });
    } catch (err) {
      console.error("create conversation failed:", err.response?.status, err.response?.data);
      setError(errText(err, "Could not create the conversation."));
    } finally {
      setGroupSaving(false);
    }
  };

  /* ---------- derived lists ---------- */
  const q = search.trim().toLowerCase();
  const visibleConversations = conversations.filter((c) => {
    const typeOk = !CHAT_FILTERS[chatFilter] || c.type === CHAT_FILTERS[chatFilter];
    return typeOk && (!q || c.name.toLowerCase().includes(q));
  });
  const visiblePeople = peopleSource.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q),
  );

  const headerName = recipient ? recipient.name : activeConversation?.name || "";
  const headerAvatar = recipient ? recipient.avatar : activeConversation?.avatar;

  // the conversation's `partner` has no username, so match it against the user list
  const partnerRaw = !isGroupChat ? activeConversation?.raw?.partner : null;
  const resolvedUsername =
    directory.find((u) => partnerRaw?.id && String(u.id) === String(partnerRaw.id))?.username ||
    directory.find(
      (u) => u.name && partnerRaw?.name && u.name.toLowerCase() === partnerRaw.name.toLowerCase(),
    )?.username ||
    "";
  const profileUsername =
    recipient?.username || (!isGroupChat && activeConversation?.username) || resolvedUsername;
  const profilePath = profileUsername
    ? profileUsername === me?.username
      ? "/profile"
      : `/profile/${profileUsername}`
    : null;

  const headerBody = (
    <>
                <Avatar
                  src={headerAvatar}
                  name={headerName}
                  group={isGroupChat}
                  size={40}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold truncate group-hover:underline">{headerName}</h2>
                  <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        socketOn ? "bg-emerald-500" : "bg-amber-400"
                      }`}
                    />
                    {typing && typing.conversationId === activeId
                      ? `${typing.name || "Someone"} is typing...`
                      : activeConversation?.members != null
                      ? `${activeConversation.members} members`
                      : socketOn
                        ? "Live"
                        : "Reconnecting..."}
                  </p>
                </div>
    </>
  );

  /* ---------- render ---------- */
  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-8rem)] min-h-[520px] bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden font-sans text-[#1C1917]">
        {/* ---------------- left: chats / people ---------------- */}
        <aside
          className={`${chatOpen ? "hidden" : "flex"} md:flex w-full md:w-80 lg:w-96 shrink-0 flex-col border-r border-stone-200/80 bg-[#FAF7F4]`}
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <button
              type="button"
              aria-label="New group"
              title="New group or project chat"
              onClick={() => setGroupOpen(true)}
              className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-[#A04622] cursor-pointer"
            >
              <SquarePen size={17} />
            </button>
          </div>

          {/* Chats | People */}
          <div className="mx-4 mt-3 p-1 grid grid-cols-2 gap-1 bg-stone-200/50 rounded-xl text-sm font-medium">
            {["Chats", "People"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSection(s);
                  setSearch("");
                }}
                className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                  section === s ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-stone-200 text-stone-400 focus-within:border-[#A04622]">
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={section === "Chats" ? "Search conversations..." : "Search people..."}
              className="flex-1 min-w-0 bg-transparent text-sm text-stone-800 placeholder-stone-400 outline-none"
            />
          </div>

          <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto">
            {section === "Chats"
              ? Object.keys(CHAT_FILTERS).map((f) => (
                  <Chip key={f} active={chatFilter === f} onClick={() => setChatFilter(f)}>
                    {f}
                  </Chip>
                ))
              : PEOPLE_FILTERS.map((f) => (
                  <Chip key={f} active={peopleFilter === f} onClick={() => setPeopleFilter(f)}>
                    {f}
                  </Chip>
                ))}
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {section === "Chats" ? (
              loadingList ? (
                <p className="p-4 text-sm text-stone-400">Loading conversations...</p>
              ) : visibleConversations.length === 0 ? (
                <EmptyBox
                  icon={MessageCircle}
                  title="No conversations yet"
                  text="Open the People tab to message someone you follow, or start a group with the pen button."
                />
              ) : (
                visibleConversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openConversation(c.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      c.id === activeId ? "bg-[#F1E4DC]" : "hover:bg-white"
                    }`}
                  >
                    <Avatar src={c.avatar} name={c.name} group={c.type !== "direct"} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold truncate">{c.name}</span>
                        <span className="text-[11px] text-stone-400 shrink-0">{c.time}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-stone-500 truncate">
                          {c.raw?.last_message?.sender_id &&
                          String(c.raw.last_message.sender_id) === myId
                            ? "You: "
                            : ""}
                          {c.preview || "No messages yet"}
                        </span>
                        {c.unread > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#A04622] text-white text-[10px] font-semibold flex items-center justify-center">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )
            ) : peopleLoading ? (
              <p className="p-4 text-sm text-stone-400">Loading people...</p>
            ) : peopleError && visiblePeople.length === 0 ? (
              <EmptyBox icon={Users} title="Could not load people" text={peopleError} />
            ) : visiblePeople.length === 0 ? (
              <EmptyBox
                icon={Users}
                title={
                  peopleFilter === "Everyone"
                    ? "No other builders found"
                    : peopleFilter === "Friends"
                    ? "No friends yet"
                    : peopleFilter === "Following"
                      ? "You are not following anyone yet"
                      : "No followers yet"
                }
                text={
                  peopleFilter === "Friends"
                    ? "Friends are people you follow who follow you back."
                    : "Follow builders from Discover to message them here."
                }
              />
            ) : (
              visiblePeople.map((p) => (
                <div
                  key={pkey(p)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white"
                >
                  <Avatar src={p.avatar} name={p.name} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-stone-500 truncate">
                      {p.username ? `@${p.username}` : ""}
                      {followingIds.has(pkey(p)) && followerIds.has(pkey(p)) ? " · Friends" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startChatWith(p)}
                    className="px-3 py-1.5 rounded-lg bg-[#A04622] hover:bg-[#8A3A1B] text-white text-xs font-medium cursor-pointer"
                  >
                    Message
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ---------------- right: conversation ---------------- */}
        <main className={`${chatOpen ? "flex" : "hidden"} md:flex flex-1 min-w-0 flex-col bg-white`}>
          {!chatOpen ? (
            <div className="h-full flex flex-col">
              {error && (
                <div className="m-4 px-3 py-2 rounded-xl text-xs bg-red-50 text-red-700 border border-red-200/60 flex justify-between gap-2">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError("")} aria-label="Dismiss">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <EmptyBox
                  icon={MessageCircle}
                  title="Your messages"
                  text="Pick a conversation, or open the People tab to message a friend."
                />
              </div>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-200/80">
                <button
                  type="button"
                  onClick={closeChat}
                  aria-label="Back"
                  className="md:hidden p-1.5 -ml-1 rounded-lg text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>
                {profilePath ? (
                  <Link
                    to={profilePath}
                    title="View profile"
                    className="flex items-center gap-3 min-w-0 flex-1 group"
                  >
                    {headerBody}
                  </Link>
                ) : (
                  isGroupChat ? (
                    <button
                      type="button"
                      onClick={() => setInfoOpen(true)}
                      title="Group info"
                      className="flex items-center gap-3 min-w-0 flex-1 group text-left cursor-pointer"
                    >
                      {headerBody}
                      <Info size={16} className="text-stone-400 shrink-0" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 min-w-0 flex-1">{headerBody}</div>
                  )
                )}
                {requests.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setReqOpen((v) => !v)}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-[#A04622] text-white text-xs font-semibold cursor-pointer"
                  >
                    Requests ({requests.length})
                  </button>
                )}
              </header>

              {reqOpen && requests.length > 0 && (
                <div className="border-b border-stone-200/80 bg-[#FAF7F4] px-4 py-3 space-y-2 max-h-56 overflow-y-auto">
                  <p className="text-xs font-semibold text-stone-500">Pending join requests</p>
                  {requests.map((r, i) => {
                    const p = toPerson(r.applicant || r.user || r);
                    return (
                      <div key={r.id || r.applicant_id || i} className="flex items-center gap-3">
                        <Avatar src={p.avatar} name={p.name} size={32} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name || "Someone"}</p>
                          {p.username && <p className="text-[11px] text-stone-500">@{p.username}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => reviewRequest(r, "approve")}
                          className="px-3 py-1 rounded-lg bg-[#A04622] text-white text-xs font-medium cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewRequest(r, "reject")}
                          className="px-3 py-1 rounded-lg border border-stone-300 text-stone-600 text-xs font-medium cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-[#FCFBF9]">
                {error && (
                  <div className="mb-2 px-3 py-2 rounded-xl text-xs bg-red-50 text-red-700 border border-red-200/60 flex justify-between gap-2">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError("")} aria-label="Dismiss">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {activeId && hasMore[activeId] && (
                  <div className="text-center pb-2">
                    <button
                      type="button"
                      onClick={loadEarlier}
                      className="text-xs text-[#A04622] hover:underline cursor-pointer"
                    >
                      Load earlier messages
                    </button>
                  </div>
                )}

                {loadingMsgs && messages.length === 0 && (
                  <div className="flex justify-center py-6 text-stone-400">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                )}

                {recipient && (
                  <div className="text-center text-xs text-stone-400 py-6">
                    This is the start of your conversation with{" "}
                    <strong className="text-stone-600">{recipient.name}</strong>. Say hello 👋
                  </div>
                )}

                {!loadingMsgs && activeId && messages.length === 0 && (
                  <div className="text-center text-xs text-stone-400 py-6">
                    No messages yet. Say hello 👋
                  </div>
                )}

                {messages.map((m, i) => {
                  const isOwn = m.isOwn ?? (myId && m.senderId === myId);
                  const label = dayLabel(m.createdAt);
                  const prevLabel = i > 0 ? dayLabel(messages[i - 1].createdAt) : null;
                  const sameSender =
                    i > 0 && messages[i - 1].senderId === m.senderId && label === prevLabel;

                  return (
                    <div key={m.id}>
                      {label && label !== prevLabel && (
                        <div className="flex justify-center my-3">
                          <span className="text-[10px] uppercase tracking-wide text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full">
                            {label}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"} ${
                          sameSender ? "mt-0.5" : "mt-3"
                        }`}
                      >
                        {!isOwn && (
                          <div className="w-7 shrink-0">
                            {!sameSender &&
                              (m.senderUsername ? (
                                <Link to={`/profile/${m.senderUsername}`} title={m.sender}>
                                  <Avatar src={m.avatar} name={m.sender} size={28} />
                                </Link>
                              ) : (
                                <Avatar src={m.avatar} name={m.sender} size={28} />
                              ))}
                          </div>
                        )}
                        <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                          {!isOwn && isGroupChat && !sameSender && (
                            <span className="text-[11px] font-medium text-stone-500 mb-0.5 ml-1">
                              {m.sender}
                            </span>
                          )}
                          <div
                            className={`px-3.5 py-2 text-sm leading-relaxed break-words rounded-2xl ${
                              isOwn
                                ? "bg-[#A04622] text-white rounded-br-md"
                                : "bg-white text-stone-800 border border-stone-200/80 rounded-bl-md"
                            }`}
                          >
                            {m.text}
                            {m.attachments.map((f, idx) => (
                              <a
                                key={`${m.id}-${idx}`}
                                href={f.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`mt-1.5 flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5 ${
                                  isOwn ? "bg-white/15" : "bg-stone-100"
                                }`}
                              >
                                <Download size={14} className="shrink-0" />
                                <span className="truncate">{f.name}</span>
                              </a>
                            ))}
                          </div>
                          <span className="text-[10px] text-stone-400 mt-0.5 mx-1">{m.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="px-4 py-3 border-t border-stone-200/80 bg-white">
                {files.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-2">
                    {files.map((f, i) => (
                      <span
                        key={`${f.name}-${i}`}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#F5F0EB] text-stone-700"
                      >
                        <span className="max-w-32 truncate">{f.name}</span>
                        <button
                          type="button"
                          aria-label="Remove file"
                          onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 px-2 py-1.5 bg-[#F7F4F0] rounded-2xl border border-stone-200/60 focus-within:border-[#A04622]">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFilePick}
                    className="hidden"
                  />
                  <button
                    type="button"
                    aria-label="Attach file"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-stone-500 hover:text-[#A04622] cursor-pointer"
                  >
                    <Paperclip size={18} />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                      notifyTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Message ${headerName || ""}...`}
                    className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder-stone-400"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={sending || (!messageText.trim() && !files.length)}
                    aria-label="Send"
                    className="w-9 h-9 rounded-full bg-[#A04622] hover:bg-[#8A3A1B] text-white flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ---------------- new group modal ---------------- */}
      {infoOpen && activeConversation && isGroupChat && (() => {
        const raw = activeConversation.raw || {};
        const code =
          raw.invite_code || raw.inviteCode || raw.join_code || raw.code || raw.invite?.code || "";
        const policy = String(raw.join_policy || raw.joinPolicy || "").toLowerCase();
        const roleOf = (m) => String(m?.role || m?.member_role || m?.membership?.role || "").toLowerCase();
        const rank = { owner: 0, admin: 1 };
        const members = (Array.isArray(raw.members) ? raw.members : [])
          .slice()
          .sort((a, b) => (rank[roleOf(a)] ?? 2) - (rank[roleOf(b)] ?? 2));
        const mine = members.find((m) => {
          const p = toPerson(m.user || m);
          return p.id === myId || (me?.username && p.username === me.username);
        });
        const myRole = roleOf(mine);
        // the server only returns requests to people allowed to review them
        const canApprove = myRole === "owner" || myRole === "admin" || requests.length > 0;
        const copy = async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 1800);
          } catch {}
        };
        return createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
            onClick={() => setInfoOpen(false)}
          >
            <div
              className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-white rounded-2xl p-5 space-y-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={activeConversation.avatar} name={activeConversation.name} group size={48} />
                  <div className="min-w-0">
                    <h3 className="font-bold text-base truncate">{activeConversation.name}</h3>
                    <p className="text-xs text-stone-500 capitalize">
                      {activeConversation.type} chat
                      {activeConversation.members != null ? ` · ${activeConversation.members} members` : ""}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => setInfoOpen(false)} aria-label="Close" className="text-stone-500 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="rounded-xl bg-[#FAF7F4] border border-stone-200/80 p-3 space-y-2">
                <p className="text-xs font-semibold text-stone-500">How people join</p>
                <p className="text-sm text-stone-700">
                  {policy.includes("approval") || policy === "required"
                    ? "Approval required. People join with the invite code, then the owner approves them."
                    : "Open. Anyone with the invite code joins straight away."}
                </p>
                {code ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm">{code}</code>
                    <button
                      type="button"
                      onClick={copy}
                      className="px-3 py-2 rounded-lg bg-[#A04622] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {codeCopied ? <Check size={14} /> : <Copy size={14} />}
                      {codeCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700">
                    The server did not send an invite code for this group. Ask the backend to return
                    <code className="mx-1">invite_code</code> in the conversation object.
                  </p>
                )}
                <p className="text-[11px] text-stone-500">
                  Share the code. They paste it under "Have an invite code?" in New conversation.
                </p>
              </div>

              {canApprove && requests.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-stone-500">Pending join requests ({requests.length})</p>
                  {requests.map((r, i) => {
                    const p = toPerson(r.applicant || r.user || r);
                    return (
                      <div key={r.id || r.applicant_id || i} className="flex items-center gap-3">
                        <Avatar src={p.avatar} name={p.name} size={32} />
                        <p className="flex-1 min-w-0 text-sm font-medium truncate">{p.name || "Someone"}</p>
                        <button type="button" onClick={() => reviewRequest(r, "approve")} className="px-3 py-1 rounded-lg bg-[#A04622] text-white text-xs font-medium cursor-pointer">Approve</button>
                        <button type="button" onClick={() => reviewRequest(r, "reject")} className="px-3 py-1 rounded-lg border border-stone-300 text-stone-600 text-xs font-medium cursor-pointer">Reject</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {members.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-stone-500">Members ({members.length})</p>
                  {members.map((m, i) => {
                    const p = toPerson(m.user || m);
                    return (
                      <div key={m.id || p.id || i} className="flex items-center gap-3">
                        <Avatar src={p.avatar} name={p.name} size={32} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {p.name || "Member"}
                            {(p.id === myId || (me?.username && p.username === me.username)) && (
                              <span className="text-stone-400 font-normal"> (you)</span>
                            )}
                          </p>
                          {p.username && <p className="text-[11px] text-stone-500">@{p.username}</p>}
                        </div>
                        {roleOf(m) && roleOf(m) !== "member" && (
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                              roleOf(m) === "owner"
                                ? "bg-[#A04622] text-white"
                                : "bg-stone-100 text-stone-700 border border-stone-200"
                            }`}
                          >
                            {roleOf(m)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>,
          document.body,
        );
      })()}

      {groupOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setGroupOpen(false)}
        >
          <form
            onSubmit={handleCreateGroup}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 w-full max-w-md space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">New conversation</h2>
              <button type="button" onClick={() => setGroupOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Group name"
              value={groupForm.name}
              onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 outline-none focus:border-[#A04622]"
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={groupForm.type}
                onChange={(e) => setGroupForm((f) => ({ ...f, type: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-stone-200 outline-none"
              >
                <option value="Group">Group</option>
                <option value="Project">Project</option>
              </select>
              <select
                value={groupForm.join_policy}
                onChange={(e) => setGroupForm((f) => ({ ...f, join_policy: e.target.value }))}
                className="px-3 py-2 text-sm rounded-xl border border-stone-200 outline-none"
              >
                <option value="Open">Anyone can join</option>
                <option value="Required">Approval required</option>
              </select>
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-2">
              <p className="text-xs font-semibold text-stone-500">Have an invite code?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Paste invite code"
                  className="flex-1 min-w-0 px-3 py-2 text-sm rounded-xl border border-stone-200 outline-none focus:border-[#A04622]"
                />
                <button
                  type="button"
                  onClick={handleJoinByCode}
                  disabled={!joinCode.trim()}
                  className="px-4 py-2 text-sm rounded-xl border border-stone-300 text-stone-700 font-medium disabled:opacity-50 cursor-pointer"
                >
                  Join
                </button>
              </div>
              {joinMsg && <p className="text-xs text-stone-500">{joinMsg}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setGroupOpen(false)}
                className="px-4 py-2 text-sm rounded-xl text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={groupSaving || !groupForm.name.trim()}
                className="px-4 py-2 text-sm rounded-xl bg-[#A04622] hover:bg-[#8A3A1B] text-white font-medium disabled:opacity-50 cursor-pointer"
              >
                {groupSaving ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </MainLayout>
  );
}

export default Messages;