import React, { useState, useEffect } from "react";
import CreateNewPostCard from "../components/feed/CreateNewPostCard";
// import MainLayout from "../components/layout/MainLayout";
import PostCard from "../components/feed/PostCard";
// import { fetchPosts } from "../services/posts";
import api from "../services/api";
import { fetchPosts, fetchBookmarksApi } from "../services/posts";
import { getUserAvatar, getUserName } from "../utils/Avatar";
import foundryLogo from "../assets/foundry-logo.png";

const Home = ({ selectedTopic, onSelectTopic }) => {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Trending");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const fetchUser = async () => {
      try{
        const res = await api.get("/api/auth/me");
        const me = res.data?.data || res.data?.user || res.data;
        console.log("ME:", me);
        setUser(me);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  },[]);
  // usernames I follow (the posts don't carry an "is following" flag)
  const [followingNames, setFollowingNames] = useState(null);
  useEffect(() => {
    if (!user?.username) return;
    let alive = true;
    api
      .get(`/api/users/${user.username}/following`, { params: { limit: 500 } })
      .then((res) => {
        const body = res.data?.data ?? res.data;
        const list = Array.isArray(body)
          ? body
          : body?.following || body?.users || body?.items || body?.results ||
            Object.values(body || {}).find(Array.isArray) || [];
        const names = list
          .map((u) => (typeof u === "string" ? u : u?.username || u?.following_username || u?.user?.username))
          .filter(Boolean)
          .map((n) => String(n).toLowerCase());
        if (alive) setFollowingNames(new Set(names));
      })
      .catch((err) => {
        console.error("following list failed:", err.response?.status, err.response?.data);
        if (alive) setFollowingNames(new Set());
      });
    return () => {
      alive = false;
    };
  }, [user?.username]);

  // server-side feeds: trending algorithm and tag filter (GET /api/posts/trending, GET /api/posts?tag=)
  const [savedIdSet, setSavedIdSet] = useState(new Set());
  const [trendingPosts, setTrendingPosts] = useState(null); // null = not loaded / failed
  const [tagPosts, setTagPosts] = useState(null);
  const [feedLoading, setFeedLoading] = useState(false);

  const unwrapPosts = (res) => {
    const body = res.data?.data ?? res.data;
    const list = Array.isArray(body)
      ? body
      : body?.posts || body?.items || body?.results || Object.values(body || {}).find(Array.isArray) || [];
    return list.map((p) => ({
      ...p,
      id: p.id || p._id,
      is_bookmarked: p.is_bookmarked ?? savedIdSet.has(p.id || p._id),
    }));
  };

  const cleanTag = selectedTopic ? selectedTopic.replace(/^#/, "").toLowerCase() : "";

  useEffect(() => {
    if (cleanTag || activeTab !== "Trending") return;
    let alive = true;
    setFeedLoading(true);
    api
      .get("/api/posts/trending", { params: { page: 1, limit: 30 } })
      .then((res) => alive && setTrendingPosts(unwrapPosts(res)))
      .catch((err) => {
        console.error("trending failed:", err.response?.status, err.response?.data);
        if (alive) setTrendingPosts(null);
      })
      .finally(() => alive && setFeedLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, cleanTag]);

  useEffect(() => {
    if (!cleanTag) {
      setTagPosts(null);
      return;
    }
    let alive = true;
    setFeedLoading(true);
    api
      .get("/api/posts", { params: { tag: cleanTag, page: 1, limit: 50 } })
      .then((res) => {
        console.log("tag feed:", cleanTag, res.data);
        if (alive) setTagPosts(unwrapPosts(res));
      })
      .catch((err) => {
        console.error("tag feed failed:", err.response?.status, err.response?.data);
        if (alive) setTagPosts(null);
      })
      .finally(() => alive && setFeedLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanTag]);

  const loadPosts = async () => {
   try {
      const [data, saved] = await Promise.all([
        fetchPosts(),
        fetchBookmarksApi().catch(() => []),
      ]);
      const savedIds = new Set(saved.map((p) => p.id));
      setSavedIdSet(savedIds);
      setPosts(
        data.map((p) => ({
          ...p,
          is_bookmarked: p.is_bookmarked ?? savedIds.has(p.id),
        })),
      );
    } catch (err) {
      console.error(
        "Error fetching posts:",
        err.response?.status,
        err.response?.data,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (loading) return;
    const postId = new URLSearchParams(window.location.search).get("post");
    if (!postId) return;

    const timer = window.setTimeout(() => {
      const post = document.querySelector(`[data-post-id="${CSS.escape(postId)}"]`);
      if (post) {
        post.scrollIntoView({ behavior: "smooth", block: "center" });
        post.classList.add("ring-2", "ring-[#A04622]/40", "ring-inset");
        window.setTimeout(() => post.classList.remove("ring-2", "ring-[#A04622]/40", "ring-inset"), 3000);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loading, posts]);

  const handleAddPostSuccess = (createdPost) => {
    const enriched = {
      ...createdPost,
      username: createdPost.username ?? user?.username,
      full_name: createdPost.full_name ?? (user ? getUserName(user) : undefined),
      avatar_url: 
      createdPost.avatar_url ?? (user  ? getUserAvatar(user) : undefined),
      likes_count: createdPost.likes_count ?? 0,
      reposts_count: createdPost.reposts_count ?? 0,
      comments_count: createdPost.comments_count ?? 0,
    }
   setPosts((prev) => [enriched, ...prev]);
    if (selectedTopic) onSelectTopic(null);
  };

  // whole-hashtag match: "#AI" matches "#AI" or "#ai" but not "#AIAgents" or "maintain"
  const hasTag = (text, tag) => {
    if (!text) return false;
    const re = new RegExp(`(^|[^\\w&])#${tag}(?![A-Za-z0-9_])`, "i");
    return re.test(text);
  };

  // server results win; the local list is the fallback if a call fails
  // if the server finds nothing for the tag, fall back to searching the posts we already have
  const serverTag = Boolean(cleanTag && tagPosts && tagPosts.length > 0);
  const serverTrending = Boolean(!cleanTag && activeTab === "Trending" && trendingPosts);
  const source = serverTag ? tagPosts : serverTrending ? trendingPosts : posts;

  const filteredPosts = source.filter((post) => {
    if (serverTag || serverTrending) return true;
    if (selectedTopic) {
      const cleanTopic = selectedTopic.replace(/^#/, "").toLowerCase();
      const tagMatch =
        hasTag(post.content, cleanTopic) ||
        hasTag(post.title, cleanTopic) ||
        (Array.isArray(post.tags) &&
          post.tags.some((t) => String(t).replace(/^#/, "").toLowerCase() === cleanTopic)) ||
        (typeof post.tags === "string" &&
          post.tags.split(/[,\s]+/).some((t) => t.replace(/^#/, "").toLowerCase() === cleanTopic));
      const categoryMatch = post.category?.toLowerCase() === cleanTopic;
      return tagMatch || categoryMatch;
    }
    if (activeTab === "Following") {
      if (post.isFollowingAuthor === true || post.isFollowing === true) return true;
      const author = String(
        post.username || post.author_username || post.author?.username || post.user?.username || "",
      ).toLowerCase();
      return Boolean(author && followingNames?.has(author));
    }
    if (activeTab === "Milestones") {
      return post.isMilestone === true || post.isArticle === true;
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (serverTrending && sortBy === "latest") return 0; // keep the algorithm's order
    if (sortBy === "top" || sortBy === "most-liked") {
      return (b.likes_count ?? 0) - (a.likes_count ?? 0);
    }
    if (sortBy === "latest") {
      return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
    }
    return 0;
  });
  const myName = user?.full_name || user?.author_name || user?.name || user?.authorName || user?.username || user?.author_username || "Builder";
  const myAvatar = user?.avatar_url || user?.author_avatar_url || user?.avatar || user?.author_avatar || foundryLogo;

  const TABS = ["Trending", "Following"];

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1C1917] min-h-screen">
      {/* tabs (stay visible while scrolling) */}
      <div className="sticky top-12 min-[511px]:top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur border-b border-stone-200/70 flex items-stretch">
        <div className="flex flex-1">
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 h-[53px] text-[15px] transition-colors cursor-pointer hover:bg-white/10 ${
                  active ? "font-bold text-[#1C1917]" : "font-medium text-stone-500"
                }`}
              >
                {tab}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-14 rounded-full bg-[#C66A47]" />
                )}
              </button>
            );
          })}
        </div>
        <label className="flex items-center pr-3 pl-1">
          <span className="sr-only">Sort by</span>
          <select
            value={sortBy === "top" || sortBy === "most-liked" ? "top" : "latest"}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-medium text-[#1C1917] bg-white border border-stone-200 rounded-full px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="latest">Latest</option>
            <option value="top">Top</option>
          </select>
        </label>
      </div>

      {selectedTopic && (
        <div className="flex items-center justify-between bg-[#FEF2EC] px-4 py-3 border-b border-stone-200/70 text-sm text-[#1C1917]">
          <span>
            Filtering by <strong>{selectedTopic}</strong>
          </span>
          <button
            onClick={() => onSelectTopic(null)}
            className="text-[#C66A47] font-bold hover:underline cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      )}

      <CreateNewPostCard
        flat
        onAddPostSuccess={handleAddPostSuccess}
        onAvatarChange={(url) =>
          setUser((u) => ({ ...u, avatar: url, avatar_url: url }))
        }
        profile={user || {}}
        userName={myName}
        userAvatar={myAvatar}
      />

      <div>
        {loading || feedLoading ? (
          <div className="p-10 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-stone-200 border-t-[#C66A47] animate-spin" />
            Loading feed...
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="px-6 py-14 text-center space-y-1">
            <p className="text-2xl font-extrabold text-[#1C1917]">
              {selectedTopic
                ? `No posts found under ${selectedTopic}`
                : activeTab === "Following"
                  ? followingNames && followingNames.size > 0
                    ? "No posts from people you follow yet"
                    : "You are not following anyone yet"
                  : `No posts found under ${activeTab}`}
            </p>
            <p className="text-[15px] text-stone-500">
              {activeTab === "Following" && !selectedTopic
                ? followingNames && followingNames.size > 0
                  ? "When they post, it will show up here."
                  : "Follow builders to see their posts in your feed."
                : selectedTopic
                  ? `Be the first to post under ${selectedTopic}.`
                  : "Be the first to share something here."}
            </p>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <PostCard
              flat
              key={post.id || post._id}
              post={post}
              currentUser={user}
              onTagClick={onSelectTopic}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;