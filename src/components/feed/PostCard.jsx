import React, { useState, useEffect } from "react";
import CreatePostCard from "./CreatePostCard";
import FeedFilter from "./FeedFilter";
import { getUserAvatar, getUserName, AvatarFallback } from "../../utils/Avatar";
import {
  addCommentApi,
  toggleLikeApi,
  toggleBookmarkApi,
  setRepostApi,
  fetchCommentsApi,
} from "../../services/posts";
import { Heart, MessageSquare, Share2, Bookmark, Repeat2 } from "lucide-react";

const pickAuthor = (post, currentUser) => {
  const nested =
    [
      post?.author,
      post?.user,
      post?.User,
      post?.owner,
      post?.creator,
      post?.profile,
    ].find((a) => a && typeof a === "object") || {};

  const flat = {
    username: post?.username || post?.author_username,
    full_name: post?.full_name || post?.author_name || post?.authorName,
    avatar_url: post?.avatar_url || post?.author_avatar || post?.avatar,
  };

  const authorId =
    nested.id || nested._id || post?.author_id || post?.user_id || post?.userId;
  const currentId = currentUser?.id || currentUser?._id;
  const isMine =
    authorId && currentId && String(authorId) === String(currentId);

  return {
    ...(isMine ? currentUser : {}),
    ...flat,
    ...nested,
  };
};

const getAuthorAvatar = (post, currentUser) => {
  const a = pickAuthor(post, currentUser);
  return getUserAvatar(a) || AvatarFallback(getUserName(a));
};

const getAuthorName = (post, currentUser) => {
  if (typeof post?.author === "string") return post.author;
  return getUserName(pickAuthor(post, currentUser));
};
const getAuthorHandle = (post, currentUser) => {
  const a = pickAuthor(post, currentUser);
  const handle = a.username || a.user_name || a.handle;
  return handle ? `@${handle}` : null;
  // return handle || null;
};

const PostCard = ({ post, currentUser }) => {
  const [liked, setLiked] = useState(post?.isLiked  ?? post?.is_liked ?? post?.liked_by_me ?? false);
  const [likesCount, setLikesCount] = useState(post?.likes_count ?? post?.likes ?? post?.like_count ?? 0);

  const [reposted, setReposted] = useState(post?.isReposted ?? post?.is_reposted ?? post?.reposted_by_me ?? false);
  const [repostCount, setRepostsCount] = useState(post?.reposts_count ?? post?.reposts ?? post?.repost_count ?? 0);

  const [bookmarked, setBookmarked] = useState(post?.isBookmarked || false);

  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState(post?.commentsList || []);
  const [commentsCount, setCommentsCount] = useState(post?.comments_count ?? 0);
  const [commentsText, setCommentsText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
  if (!showComments) return;
  fetchCommentsApi(post.id || post._id)
    .then((list) => {
      console.log("comments:", list);
      setCommentsList(list);
      setCommentsCount(list.length);
    })
    .catch((err) =>
      console.error("fetch comments failed", err.response?.status, err.response?.data)
    );
  }, [showComments]);

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const posDate = new Date(timestamp);
    if (isNaN(posDate.getTime())) return timestamp;
    const now = new Date();
    const diffInSeconds = Math.floor((now - posDate) / 1000);
    if (diffInSeconds < 60) return "Updated Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;

    return posDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleLike = async () => {
    try {
      const data = await toggleLikeApi(post.id || post._id);
      if (typeof data?.is_liked === 'boolean') setLiked(data.is_liked);
      if(typeof data?.likes_count === 'number') setLikesCount(data.likes_count);
    } catch (err) {
      console.error("like failed:", err.response?.status, err.response?.data);
    }
  };

  const handleRepost = async () => {
    const wantRepost = !reposted;
    try {
      const data =await setRepostApi(post.id || post._id, wantRepost);
      console.log("repost response:", data);
    setReposted(
      typeof data?.is_reposted === "boolean" ? data.is_reposted : wantRepost
    );
    if (typeof data?.reposts_count === "number") {
      setRepostsCount(data.reposts_count);
    } else {
      setRepostsCount((prev) => Math.max(0, wantRepost ? prev + 1 : prev - 1));
    }
  } catch (err) {
    const status = err.response?.status;
    console.error("repost failed:", status, err.response?.data);
    };
  }

  const handleBookmark = async () => {
    const nextState = !bookmarked;
    setBookmarked(nextState);
    try {
      await toggleBookmarkApi(post.id || post._id);
    } catch {
      setBookmarked(!nextState);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Post by ${getAuthorName(post, currentUser)}`,
      text: post?.content || "Check out this post on Foundry",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error Sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentsText.trim()) return;
    try {
      const addedComment = await addCommentApi(
        post.id || post._id,
        commentsText.trim(),
      );
      console.log("Added Comment:", addedComment);
      setCommentsList((prev) => [...prev, { ...addedComment?.user ?? currentUser}
      ]);
      setCommentsCount((prev) => prev + 1);
      setCommentsText("");
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  if (!post) return null;
  console.log("POST SHAPE:", post);
  const authorName = (post, currentUser) =>{
    const a = pickAuthor(post, currentUser);
    const handle = a.username || a.handle || a.userName || a.name || a.full_name;
    return handle || "User";
  }

  const placeholderTitles = ["Photo update", "Video update", "Post update"];
  const content = post.content || placeholderTitles[0] || "";
  const isQuickPost =
    !post.isArticle &&
    (!post.title ||
      placeholderTitles.includes(post.title) ||
      post.title === content.slice(0, 80));
  const isArticle = Boolean(post.isArticle || (post.title && !isQuickPost));
  const imageSrc =
    post.cover_image_url ||
    post.cover_image ||
    post.image_url ||
    post.image ||
    post.mediaUrl;
  const videoSrc = post.video_url || post.video;

  return (
    <article className="p-5 bg-white rounded-xl border border-stone-200/60 shadow-sm text-[#1C1917] space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* UPDATED AVATAR IMG TAG */}
          <img
            src={getAuthorAvatar(post, currentUser)}
            alt={authorName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = AvatarFallback(authorName);
            }}
            className="w-10 h-10 rounded-full border border-stone-200 bg-[#F5F0EB] object-cover shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-900 leading-none">
                {getAuthorHandle(post, currentUser) || getAuthorName(post, currentUser) || "User"}
              </h3>
              {post.badge && (
                <span className="text-[10px] font-medium px-2 py-0.5 bg-[#F5F0EB] text-stone-600 rounded-full border border-stone-200">
                  {post.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] text-stone-400">
              {getRelativeTime(post.timestamp || post.createdAt || post.created_at)}
            </span>
          </div>
        </div>
      </div>

      {isArticle && (
  <div className="pt-1">
    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D97757]/10 text-[#D97757] uppercase tracking-wider mb-1.5">
      Article
    </span>
    <h2 className="text-base font-bold text-stone-900 leading-tight">
      {post.title}
    </h2>
  </div>
)}

{content && !placeholderTitles.includes(content) && (
  <p className="text-sm text-stone-700 leading-relaxed">{content}</p>
)}

{videoSrc ? (
  <div className="rounded-lg overflow-hidden border border-stone-200/60 mt-2">
    <video src={videoSrc} controls className="w-full max-h-96 object-contain" />
  </div>
) : imageSrc ? (
  <div className="rounded-lg overflow-hidden border border-stone-200/60 mt-2">
    <img src={imageSrc} alt="Post Attachment" className="w-full max-h-80 object-cover" />
  </div>
) : null}

      <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-stone-500 text-xs">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
            liked ? "text-[#D97757]" : "hover:text-[#D97757]"
          }`}
        >
          <Heart size={16} fill={liked ? "#D97757" : "none"} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-lg ${
            showComments
              ? "text-stone-900 bg-stone-100"
              : "hover:text-stone-900 hover:bg-stone-50"
          }`}
        >
          <MessageSquare size={18} />
          <span>{commentsCount}</span>
        </button>

        <button
          onClick={handleRepost}
          className={`flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg cursor-pointer ${
            reposted
              ? "text-emerald-600 bg-emerald-50"
              : "hover:text-emerald-600 hover:bg-stone-50"
          }`}
        >
          <Repeat2
            size={18}
            className={reposted ? "rotate-180 transition-transform" : ""}
          />
          <span>{repostCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-stone-800 transition-colors cursor-pointer"
        >
          <Share2 size={18} />
          <span>{copied ? "copied!" : "Share"}</span>
        </button>

        <button
          onClick={handleBookmark}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            bookmarked
              ? "text-[#D97757] bg-[#F5F0EB]/60"
              : "hover:text-stone-900 hover:bg-stone-50"
          }`}
        >
          <Bookmark size={18} fill={bookmarked ? "#D97757" : "none"} />
        </button>
      </div>

      {showComments && (
        <div className="pt-3 border-t border-stone-100 space-y-3 bg-[#F9F8F6] p-3 rounded-xl mt-2">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentsText}
              onChange={(e) => setCommentsText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 text-xs px-3 py-2 bg-white rounded-lg border border-stone-200 outline-none focus:border-[#D97757]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-[#D97757] text-white rounded-lg hover:bg-[#C66243] transition-colors cursor-pointer"
            >
              Post
            </button>
          </form>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {commentsList.length === 0 ? (
              <p className="text-[11px] text-stone-400 text-center py-1">
                No Comments yet. Be the First!
              </p>
            ) : (
              commentsList.map((c) => (
                <div
                  key={c.id || c._id}
                  className="text-xs bg-white p-2.5 rounded-lg border border-stone-200/60 space-y-0.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-800">
                      {getAuthorName(c, currentUser)}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {getRelativeTime(c.timestamp || c.created_at )}
                    </span>
                  </div>
                  <p className="text-stone-600">{c.text || c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
