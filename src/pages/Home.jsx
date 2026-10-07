import React, { useState, useEffect } from "react";
import CreateNewPostCard from "../components/feed/CreateNewPostCard";
import FeedFilter from "../components/feed/FeedFilter";
import MainLayout from "../components/layout/MainLayout";
import PostCard from "../components/feed/PostCard";
import { dummyPosts } from "../data/post";
import RightSidebar from "../components/layout/RightSidebar";
import { fetchPosts } from "../services/posts";
import api from "../services/api";
import { getUserAvatar, getUserName } from "../utils/Avatar";
const Home = ({ selectedTopic, onSelectTopic }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Trending");
  const [sortBy, setSortBy] = useState("latest");
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/me");
        const userData = res.data?.data || res.data?.user || res.data;
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchUser();
  }, []);
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchPosts();
      setPosts(data);
      // if (Array.isArray(data) && data.length > 0) {
      //   setPosts(data);
      // }
    } catch (err) {
      console.error("Error fetching posts:", err.response?.status, err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleAddPostSuccess = (createdPost) => {
    const currentAuthor = user
      ? {
          id: user.id || user._id,
          username: user.username,
          name: getUserName(user),
          avatar_url: getUserAvatar(user),
        }
      : null;

    const existing =
      createdPost.author && typeof createdPost.author === "object"
        ? createdPost.author
        : {};

    const enriched = {
      ...createdPost,
      author: {
        ...currentAuthor,
        ...existing,
        avatar_url: getUserAvatar(existing) || currentAuthor?.avatar_url,
      },
    };

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
      return (b.likes_count ?? b.likes ?? 0 ) - (a.likes_count ?? a.likes ?? 0);
    }
    if (sortBy === "latest") {
      return (
        new Date(b.created_at || b.createdAt || b.timestamp) -
        new Date(a.created_at || a.createdAt || a.timestamp)
      );
    }
    return 0;
  });

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
        userName={user? getUserName(user) : undefined}
        userAvatar={getUserAvatar(user)}
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
            <PostCard key={post.id || post._id} post={post} currentUser={user}  />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
