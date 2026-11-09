import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, MessageCircle, Send } from "lucide-react";
import {
  fetchPostsComments,
  createPostsCommentApi,
} from "../services/communities";
const author = (c) =>
  c?.author_username ||
  c?.author_name ||
  c?.username ||
  c?.user?.username ||
  null;

const buildTree = (list) => {
  const hasNested = list.some(
    (c) => Array.isArray(c.replies) && c.replies.length,
  );
  if (hasNested) return list.filter((c) => !c.parent_id);
  const byId = new Map(list.map((c) => [c.id, { ...c, replies: [] }]));
  const roots = [];
  byId.forEach((c) => {
    const parent = c.parent_id && byId.get(c.parent_id);
    if (parent) parent.replies.push(c);
    else roots.push(c);
  });
  return roots;
};
function CommentItem({ comment, depth, onReply, replyingTo, children }) {
  const u = author(comments);
  return (
    <div style={{ marginLeft: depth ? 16 : 0 }} className="space-y-1">
      <div className="rounded-xl bg-white border border-stone-200 px-3 py-2">
        {u && (
          <Link
            to={`/profile/${u}`}
            className="text-[11px] font-semibold text-stone-700 hover:underline"
          >
            @{u}
          </Link>
        )}
        <p className="text-xs text-stone-700 whitespace-pre-wrap">
          {comment.content}
        </p>
        <button
          type="button"
          onClick={() => onReply(replyingTo === comment.id ? null : comment.id)}
          className="text-[11px] text-[#A04622] font-semibold mt-1 cursor-pointer"
        >
          {replyingTo === comment.id ? "Cancel" : "Reply"}
        </button>
      </div>
      {children}
    </div>
  );
}
export default function CommunityComments({
  communityId,
  postId,
  canComment,
  initialCount,
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const list = await fetchPostsComments(communityId, postId);
      setComments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(
        "load comments failed:",
        err.response?.status,
        err.response?.data,
      );
      setError("Could not load comments.");
      setComments([]);
    } finally {
      setLoading(false);
    }
  };
  const toggle = () => {
    const next = !open
    setOpen(next);
    if(next && comments === null) load();
  };
    const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      await createPostCommentApi(communityId, postId, {
        content: text.trim(),
        parent_id: replyingTo,
      });
      setText("");
      setReplyingTo(null);
      await load();
    } catch (err) {
      console.error("comment failed:", err.response?.status, err.response?.data);
      setError(err.response?.data?.message || "Could not post your comment.");
    } finally {
      setSending(false);
    }
  };

  const tree = buildTree(comments || []);
  const count = comments ? comments.length : initialCount;

  const renderNode = (c, depth = 0) => (
    <CommentItem
      key={c.id}
      comment={c}
      depth={depth}
      onReply={setReplyingTo}
      replyingTo={replyingTo}
    >
      {(c.replies || []).map((r) => renderNode(r, depth + 1))}
    </CommentItem>
  );
 return (
    <div className="pt-2">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
      >
        <MessageCircle size={13} />
        {open ? "Hide comments" : count ? `Comments (${count})` : "Comments"}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {loading && <Loader2 size={14} className="animate-spin text-[#A04622]" />}
          {!loading && comments && comments.length === 0 && (
            <p className="text-[11px] text-stone-400 italic">No comments yet.</p>
          )}
          {tree.map((c) => renderNode(c))}

          {error && <p className="text-[11px] text-rose-600">{error}</p>}

          {canComment ? (
            <form onSubmit={send} className="flex gap-2 items-center">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#A04622]"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="bg-[#A04622] text-white rounded-xl px-3 py-1.5 text-xs font-semibold disabled:opacity-50 flex items-center gap-1"
              >
                {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </form>
          ) : (
            <p className="text-[11px] text-stone-400">Join this community to comment.</p>
          )}
        </div>
      )}
    </div>
  );
}