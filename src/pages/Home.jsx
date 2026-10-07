import React, { useState, useEffect } from "react";
import CreateNewPostCard from "../components/feed/CreateNewPostCard";
import FeedFilter from "../components/feed/FeedFilter";
// import MainLayout from "../components/layout/MainLayout";
import PostCard from "../components/feed/PostCard";
// import { fetchPosts } from "../services/posts";
import api from "../services/api";
import { fetchPosts, fetchBookmarksApi } from "../services/posts";
import { getUserAvatar, getUserName } from "../utils/Avatar";

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
  const loadPosts = async () => {
   try {
      const [data, saved] = await Promise.all([
        fetchPosts(),
        fetchBookmarksApi().catch(() => []),
      ]);
      const savedIds = new Set(saved.map((p) => p.id));
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

  const filteredPosts = posts.filter((post) => {
    if (selectedTopic) {
      const cleanTopic = selectedTopic.replace("#", "").toLowerCase();
      const contentMatch = post.content?.toLowerCase().includes(cleanTopic);
      const categoryMatch = post.category?.toLowerCase() === cleanTopic;
      return contentMatch || categoryMatch;
    }
    if (activeTab === "Following") {
      return post.isFollowingAuthor === true || post.isFollowing === true;
    }
    if (activeTab === "Milestones") {
      return post.isMilestone === true || post.isArticle === true;
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "top" || sortBy === "most-liked") {
      return (b.likes_count ?? 0) - (a.likes_count ?? 0);
    }
    if (sortBy === "latest") {
      return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
    }
    return 0;
  });
  const myName = user?.full_name || user?.author_name || user?.name || user?.authorName || user?.username || user?.author_username || "Unknown User";
  const myAvatar = user?.avatar_url || user?.author_avatar_url || user?.avatar || user?.author_avatar || undefined;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {selectedTopic && (
        <div className="flex items-center justify-between bg-[#F7F4F0] px-4 py-2.5 rounded-xl border border-stone-200/80 text-xs text-stone-700">
          <span>
            Filtering Feed by <strong>{selectedTopic}</strong>
          </span>
          <button
            onClick={() => onSelectTopic(null)}
            className="text-[#A04662] font-semibold hover:underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Fixed: Updated prop name to onAddPostSuccess to match CreateNewPostCard */}
      <CreateNewPostCard
        onAddPostSuccess={handleAddPostSuccess}
         onAvatarChange={(url) =>
          setUser((u) => ({ ...u, avatar: url, avatar_url: url }))
        }
        profile={user || {}}
        userName={myName}
        userAvatar={myAvatar}
      />

      <FeedFilter
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs font-semibold bg-white rounded-2xl border border-stone-200/80 text-stone-500">
            Loading feed...
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="p-8 text-center text-xs font-semibold bg-white rounded-2xl border border-stone-200/80 text-stone-500">
            <p className="text-sm font-semibold text-stone-700">
              {selectedTopic
                ? `No posts found under ${selectedTopic}`
                : activeTab === "Following"
                  ? "You are not following anyone yet. Start following users to see their posts here."
                  : `No post found under ${activeTab}`}
            </p>
            <p className="text-sm font-semibold text-stone-400 mt-1">
              {activeTab === "Following"
                ? "Explore the platform and follow users to see their posts in your feed."
                : selectedTopic
                  ? `Be the first to create a post under ${selectedTopic}`
                  : `Be the first to create/share a post under ${activeTab}`}
            </p>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <PostCard key={post.id || post._id} post={post} currentUser={user} />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;