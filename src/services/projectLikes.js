import api from "./api";

const unwrap = (res) => res.data?.data ?? res.data ?? {};

export const readLike = (data) => {
    const d = data && typeof data === "object" ? data : {};
    const liked = d.liked ?? d.is_liked ??  d.isLiked ?? d.liked_by_me ?? d.has_liked;
    const count = d.likes_count ?? d.like_count ?? d.count ?? d.likes ?? d.total;
    return {
    liked: typeof liked === "boolean" ? liked : undefined,
    count: Number.isFinite(Number(count)) && count !== null && count !== "" ? Number(count) : undefined,
  };

}
export const likeStateOf = (p) => {
  const r = readLike({
    liked: p?.is_liked ?? p?.isLiked ?? p?.liked_by_me ?? p?.has_liked,
    likes_count: p?.likes_count ?? p?.like_count ?? p?.likes ?? p?.stars ?? p?.star_count,
  });
  return { liked: r.liked ?? false, count: r.count ?? 0 };
};

export const toggleProjectLikeApi = async (id) => readLike(unwrap(await api.post(`/api/projects/${id}/likes`)));

export const fetchProjectLikesApi = async (id) => readLike(unwrap(await api.get(`/api/projects/${id}/likes`)));