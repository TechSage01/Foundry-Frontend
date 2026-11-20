import React, { useState, useEffect, useRef } from "react";
import { getUserAvatar, getUserName, AvatarFallback } from "../../utils/Avatar";
import {
  addCommentApi,
  deleteCommentApi,
  fetchCommentsApi,
  toggleLikeApi,
  setBookmarkApi,
  setRepostApi,
  toggleCommentLikeApi,
} from "../../services/posts";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Share2, Bookmark, Repeat2 } from "lucide-react";

/* ---------- author helpers ---------- */

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
    full_name:
      post?.full_name ||
      post?.author_name ||
      post?.author_fullname ||
      post?.authorName,
    avatar_url:
      post?.avatar_url ||
      post?.author_avatar_url ||
      post?.author_avatar ||
      post?.avatar,
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
};

/* ---------- hashtag helpers ---------- */

// splits text into plain strings and #hashtags; a tag is # followed by letters,
// numbers or underscores and must not be glued to a word (so "a#b" is not a tag)
const TAG_RE = /(^|[^\w&])([#@])([A-Za-z0-9_]+)/g;

const renderWithTags = (text, onTagClick, dark = false) => {
  const parts = [];
  let last = 0;
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(text)) !== null) {
    const start = m.index + m[1].length;
    if (start > last) parts.push(text.slice(last, start));
    const mark = m[2];
    const word = m[3];
    const label = `${mark}${word}`;
    const cls = `${dark ? "text-[#A04622]" : "text-[#A04622] font-medium"} hover:underline`;
    if (mark === "@") {
      // @username opens that person's profile
      parts.push(
        <Link key={`${start}-${label}`} to={`/profile/${word}`} className={cls}>
          {label}
        </Link>,
      );
    } else {
      parts.push(
        onTagClick ? (
          <button
            key={`${start}-${label}`}
            type="button"
            onClick={() => onTagClick(label)}
            className={`${cls} cursor-pointer`}
          >
            {label}
          </button>
        ) : (
          <span key={`${start}-${label}`} className={dark ? "text-[#A04622]" : "text-[#A04622] font-medium"}>
            {label}
          </span>
        ),
      );
    }
    last = start + label.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
};

/* ---------- comment tree helpers ---------- */

const addReplyToTree = (list, parentId, reply) =>
  list.map((c) =>
    c.id === parentId
      ? { ...c, replies: [...(c.replies || []), reply] }
      : { ...c, replies: addReplyToTree(c.replies || [], parentId, reply) },
  );

const removeFromTree = (list, id) =>
  list
    .filter((c) => c.id !== id)
    .map((c) => ({ ...c, replies: removeFromTree(c.replies || [], id) }));

const countAll = (list) =>
  list.reduce((n, c) => n + 1 + countAll(c.replies || []), 0);

const getRelativeTime = (timestamp) => {
  if (!timestamp) return "Just now";
  const posDate = new Date(timestamp);
  if (isNaN(posDate.getTime())) return timestamp;
  const diffInSeconds = Math.floor((new Date() - posDate) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return posDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* ---------- one comment (with nested replies) ---------- */

const CommentItem = ({ comment, currentUser, onReply, onDelete, postId, dark = false }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [cLiked, setCLiked] = useState(
    comment.is_liked ?? comment.isLiked ?? comment.liked_by_me ?? false,
  );
  const [cCount, setCCount] = useState(
    comment.likes_count ?? comment.like_count ?? comment.likes ?? 0,
  );
  const [cBusy, setCBusy] = useState(false);

  const likeComment = async () => {
    if (cBusy) return;
    const prev = { cLiked, cCount };
    setCBusy(true);
    setCLiked(!cLiked);
    setCCount(Math.max(0, cCount + (cLiked ? -1 : 1)));
    try {
      const r = await toggleCommentLikeApi(postId, comment.id);
      const l = r?.is_liked ?? r?.liked ?? r?.isLiked;
      const c = r?.likes_count ?? r?.like_count ?? r?.count;
      if (typeof l === "boolean") setCLiked(l);
      if (typeof c === "number") setCCount(c);
    } catch (err) {
      console.error("comment like failed:", err.response?.status, err.response?.data);
      setCLiked(prev.cLiked);
      setCCount(prev.cCount);
    } finally {
      setCBusy(false);
    }
  };
  const replies = comment.replies || [];
  const prevLen = useRef(replies.length);

  useEffect(() => {
    if (replies.length > prevLen.current) setShowReplies(true);
    prevLen.current = replies.length;
  }, [replies.length]);

  const isMine =
    currentUser?.username &&
    comment.author_username === currentUser.username;

  return (
    <div className="text-xs space-y-1">
      <div className={`p-2.5 rounded-lg border space-y-1 ${dark ? "bg-[#f5f5f4] border-[#e7e5e4]" : "bg-white border-stone-200/60"}`}>
        <div className="flex justify-between items-center">
          <span className={`font-semibold ${dark ? "text-[#1c1917]" : "text-stone-800"}`}>
            {getAuthorHandle(comment, currentUser) ??
              getAuthorName(comment, currentUser)}
          </span>
          <span className="text-[10px] text-stone-400">
            {getRelativeTime(comment.created_at || comment.createdAt)}
          </span>
        </div>
        <p className={dark ? "text-[#57534e]" : "text-stone-600"}>{comment.content}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={likeComment}
            aria-pressed={cLiked}
            className={`flex items-center gap-1 text-[11px] cursor-pointer ${
              cLiked ? "text-[#f91880]" : "text-stone-400 hover:text-[#f91880]"
            }`}
          >
            <Heart size={12} className={cLiked ? "fill-[#f91880]" : ""} />
            {cCount > 0 && <span>{cCount}</span>}
          </button>
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="text-[11px] text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            Reply
          </button>
          {isMine && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="text-[11px] text-stone-400 hover:text-red-500 cursor-pointer"
            >
              Delete
            </button>
          )}
          {replies.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReplies(!showReplies)}
              className="text-[11px] text-stone-500 cursor-pointer"
            >
              {showReplies
                ? "Hide replies"
                : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>
      </div>

      {showReplies && (
        <div className="pl-4 border-l border-stone-200 space-y-2">
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              currentUser={currentUser}
              onReply={onReply}
              onDelete={onDelete}
              postId={postId}
              dark={dark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- the post card ---------- */

const PostCard = ({ post, currentUser, onTagClick, flat = false }) => {
  const postId = post?.id || post?._id;

  const [liked, setLiked] = useState(
    post?.is_liked ?? post?.isLiked ?? post?.liked_by_me ?? false,
  );
  const [likesCount, setLikesCount] = useState(
    post?.likes_count ?? post?.likes ?? post?.like_count ?? 0,
  );

  const [reposted, setReposted] = useState(
    post?.is_reposted ?? post?.isReposted ?? post?.reposted_by_me ?? false,
  );
  const [repostCount, setRepostsCount] = useState(
    post?.reposts_count ?? post?.reposts ?? post?.repost_count ?? 0,
  );

  const [bookmarked, setBookmarked] = useState(
    post?.is_bookmarked ?? post?.isBookmarked ?? false,
  );

  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [commentsCount, setCommentsCount] = useState(
    post?.comments_count ?? post?.commentsCount ?? post?.comment_count ?? 0,
  );
  const [commentsText, setCommentsText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!showComments || !postId) return;
    fetchCommentsApi(postId)
      .then((list) => {
        setCommentsList(list);
        setCommentsCount(countAll(list));
      })
      .catch((err) =>
        console.error(
          "fetch comments failed",
          err.response?.status,
          err.response?.data,
        ),
      );
  }, [showComments, postId]);

  const handleLike = async () => {
    try {
      const data = await toggleLikeApi(postId);
      if (typeof data?.is_liked === "boolean") setLiked(data.is_liked);
      if (typeof data?.likes_count === "number")
        setLikesCount(data.likes_count);
    } catch (err) {
      console.error("like failed:", err.response?.status, err.response?.data);
    }
  };

  const handleRepost = async () => {
    const wantRepost = !reposted;
    try {
      const data = await setRepostApi(postId, wantRepost);
      setReposted(
        typeof data?.is_reposted === "boolean" ? data.is_reposted : wantRepost,
      );
      if (typeof data?.reposts_count === "number") {
        setRepostsCount(data.reposts_count);
      } else {
        setRepostsCount((prev) =>
          Math.max(0, wantRepost ? prev + 1 : prev - 1),
        );
      }
    } catch (err) {
      const status = err.response?.status;
      console.error("repost failed:", status, err.response?.data);
      if (wantRepost && (status === 400 || status === 409)) setReposted(true);
      else if (!wantRepost && status === 404) setReposted(false);
    }
  };

  const handleBookmark = async () => {
    const want = !bookmarked;
    try {
      const data = await setBookmarkApi(postId, want);
      setBookmarked(
        typeof data?.is_bookmarked === "boolean" ? data.is_bookmarked : want,
      );
    } catch (err) {
      const status = err.response?.status;
      console.error("bookmark failed:", status, err.response?.data);
      if (want && (status === 400 || status === 409)) setBookmarked(true);
      else if (!want && status === 404) setBookmarked(false);
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
      const added = await addCommentApi(
        postId,
        commentsText.trim(),
        replyingTo ? replyingTo.id : null,
      );
      const newComment = {
        replies: [],
        ...added,
        author_username: added?.author_username ?? currentUser?.username,
        author_fullname:
          added?.author_fullname ??
          (currentUser ? getUserName(currentUser) : undefined),
        author_avatar_url:
          added?.author_avatar_url ??
          (currentUser ? getUserAvatar(currentUser) : undefined),
      };
      setCommentsList((prev) =>
        replyingTo
          ? addReplyToTree(prev, replyingTo.id, newComment)
          : [...prev, newComment],
      );
      setCommentsCount((prev) => prev + 1);
      setCommentsText("");
      setReplyingTo(null);
    } catch (err) {
      console.error(
        "Failed to add comment",
        err.response?.status,
        err.response?.data,
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentApi(postId, commentId);
      const next = removeFromTree(commentsList, commentId);
      setCommentsList(next);
      setCommentsCount(countAll(next));
    } catch (err) {
      console.error(
        "delete comment failed:",
        err.response?.status,
        err.response?.data,
      );
    }
  };

  if (!post) return null;

  const authorName = getAuthorName(post, currentUser);
  const authorHandle = getAuthorHandle(post, currentUser);
  const authorUsername = authorHandle ? authorHandle.replace(/^@/, "") : null;
  const isOwnPost =
    authorUsername && currentUser?.username === authorUsername;
  const authorPath = authorUsername
    ? isOwnPost
      ? "/profile"
      : `/profile/${authorUsername}`
    : null;

  const placeholderTitles = ["Photo update", "Video update", "Post update"];
  const content = post.content || "";
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
    <article
      className={`font-sans ${flat ? "space-y-1.5 text-[#1c1917]" : "space-y-3 text-[#1C1917]"} ${
        flat
          ? "relative pl-[68px] pr-4 py-3 bg-white border-b border-[#e7e5e4] hover:bg-stone-50 transition-colors"
          : "p-5 bg-white rounded-xl border border-stone-200/60 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={flat ? "absolute left-4 top-3" : "contents"}>
          {(() => {
            const avatarImg = (
              <img
                src={getAuthorAvatar(post, currentUser)}
                alt={authorName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = AvatarFallback(authorName);
                }}
                className={`w-10 h-10 rounded-full object-cover shrink-0 ${flat ? "bg-[#f5f5f4]" : "border border-stone-200 bg-[#F5F0EB]"}`}
              />
            );
            return authorPath ? (
              <Link to={authorPath} className="shrink-0">
                {avatarImg}
              </Link>
            ) : (
              avatarImg
            );
          })()}
          </div>
          <div className={flat ? "flex items-center gap-1.5 flex-wrap min-w-0" : ""}>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold leading-none ${flat ? "text-[15px] text-[#1c1917]" : "text-sm font-semibold text-stone-900"}`}>
                {authorPath ? (
                  <Link to={authorPath} className="hover:underline">
                    {authorHandle ?? authorName}
                  </Link>
                ) : (
                  (authorHandle ?? authorName)
                )}
              </h3>
              {post.badge && (
                <span className="text-[10px] font-medium px-2 py-0.5 bg-[#F5F0EB] text-stone-600 rounded-full border border-stone-200">
                  {post.badge}
                </span>
              )}
            </div>
            <span className={flat ? "text-[14px] text-[#78716c]" : "text-[11px] text-stone-400"}>
              {flat && "· "}
              {getRelativeTime(
                post.timestamp || post.createdAt || post.created_at,
              )}
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
        <p className={`leading-relaxed whitespace-pre-line ${flat ? "text-[15px] text-[#1c1917]" : "text-sm text-stone-700"}`}>
          {renderWithTags(content, onTagClick, flat)}
        </p>
      )}

      {videoSrc ? (
        <div className={`overflow-hidden mt-2 ${flat ? "rounded-2xl border border-[#e7e5e4]" : "rounded-lg border border-stone-200/60"}`}>
          <video
            src={videoSrc}
            controls
            className="w-full max-h-96 object-contain"
          />
        </div>
      ) : imageSrc ? (
        <div className={`overflow-hidden mt-2 ${flat ? "rounded-2xl border border-[#e7e5e4]" : "rounded-lg border border-stone-200/60"}`}>
          <img
            src={imageSrc}
            alt="Post Attachment"
            className="w-full max-h-80 object-cover"
          />
        </div>
      ) : null}

      <div className={`flex items-center justify-between text-xs ${flat ? "pt-1 -ml-2 max-w-md text-[#78716c]" : "pt-3 border-t border-stone-100 text-stone-500"}`}>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
            flat ? "p-2 rounded-full hover:bg-[#f91880]/10" : ""
          } ${liked ? (flat ? "text-[#f91880]" : "text-[#D97757]") : flat ? "hover:text-[#f91880]" : "hover:text-[#D97757]"}`}
        >
          <Heart size={flat ? 18 : 16} fill={liked ? (flat ? "#f91880" : "#D97757") : "none"} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-lg ${
            flat
              ? `!p-2 !rounded-full ${showComments ? "text-[#A04622] bg-[#A04622]/10" : "hover:text-[#A04622] hover:bg-[#A04622]/10"}`
              : showComments
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
            flat
              ? `!p-2 !rounded-full ${reposted ? "text-[#00ba7c]" : "hover:text-[#00ba7c] hover:bg-[#00ba7c]/10"}`
              : reposted
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
          className={`flex items-center gap-1.5 hover:text-stone-800 transition-colors cursor-pointer ${flat ? "p-2 rounded-full hover:text-[#A04622] hover:bg-[#A04622]/10" : ""}`}
        >
          <Share2 size={18} />
          {!flat && <span>{copied ? "copied!" : "Share"}</span>}
          {flat && copied && <span>copied!</span>}
        </button>

        <button
          onClick={handleBookmark}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            flat
              ? `!p-2 !rounded-full ${bookmarked ? "text-[#A04622]" : "hover:text-[#A04622] hover:bg-[#A04622]/10"}`
              : bookmarked
                ? "text-[#D97757] bg-[#F5F0EB]/60"
                : "hover:text-stone-900 hover:bg-stone-50"
          }`}
        >
          <Bookmark size={18} fill={bookmarked ? (flat ? "#A04622" : "#D97757") : "none"} />
        </button>
      </div>

      {showComments && (
        <div className={`space-y-3 p-3 rounded-xl mt-2 ${flat ? "bg-[#f5f5f4] border border-[#e7e5e4]" : "pt-3 border-t border-stone-100 bg-[#F9F8F6]"}`}>
          {replyingTo && (
            <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
              <span>
                Replying to{" "}
                {getAuthorHandle(replyingTo, currentUser) ??
                  getAuthorName(replyingTo, currentUser)}
              </span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-[#D97757] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentsText}
              onChange={(e) => setCommentsText(e.target.value)}
              placeholder={
                replyingTo ? "Write a reply..." : "Write a comment..."
              }
              className={`flex-1 text-xs px-3 py-2 rounded-lg border outline-none ${flat ? "bg-white text-[#1c1917] placeholder-[#78716c] border-[#e7e5e4] focus:border-[#A04622]" : "bg-white border-stone-200 focus:border-[#D97757]"}`}
            />
            <button
              type="submit"
              className={`px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer ${flat ? "bg-[#A04622] hover:bg-[#8A3A1B]" : "bg-[#D97757] hover:bg-[#C66243]"}`}
            >
              Post
            </button>
          </form>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {commentsList.length === 0 ? (
              <p className="text-[11px] text-stone-400 text-center py-1">
                No Comments yet. Be the First!
              </p>
            ) : (
              commentsList.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  currentUser={currentUser}
                  onReply={setReplyingTo}
                  onDelete={handleDeleteComment}
                  postId={postId}
                  dark={flat}
                />
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;