import api from "./api";

// Accepts many response shapes and always returns { items, totalPages, total }
const readList = (res, ...keys) => {
  const body = res?.data ?? {};
  const d = body?.data ?? body;
  let items = [];
  if (Array.isArray(d)) items = d;
  else {
    for (const k of [...keys, "items", "results", "rows"]) {
      if (Array.isArray(d?.[k])) { items = d[k]; break; }
      if (Array.isArray(body?.[k])) { items = body[k]; break; }
    }
  }
  const p = body?.pagination || body?.meta || d?.pagination || d?.meta || {};
  return {
    items,
    totalPages: p.total_pages ?? p.totalPages ?? null,
    total: p.total ?? p.total_items ?? null,
  };
};

const readOne = (res, ...keys) => {
  const body = res?.data ?? {};
  const d = body?.data ?? body;
  for (const k of keys) if (d?.[k] && typeof d[k] === "object") return d[k];
  return d;
};

// GET /api/communities?page&limit&category&search
export const fetchCommunities = async ({ page = 1, limit = 12, category, search } = {}) => {
  const params = { page, limit };
  if (category) params.category = category;
  if (search) params.search = search;
  return readList(await api.get("/api/communities", { params }), "communities");
};

// GET /api/communities/me
export const fetchMyCommunities = async ({ page = 1, limit = 12 } = {}) =>
  readList(await api.get("/api/communities/me", { params: { page, limit } }), "communities");

// GET /api/communities/{slug}
export const fetchCommunityBySlug = async (slug) =>
  readOne(await api.get(`/api/communities/${slug}`), "community");

// GET /api/communities/{slug}/members
export const fetchCommunityMembers = async (slug) =>
  readList(await api.get(`/api/communities/${slug}/members`), "members").items;

// POST /api/communities  — the server validates `name` (not `title`)
export const createCommunityApi = async ({ title, name, description, category }) => {
  const payload = { name: name || title, description, category };
  console.log("POST /api/communities payload:", payload);
  const res = await api.post("/api/communities", payload);
  return readOne(res, "community");
};

export const joinCommunityApi = async (id) => api.post(`/api/communities/${id}/join`);
export const leaveCommunityApi = async (id) => api.post(`/api/communities/${id}/leave`);

// GET /api/communities/{id}/posts
export const fetchCommunityPosts = async (id, { page = 1, limit = 12 } = {}) =>
  readList(await api.get(`/api/communities/${id}/posts`, { params: { page, limit } }), "posts");

// POST /api/communities/{id}/posts  (multipart/form-data)
export const createCommunityPostApi = async (id, { title, subtitle, content }) => {
  const fd = new FormData();
  fd.append("title", title);
  if (subtitle) fd.append("subtitle", subtitle);
  fd.append("content", content);
  const res = await api.post(`/api/communities/${id}/posts`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return readOne(res, "post");
};

// GET /api/communities/{id}/posts/{postId}/comments
export const fetchPostComments = async (id, postId) =>
  readList(await api.get(`/api/communities/${id}/posts/${postId}/comments`), "comments").items;

// POST /api/communities/{id}/posts/{postId}/comments  { parent_id, content }
export const createPostCommentApi = async (id, postId, { content, parent_id = null }) => {
  const res = await api.post(`/api/communities/${id}/posts/${postId}/comments`, {
    parent_id,
    content,
  });
  return readOne(res, "comment");
};

// Aliases: same functions under the names the other branch used,
// so either spelling works anywhere in the app.
export const fetchPostsComments = fetchPostComments;
export const createPostsCommentApi = createPostCommentApi;