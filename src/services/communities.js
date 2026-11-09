import api from './api'
const readList = (res, ...keys) => {
    const body = res?.data || {};
    const d = body?.data || {};
    let items = [];
    if(Array.isArray(d)) items = d;
    else {
        for ( const k of [ ...keys, "items", "results", "rows" ] ) {
            if(Array.isArray(d?.[k])) { items = d[k]; break; }
            if(Array.isArray(body?.[k])) { items = body[k]; break; }
        }
    }
    const p = body?.pagination || body?.meta || d?.pagination || d?.meta || null || {};
    return {
        items,
        totalPages: p?.totalPages ?? p?.total_pages ?? null,
        total: p?.total ?? p?.count ?? null,
    };
};
const readOne = (res, ...keys) => {
  const body = res?.data ?? {};
  const d = body?.data ?? body;
  for (const k of keys) if (d?.[k] && typeof d[k] === "object") return d[k];
  return d;
};
export const fetchCommunities = async({ page = 1, limit = 12, category, search } = {}) => {
    const params = { page, limit };
    if (category) params.category = category;
    if(search) params.search = search;
   return readList(await api.get("/api/communities", { params }), "communities");
}
export const fetchMyCommunities = async() => 
    readList(await api.get("/api/communities/me", { params: { page, limit } 
    }), "communities");
export const fetchCommunityBySlug = async (slug) =>
  readOne(await api.get(`/api/communities/${slug}`), "community");
export const fetchCommunityMembers = async(slug) => {
     readList(await api.get(`/api/communities/${slug}/members`), "members").items;
}
export const createCommunityApi = async ({ title, name, description, category }) => {
  const payload = {name: name || title, description, category };
  console.log("POST /api/communities payload:", payload);
  const res = await api.post("/api/communities", payload);
  return readOne(res, "community");
};
export const joinCommunityApi = async (id) => api.post(`/api/communities/${id}/join`);
export const leaveCommunityApi = async (id) => api.post(`/api/communities/${id}/leave`);
 
// GET /api/communities/{id}/posts
export const fetchCommunityPosts = async (id, { page = 1, limit = 12 } = {}) =>
  readList(await api.get(`/api/communities/${id}/posts`, { params: { page, limit } }), "posts");
 
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

export const fetchPostsComments = async (id, postId) => {
  readList(await api.get(`/api/communities/${id}/posts/${postId}/comments`), "comments").items;
}
export const createPostsCommentApi = async(id, postId, { content, parent_id = null }) => {
  readList(await api.get(`/api/communities/${id}/posts/postId/comments`), {
    parent_id,
    content,
  });
  return readOne(res, "comment");
}