import react, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import {
  fetchCommunityBySlug,
  fetchMyCommunities,
  fetchCommunityMembers,
  fetchCommunityPosts,
  createCommunityPostApi,
  joinCommunityApi,
  leaveCommunityApi,
} from "../services/communities";
import CommunityComments from "../components/CommunityComments";
import { ArrowLeft, Users, Loader2, Plus, X, Send } from "lucide-react";
import api from "../services/api";
const memberUsername = (m) => m?.username || m?.user?.username;

import { LiaChevronCircleDownSolid } from "react-icons/lia";

function CommunityDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [members, setMembers] = useState([]);
  const [me, setMe] = useState(null);
  const [memberOverride, setMemberOverride] = useState(null);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);

  const [joining, setJoining] = useState(false);
  const [actionError, setActionError] = useState("");

  const [showComposer, setShowComposer] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postSubtitle, setPostSubtitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchMyCommunities({ limit: 50 })
      .then((r) => {
        if (cancelled) return;
        setIsOwner((r.items || []).some((c) => c.slug === slug));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);
  const id = community?.id || community?.id;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchCommunityBySlug(slug)
      .then((data) => {
        console.log("COMMUNITY LOADED:", data);
        if (!cancelled) setCommunity(data);
      })
      .catch((err) => {
        console.error(
          "Failed to load community:",
          err.response?.status,
          err.message,
        );
        if (!cancelled) setError("Community not found.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    fetchCommunityMembers(slug)
      .then((list) => !cancelled && setMembers(Array.isArray(list) ? list : []))
      .catch(() => {});
    api
      .get("/api/auth/me")
      .then(
        (r) =>
          !cancelled &&
          setMe(r.data?.data?.user || r.data?.data || r.data?.user || r.data),
      )
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    const id = community?._id || community?.id;
    if (!id) return;
    setPostsLoading(true);
    fetchCommunityPosts(id, { page })
      .then((r) => {
        if (cancelled) return;
        setPosts(r.items);
        setTotalPages(r.totalPages);
      })
      .catch((err) =>
        console.error(
          "Failed to load community posts:",
          err.response?.status,
          err.message,
        ),
      )
      .finally(() => !cancelled && setPostsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, page]);

const flag =
  community?.is_member ?? community?.isMember ?? community?.is_joined;
  const fromList =
    me?.username && members.length
      ? members.some((m) => memberUsername(m) === me.username)
      : undefined;
  const isMember =
    memberOverride !== null
      ? memberOverride
      : (flag ?? fromList ?? (isOwner || undefined) ?? false);

  const memberCount =
    members.length ||
    community?.members_count ||
    community?.member_count ||
    community?.builders ||
    0;

  const handleJoinToggle = async () => {
    if (!id || joining) return;
    setJoining(true);
    setActionError("");
    try {
      if (isMember) await leaveCommunityApi(id);
      else await joinCommunityApi(id);
      setMemberOverride(!isMember);
      fetchCommunityMembers(slug);
      fetchCommunityMembers(slug)
        .then((list) => setMembers(Array.isArray(list) ? list : []))
        .catch(() => {});
    } catch (err) {
      const msg = err.response?.data?.message || "";
      const status = err.response?.status;
      console.error(
        "membership failed:",
        err.response?.status,
        err.response?.data,
      );

      if (status === 409 || /already/i.test(msg)) setMemberOverride(true);
      else if (/not a member|not.*joined/i.test(msg)) setMemberOverride(false);
      else setActionError(msg || "Could not update membership.");
    } finally {
      setJoining(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (posting) return;
    if (!postTitle.trim() || !postContent.trim()) {
      setPostError("Title and content are required.");
      return;
    }
    setPosting(true);
    setPostError("");
    try {
      const created = await createCommunityPostApi(id, {
        title: postTitle.trim(),
        subtitle: postSubtitle.trim(),
        content: postContent.trim(),
      });
      if (created && typeof created === "object" && created.title) {
        setPosts((prev) => [created, ...prev]);
      } else {
        const r = await fetchCommunityPosts(id, { page: 1 });
        setPosts(r.items);
        setPage(1);
      }
      setPostTitle("");
      setPostSubtitle("");
      setPostContent("");
      setShowComposer(false);
    } catch (err) {
      console.error(
        "Failed to create community post:",
        err.response?.status,
        err.response?.data,
      );
      const d = err.response?.data;
      setPostError(d?.message || "Failed to post. Please try again.");
    } finally {
      setPosting(false);
    }
  };
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#A04622]" />
        </div>
      </MainLayout>
    );
  }

  if (error || !community) {
    return (
      <MainLayout>
        <div className="text-center py-16 text-stone-500 text-sm">
          {error || "Community not found."}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-[#1C1917] font-sans">
        <button
          onClick={() => navigate("/communities")}
          className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Communities</span>
        </button>

        <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-stone-200/80 shadow-xs flex items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {community.title || community.name}
              </h1>
              {community.category && (
                <span className="bg-[#A04622]/10 text-[#A04622] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#A04622]/20">
                  {community.category}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
              {community.description || community.tagline}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
              <Users size={13} />
              <span>
                {memberCount} {memberCount === 1 ? "builder" : "builders"}
              </span>
            </div>
            {actionError && (
              <p className="text-xs text-rose-600">{actionError}</p>
            )}
          </div>

          <button
            onClick={handleJoinToggle}
            disabled={joining}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 ${
              isMember
                ? "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                : "bg-[#A04622] text-white hover:bg-[#8A3A1B]"
            }`}
          >
            {joining ? "..." : isMember ? "Leave Community" : "Join Community"}
          </button>
        </div>

        {members.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-stone-900">Members</h2>
            <div className="flex flex-wrap gap-2">
              {members.map((m, i) => {
                const u = memberUsername(m);
                return u ? (
                  <Link
                    key={u + i}
                    to={`/profile/${u}`}
                    className="text-xs bg-stone-50 border border-stone-200 rounded-full px-3 py-1 text-stone-700 hover:bg-stone-100"
                  >
                    @{u}
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900">
              Community Posts
            </h2>
            {isMember && (
              <button
                onClick={() => setShowComposer((v) => !v)}
                className="text-xs font-semibold text-[#A04622] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> New Post
              </button>
            )}
          </div>

          {showComposer && (
            <form
              onSubmit={handlePostSubmit}
              className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3"
            >
              {postError && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200/60 rounded-xl px-3 py-2">
                  {postError}
                </div>
              )}
              <input
                type="text"
                placeholder="Post title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#A04622]"
                required
              />
              <input
                type="text"
                placeholder="Subtitle (optional)"
                value={postSubtitle}
                onChange={(e) => setPostSubtitle(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#A04622]"
              />
              <textarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={3}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#A04622] resize-none"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 px-3 py-1 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="bg-[#A04622] text-white text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {posting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  <span>{posting ? "Posting..." : "Post"}</span>
                </button>
              </div>
            </form>
          )}

          {postsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#A04622]" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-xs text-stone-400 italic text-center py-6">
              No posts in this community yet.
            </p>
          ) : (
            <div className="space-y-3">
              {posts.map((post, idx) => (
                <div
                  key={post.id || post._id || idx}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1"
                >
                  <h3 className="text-sm font-bold text-stone-900">
                    {post.title}
                  </h3>
                  {post.subtitle && (
                    <p className="text-xs text-stone-500">{post.subtitle}</p>
                  )}
                  <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                  {(post.username || post.author_username) && (
                    <Link
                      to={`/profile/${post.username || post.author_username}`}
                      className="text-[11px] text-stone-400 hover:underline"
                    >
                      @{post.username || post.author_username}
                    </Link>
                  )}
                  <CommunityComments
                    communityId={id}
                    postId={post.id || post._id}
                    canComment={isMember}
                    initialCount={
                      post.comments_count ?? post.comment_count ?? 0
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {totalPages && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-stone-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 disabled:opacity-30 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default CommunityDetail;
