import api from './api'

export const fetchCommunities = async () => {
    const res = await api.get("/api/communities");
    const data = res.data?.data || res.data?.communities || res.data;
    return Array.isArray(data) ? data : [];
}
export const fetchMyCommunities = async () => {
    const res = await api.get("/api/communities/me");
    const data = res.data?.data || res.data?.communities || res.data;
    return Array.isArray(data) ? data : [];
}
export const fetchCommunityBySlug = async (slug) => {
    const res = await api.get(`/api/communities/${slug}`);
    return res.data?.data || res.data?.community || res.data
}
export const createCommunityApi = async (formData) =>  {
    const res = await api.post("/api/communities", formData, {
        headers: formData instanceof FormData
            ? { "Content-Type": "multipart/form-data"}
            : undefined,
    });
    return res.data?.data || res.data?.community || res.data
}
export const joinCommunityApi = async (id) => {
    const res = await api.post(`/api/communities/${id}/join`)
    return res.data;
}
export const leaveCommunityApi = async (id) => {
    const res = await api.post(`/api/communities/${id}/leave`);
    return res.data;
}
export const fetchCommunityPosts  = async () => {
    const res = await api.get(`/api/communities/${id}/posts`)
    const data = res.data?.data || res.data?.posts || res.data;
    return Array.isArray(data) ? data : [];
}
export const createCommunityPostApi = async (id) => {
    const res = await api.post(`/api/communities/${id}/post`, formData, {
      headers: formData instanceof FormData
            ? { "Content-Type": "multipart/form-data"}
            : undefined,  
    })
    return res.data?.data || res.data
}