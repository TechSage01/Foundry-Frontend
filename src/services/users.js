import api from "./api";

const unwrap = (res) => res.data?.data || res.data?.user || res.data;

const toList = (res, ...keys) => {
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
  for (const k of [...keys, "results", "rows", "data"]) {
    if (Array.isArray(raw?.[k])) return raw[k];
  }
  // last resort: the first array anywhere directly inside the response
  if (raw && typeof raw === "object") {
    const found = Object.values(raw).find(Array.isArray);
    if (found) return found;
  }
  return [];
};

// public profile of any user
export const fetchUserApi = async (username) => {
  const res = await api.get(`/api/users/${username}`);
  return unwrap(res);
};

// follow / unfollow by username
export const followUserApi = async (username, shouldFollow) => {
  const res = shouldFollow
    ? await api.post(`/api/users/${username}/follow`)
    : await api.delete(`/api/users/${username}/follow`);
  return res.data?.data || res.data;
};

export const fetchUserProjectsApi = async (username) =>
  toList(await api.get(`/api/projects/user/${username}`), "projects", "items");

export const fetchUserExperiencesApi = async (username) =>
  toList(
    await api.get(`/api/experiences/user/${username}`),
    "experiences",
    "items",
  );

// all published posts by a user
export const fetchUserPostsApi = async (username) =>
  toList(await api.get(`/api/posts/user/${username}`), "posts", "items");