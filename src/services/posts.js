const API_BASE_URL = import.meta.env.VITE_API_URL || "https://foundry-00kt.onrender.com/api";
import api from "./api";
export const fetchPost = async (activeTab, sortBy, selectedTopic) => {
  const params = new URLSearchParams({
    tab: activeTab,
    sort: sortBy,
    ...(selectedTopic && { topic: selectedTopic.replace("#", "") }),
  });
  const res = await fetch(`${API_BASE_URL}/api/posts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

export const fetchPosts = async ({ mine = false, drafts = false} = {}) => {
  const path = drafts? "api/posts/me/drafts" : mine ? "api/posts/me" : "api/posts";
  const res = await api.get(path);
  const data = res.data?.data || res.data?.posts || res.data;
  return Array.isArray(data) ? data : [];
};
export const fetchPostsBySlug = async (slug) => {
  const res = await api.get(`/api/posts/${slug}`);
  return res.data?.data || res.data?.post || res.data;
}
export const createPostApi = async (formData) => {
  const res = await api.post(`/api/posts`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    // body: JSON.stringify(postData),
  });
  return res.data?.data || res.data?.post || res.data;
  // if (!res.ok) throw new Error("Failed to create post");
  // return res.json();
};
export const updatePostApi = async (id, postData) => {
  const res = await api.put(`/api/posts/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data || res.data?.post || res.data;
}

export const deletePostApi = async (id) => {
  await api.delete(`/api/posts/${id}`);
};

export const toggleLikeApi = async (postId) => {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, { method: "POST" });
  return res.json();
};

export const addCommentApi = async (postId, text) => {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.json();
};

export const toggleBookmarkApi = async (postId) => {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/bookmark`, { method: "POST" });
  return res.json();
};

export const toggleRepostApi = async (postId) => {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/repost`, { method: "POST" });
  return res.json();
};