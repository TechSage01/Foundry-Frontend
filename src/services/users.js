import api from './api';
const unwrap = (res)  => res.data?.data || res.data?.users || res.data;

const toList = (res, ...keys) => {
  const raw = res.data?.data ?? res.data;
  if (Array.isArray(raw)) return raw;
    for (const k of keys) if (Array.isArray(raw?.[k])) return raw[k];
    return [];
}
export const fetchUserApi = async (username) => {
  const res = await api.get(`/api/users/${username}`);
  return unwrap(res);
}

export const followUserApi = async (username, shouldFollow) => {
  const res = shouldFollow
    ? await api.post(`/api/users/${username}/follow`)
    : await api.delete(`/api/users/${username}/follow`);
    return res.data?.data || res.data?.user || res.data;
}
export const fetchUserProjectsApi = async (username) => {
  toList(await api.get(`/api/projects/user/${username}`), "projects", "items");
}
export const fetchUserExperiencesApi = async (username) => {
   toList(
    await api.get(`/api/experiences/user/${username}`),
    "experiences",
    "items",
  );
}

export const fetchUserPostsApi = async (username) => {
  toList(await api.get(`/api/posts/user/${username}`), "posts", "items");
};