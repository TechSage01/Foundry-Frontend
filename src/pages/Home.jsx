import React, { useState, useEffect } from "react";
import CreateNewPostCard from "../components/feed/CreateNewPostCard";
import FeedFilter from "../components/feed/FeedFilter";
import MainLayout from "../components/layout/MainLayout";
import PostCard from "../components/feed/PostCard";
import { dummyPosts } from "../data/post";
import RightSidebar from "../components/layout/RightSidebar";
import { fetchPosts } from "../services/posts";

const Home = ({ selectedTopic, onSelectTopic }) => {
  const [posts, setPosts] = useState(dummyPosts);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Trending");
  const [sortBy, setSortBy] = useState("Latest");

  const currentUser = { 
    name: "TechSage",
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchPosts(activeTab, sortBy, selectedTopic);
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeTab, sortBy, selectedTopic]);

  const handleAddPostSuccess = (createdPost) => {
    setPosts((prev) => [createdPost, ...prev]);
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
    if (sortBy === "Top" || sortBy === "most-liked") {
      return (b.likes || 0) - (a.likes || 0);
    }
    if (sortBy === "Latest") {
      return new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt);
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
        userName={currentUser.name}
        userAvatar={currentUser.avatar}
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
            <PostCard key={post.id || post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;