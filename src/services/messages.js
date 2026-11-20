import api from "./api";
import { AvatarFallback, getUserAvatar, getUserName } from "../utils/Avatar";

// ---- helpers -------------------------------------------------------------

const unwrap = (res) => res?.data?.data ?? res?.data;

const listOf = (body, ...keys) => {
  if (Array.isArray(body)) return body;
  for (const k of keys) if (Array.isArray(body?.[k])) return body[k];
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
};

export const formatTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

// ---- normalizers (tolerant: the backend may use snake_case or camelCase) ---

export const normalizeConversation = (c = {}) => {
  const last = c.last_message || c.lastMessage || {};
  // the API sends the other person of a direct chat as `partner`
  const other =
    c.partner || c.other_user || c.otherUser || c.recipient || c.participant || null;
  const type = String(c.type || "direct").toLowerCase();
  const name = c.name || c.title || c.group_name || c.conversation_name || (other ? getUserName(other) : "Conversation");
  const lastText =
    last.content ||
    last.text ||
    (last.has_attachments || (Array.isArray(last.files) && last.files.length)
      ? "Sent an attachment"
      : "") ||
    c.preview ||
    "";

  return {
    id: String(c.id || c._id),
    type,
    name,
    shortName: initials(name),
    avatar: c.avatar_url || c.image_url || (other ? getUserAvatar(other) : null),
    preview: lastText,
    time: formatTime(
      last.created_at || last.createdAt || c.last_message_at || c.updated_at || c.updatedAt,
    ),
    unread: c.unread_count ?? c.unreadCount ?? 0,
    members:
      c.members_count ??
      c.member_count ??
      (Array.isArray(c.members) ? c.members.length : undefined),
    raw: c,
  };
};

export const normalizeMessage = (m = {}) => {
  const sender = m.sender || m.user || m.author || {};
  const senderName =
    getUserName(sender) !== "Builder"
      ? getUserName(sender)
      : m.sender_name || m.author_name || m.username || "Builder";
  const created = m.created_at || m.createdAt || m.timestamp || null;
  const files = m.files || m.attachments || m.media || [];

  return {
    id: String(m.id || m._id || `${created}-${m.content}`),
    conversationId: String(m.conversation_id || m.conversationId || ""),
    senderId: String(
      m.sender_id || m.senderId || m.user_id || sender.id || sender._id || "",
    ),
    isOwn: m.is_own ?? m.isOwn ?? m.mine ?? undefined,
    sender: senderName,
    avatar:
      getUserAvatar(sender) ||
      m.sender_avatar_url ||
      m.author_avatar_url ||
      AvatarFallback(senderName),
    text: m.content ?? m.text ?? "",
    createdAt: created,
    time: formatTime(created),
    attachments: (Array.isArray(files) ? files : []).map((f) =>
      typeof f === "string"
        ? { name: f.split("/").pop(), url: f }
        : {
            name: f.name || f.filename || f.original_name || "Attachment",
            url: f.url || f.file_url || f.path,
            size: f.size,
            type: f.type || f.mime_type,
          },
    ),
  };
};

// merge + dedupe by id, oldest first
export const mergeMessages = (existing = [], incoming = []) => {
  const map = new Map();
  [...existing, ...incoming].forEach((m) => map.set(m.id, { ...map.get(m.id), ...m }));
  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  );
};

// ---- API -----------------------------------------------------------------

export const fetchConversationsApi = async (type) => {
  const res = await api.get("/api/conversations", {
    params: type ? { type } : undefined,
  });
  return listOf(unwrap(res), "conversations").map(normalizeConversation);
};

export const fetchMessagesApi = async (conversationId, { limit = 30, cursor } = {}) => {
  const res = await api.get(`/api/conversations/${conversationId}/messages`, {
    params: { limit, ...(cursor ? { cursor } : {}) },
  });
  const items = listOf(unwrap(res), "messages").map(normalizeMessage);
  const page = res?.data?.pagination || {};
  return {
    items: mergeMessages([], items),
    hasMore: page.has_more ?? items.length >= limit,
    nextCursor: page.next_cursor ?? null,
  };
};

// NOTE: the backend field really is spelled `recipent_id`
export const sendMessageApi = async ({ content, conversationId, recipientId, files = [] }) => {
  const form = new FormData();
  form.append("content", content);
  if (conversationId) form.append("conversation_id", conversationId);
  else if (recipientId) form.append("recipent_id", recipientId);
  files.forEach((f) => form.append("files", f));

  const res = await api.post("/api/conversations/messages", form);
  const body = unwrap(res);
  return normalizeMessage(body?.message || body);
};

const POLICY_MAP = { open: "open", required: "approval_required", approval_required: "approval_required" };

export const createConversationApi = async ({ type = "group", name, join_policy = "open" }) => {
  const policy = POLICY_MAP[String(join_policy).toLowerCase()] || String(join_policy).toLowerCase();
  const res = await api.post(
    "/api/conversations",
    { type: String(type).toLowerCase(), name, join_policy: policy },
    { headers: { "Content-Type": "application/json" } },
  );
  const body = unwrap(res);
  const conv = normalizeConversation(body?.conversation || body);
  // the create response may not echo the name back, so keep what the user typed
  if (!conv.name || conv.name === "Conversation") {
    conv.name = name;
    conv.shortName = initials(name);
  }
  return conv;
};

export const markConversationReadApi = (conversationId) =>
  api.patch(`/api/conversations/${conversationId}/read`).then((res) => unwrap(res));

export const joinConversationApi = (code) =>
  api.post(`/api/conversations/join/${encodeURIComponent(code)}`).then((res) =>
    normalizeConversation(unwrap(res)?.conversation || unwrap(res)),
  );

export const fetchJoinRequestsApi = async (conversationId) => {
  const res = await api.get(`/api/conversations/${conversationId}/requests`);
  return listOf(unwrap(res), "requests", "applicants", "items");
};

export const reviewJoinRequestApi = (conversationId, applicantId, action) =>
  api.patch(`/api/conversations/${conversationId}/requests/${applicantId}`, {
    action, // "approve" | "reject"
  });