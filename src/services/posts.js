const API_BASE_URL = import.meta.env.VITE_API_URL || "https://foundry-00kt.onrender.com/api";

export const fetchPosts = async (activeTab, sortBy, selectedTopic) => {
  const params = new URLSearchParams({
    tab: activeTab,
    sort: sortBy,
    ...(selectedTopic && { topic: selectedTopic.replace("#", "") }),
  });
  const res = await fetch(`${API_BASE_URL}/api/posts?${params}`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

export const createPostApi = async (postData) => {
  const res = await fetch(`${API_BASE_URL}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
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