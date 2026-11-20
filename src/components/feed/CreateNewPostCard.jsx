import React, { useState, useRef, useEffect } from "react";
import {
  Video,
  Image,
  BarChart2,
  Flag,
  X,
  Loader2,
  PenSquare,
  Newspaper,
  AlertCircle,
  Camera,
} from "lucide-react";
import { createPostApi, uploadAvatarApi } from "../../services/posts";
import api from "../../services/api";
import { findBuilders } from "../../services/search";

const isUsableAvatar = (url) =>
  typeof url === "string" &&
  url.trim() !== "" &&
  !url.includes("via.placeholder.com") &&
  // !url.includes("foundry_logo") &&   d
  url !== "https://google.com" &&
  (url.startsWith("http") || url.startsWith("blob:"));
  

const CreateNewPostCard = ({
  flat = false,
  onAddPostSuccess,
  onAvatarChange,
  profile,
  userAvatar,
  userName = "User",
}) => {
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [ avatarSuccess, setAvatarSuccess] = useState("");
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=A04622&color=fff`;
  const avatarSrc =
    avatarFailed || !isUsableAvatar(userAvatar) ? fallbackAvatar : userAvatar;

  useEffect(() => {
    setAvatarFailed(false);
  }, [userAvatar]);

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image is too large. Max size is 5MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const newUrl = await uploadAvatarApi(file, profile);
      if (onAvatarChange) onAvatarChange(newUrl || URL.createObjectURL(file));
      setErrorMessage("");
    } catch (error) {
      console.error("Avatar upload failed:", error);
      console.error("message:", error?.message, "| code:", error?.code);
      console.error(
        "Avatar upload failed:",
        error.response?.status,
        error.response?.data,
      );
      setErrorMessage(
        error.response?.data?.message ||
          "Could not update your profile picture.",
      );
    } finally {
      setAvatarUploading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState("image/*");
  const [selectedCategory, setSelectedCategory] = useState("Trending");
  const [isArticleMode, setIsArticleMode] = useState(false);
  const [articleTitle, setArticleTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [postedMessage, setPostedMessage] = useState("");

  /* ---------- live #hashtag suggestions (GET /api/posts/hashtags/suggest?q=) ---------- */
  const [tagQuery, setTagQuery] = useState(null); // { q, start, caret }
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [tagIndex, setTagIndex] = useState(0);
  const inputRef = useRef(null);

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    if (errorMessage) setErrorMessage("");
    const caret = e.target.selectionStart ?? value.length;
    const m = /(^|\s)([#@])([A-Za-z0-9_]+)$/.exec(value.slice(0, caret));
    if (m) {
      setTagQuery({ q: m[3], mark: m[2], start: caret - m[3].length - 1, caret });
    } else {
      setTagQuery(null);
    }
  };

  useEffect(() => {
    if (!tagQuery) {
      setTagSuggestions([]);
      return;
    }
    let alive = true;
    const t = setTimeout(async () => {
      // hashtags and mentions are the same thing: a #keyword in the post content.
      // So the list mixes tag suggestions with builders whose username / name match.
      const [tagRes, people] = await Promise.all([
        (tagQuery.mark === "@"
          ? Promise.resolve([])
          : api.get("/api/posts/hashtags/suggest", { params: { q: tagQuery.q } }))
          .then((res) => (Array.isArray(res) ? res : res.data?.data ?? res.data))
          .catch((err) => {
            console.warn("hashtag suggest failed:", err.response?.status, err.response?.data);
            return [];
          }),
        findBuilders(tagQuery.q).catch(() => []),
      ]);
      if (!alive) return;

      // the endpoint can return a single string, a list of strings, or objects
      const rows = typeof tagRes === "string"
        ? [tagRes]
        : Array.isArray(tagRes)
          ? tagRes
          : tagRes?.suggestions || tagRes?.hashtags || tagRes?.tags || tagRes?.items ||
            Object.values(tagRes || {}).find(Array.isArray) ||
            (tagRes && typeof tagRes === "object"
              ? Object.values(tagRes).filter((v) => typeof v === "string")
              : []);
      const clean = (v) => String(v).replace(/^#/, "").trim();
      const tags = rows
        .map((x) =>
          typeof x === "string"
            ? { tag: clean(x), count: null }
            : {
                tag: clean(x?.tag || x?.name || x?.hashtag || x?.label || ""),
                count: x?.count ?? x?.posts_count ?? x?.usage_count ?? null,
              },
        )
        .filter((x) => x.tag);

      const seen = new Set(tags.map((x) => x.tag.toLowerCase()));
      const users = people
        .filter((u) => u.username && !seen.has(u.username.toLowerCase()))
        .slice(0, 4)
        .map((u) => ({ tag: u.username, count: null, person: u.name }));

      setTagSuggestions([...tags.slice(0, 5), ...users].slice(0, 8));
      setTagIndex(0);
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [tagQuery?.q, tagQuery?.mark]);

  const pickTag = (tag) => {
    if (!tagQuery) return;
    const mark = tagQuery.mark || "#";
    const next = content.slice(0, tagQuery.start) + mark + tag + " " + content.slice(tagQuery.caret);
    setContent(next);
    setTagQuery(null);
    setTagSuggestions([]);
    const pos = tagQuery.start + tag.length + 2;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange?.(pos, pos);
    });
  };

  // returns true when the key was used by the suggestion list
  const handleTagKeys = (e) => {
    if (!tagSuggestions.length) return false;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setTagIndex((i) => (i + 1) % tagSuggestions.length);
      return true;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setTagIndex((i) => (i - 1 + tagSuggestions.length) % tagSuggestions.length);
      return true;
    }
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      pickTag(tagSuggestions[tagIndex].tag);
      return true;
    }
    if (e.key === "Escape") {
      setTagQuery(null);
      setTagSuggestions([]);
      return true;
    }
    return false;
  };
  const fileInputRef = useRef(null);

  const formatPostTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleMediaChange = (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrorMessage(
        isVideo
          ? "Video is too large. Max size is 50MB."
          : "Image is too large. Max size is 5MB.",
      );
      return;
    }

    setSelectedMedia({
      url: URL.createObjectURL(file),
      type: isVideo ? "video" : "image",
      file,
    });
  };
  const triggerFileInput = (acceptType) => {
    setMediaType(acceptType);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory((prev) => (prev === category ? "Trending" : category));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    const placeholder =
      selectedMedia?.type === "video" ? "Video update" : "Photo update";
    const body = content.trim() || (selectedMedia ? placeholder : "");
    // const title = isArticleMode ? articleTitle.trim() : body.slice(0, 80);
    const title = isArticleMode
      ? articleTitle.trim()
      : content.trim().slice(0, 80) ||
      (selectedMedia?.type === "video" ? "Video update" : "Photo update")
    if (isArticleMode) {
      if (!articleTitle.trim())
        return setErrorMessage("Please enter an article title.");
      if (!content.trim())
        return setErrorMessage("Please write content for your article.");
    } else if (!content.trim() && !selectedMedia) {
      return setErrorMessage("Please write something or attach media to post.");
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      // the backend treats #keyword as both hashtag and mention
      formData.append("content", body.replace(/(^|\s)@([A-Za-z0-9_]+)/g, "$1#$2"));
      formData.append("is_published", true);
      if (selectedCategory && selectedCategory !== "Trending") {
        formData.append("tags", selectedCategory);
      }
      if (selectedMedia?.file) {
        if (selectedMedia.type === "video") {
          formData.append("video", selectedMedia.file);
        } else {
          formData.append("cover_image", selectedMedia.file);
        }
      }
      const newPost = await createPostApi(formData);
      if (onAddPostSuccess) onAddPostSuccess(newPost);

      setContent("");
      setArticleTitle("");
      clearMedia();
      // setSelectedMedia(null);
      setIsArticleMode(false);
      setErrorMessage("");
      setPostedMessage("Your post has been published successfully.");
      setTimeout(() => setPostedMessage(""), 4000);
    } catch (error) {
      console.error("Post creation failed:", error.response?.data || error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to post update. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const clearMedia = () => {
    if (selectedMedia?.url) URL.revokeObjectURL(selectedMedia.url);
    setSelectedMedia(null);
  };
  /* X-style (dark) composer used on the Home feed */
  if (flat) {
    const canPost = Boolean(content.trim() || selectedMedia) && !isSubmitting;
    return (
      <div className="px-4 pt-3 pb-2 border-b border-stone-200 bg-[#FAF8F5] text-[#1C1917] font-sans">
        <div className="flex gap-3">
          <img
            src={avatarSrc}
            alt={userName}
            onError={() => setAvatarFailed(true)}
            className="w-10 h-10 rounded-full object-cover bg-[#F7F4F0] shrink-0"
          />
          <div className="flex-1 min-w-0">
            {isArticleMode && (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="Article title"
                  className="flex-1 bg-transparent text-lg font-bold text-[#1C1917] placeholder-stone-400 outline-none border-b border-stone-200 pb-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsArticleMode(false);
                    setArticleTitle("");
                  }}
                  className="text-stone-500 hover:text-[#1C1917] p-1 cursor-pointer"
                  aria-label="Cancel article"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="relative">
              <textarea
                ref={inputRef}
                data-composer-input
                value={content}
                disabled={isSubmitting}
                onChange={handleContentChange}
                onKeyDown={handleTagKeys}
                rows={isArticleMode ? 5 : Math.min(8, Math.max(2, content.split("\n").length))}
                placeholder={isArticleMode ? "Write your article..." : "What is happening?"}
                className="w-full bg-transparent text-[15px] text-[#1C1917] placeholder-stone-400 outline-none resize-none py-2 leading-snug"
              />
              {tagSuggestions.length > 0 && (
                <ul className="absolute left-0 top-full z-30 w-72 bg-white rounded-xl border border-stone-200 shadow-lg py-1 overflow-hidden">
                  {tagSuggestions.map((t, i) => (
                    <li key={t.tag}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickTag(t.tag);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-[15px] text-left cursor-pointer ${
                          i === tagIndex ? "bg-[#FEF2EC]" : "hover:bg-stone-50"
                        }`}
                      >
                        <span className="font-bold truncate">
                          {tagQuery?.mark === "@" ? "@" : "#"}
                          {t.tag}
                          {t.person && (
                            <span className="ml-2 text-[13px] font-normal text-stone-500">{t.person}</span>
                          )}
                        </span>
                        {t.count != null && (
                          <span className="text-[13px] text-stone-500">{t.count} posts</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedMedia?.url && (
              <div className="relative mt-2 rounded-2xl overflow-hidden border border-stone-200">
                {selectedMedia.type === "video" ? (
                  <video src={selectedMedia.url} controls className="w-full max-h-80 object-cover" />
                ) : (
                  <img src={selectedMedia.url} alt="Attachment preview" className="w-full max-h-80 object-cover" />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  aria-label="Remove attachment"
                  className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mt-2 flex items-center justify-between gap-2 text-[13px] text-[#f4212e] bg-[#f4212e]/10 rounded-xl px-3 py-2">
                <span className="flex items-center gap-2">
                  <AlertCircle size={15} /> {errorMessage}
                </span>
                <button type="button" onClick={() => setErrorMessage("")} aria-label="Dismiss" className="cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            )}
            {postedMessage && (
              <div className="mt-2 flex items-center justify-between gap-2 text-[13px] text-[#00ba7c] bg-[#00ba7c]/10 rounded-xl px-3 py-2">
                <span>{postedMessage}</span>
                <button type="button" onClick={() => setPostedMessage("")} aria-label="Dismiss" className="cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 mt-1 border-t border-stone-200">
              <div className="flex items-center -ml-2 text-[#C66A47]">
                <input
                  type="file"
                  accept={mediaType}
                  ref={fileInputRef}
                  onChange={handleMediaChange}
                  className="hidden"
                />
                {[
                  { label: "Photo", icon: Image, onClick: () => triggerFileInput("image/*") },
                  { label: "Video", icon: Video, onClick: () => triggerFileInput("video/*") },
                  { label: "Write article", icon: Newspaper, onClick: () => setIsArticleMode((v) => !v) },
                ].map(({ label, icon: Icon, onClick }) => (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    aria-label={label}
                    onClick={onClick}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#C66A47]/10 cursor-pointer transition-colors"
                  >
                    <Icon size={19} />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canPost}
                className="px-5 h-9 rounded-full bg-[#C66A47] hover:bg-[#A8431D] text-white font-bold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-4 space-y-3 font-sans ${
        flat ? "border-b border-stone-200/70" : "rounded-2xl border border-stone-200/80 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          disabled={avatarUploading}
          title="Change profile picture"
          className="relative group w-10 h-10 rounded-full shrink-0 cursor-pointer"
        >
          <img
            src={avatarSrc}
            alt={userName}
            onError={() => setAvatarFailed(true)}
            className="w-10 h-10 rounded-full object-cover border border-stone-200/80 bg-[#F7F4F0]"
          />
          <span className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {avatarUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Camera size={14} />
            )}
          </span>
        </button>
        <input
          type="file"
          accept="image/*"
          ref={avatarInputRef}
          onChange={handleAvatarSelect}
          className="hidden"
        />

        <div className="flex-1 flex flex-col min-w-0 items-center bg-[#F7F4F0] px-4 py-2.5 rounded-2xl border border-stone-200/50 focus-within:border-[#A8431D] transition-colors">
          {isArticleMode && (
            <div className="flex items-start justify-between gap-2 w-full pb-2 mb-2 border-b border-stone-200/80">
              <input
                type="text"
                value={articleTitle}
                disabled={isSubmitting}
                onChange={(e) => {
                  setArticleTitle(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Article Title..."
                className="w-full bg-transparent text-base font-semibold text-[#2D2D2D] placeholder-[#737373] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsArticleMode(false)}
                className="text-[#737373] hover:text-[#1F1F1F] p-1 rounded-full transition-colors"
                title="Cancel Article"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="relative flex items-center justify-between gap-2 w-full">
            {isArticleMode ? (
              <textarea
                ref={inputRef}
                data-composer-input
                value={content}
                disabled={isSubmitting}
                onChange={handleContentChange}
                onKeyDown={handleTagKeys}
                placeholder="Write your article content here..."
                rows={4}
                className="w-full bg-transparent text-sm text-[#2D2D2D] placeholder-[#737373] focus:outline-none resize-none"
              />
            ) : (
              <input
                ref={inputRef}
                data-composer-input
                type="text"
                value={content}
                disabled={isSubmitting}
                onChange={handleContentChange}
                placeholder="Share a milestone, metric or what you are building today..."
                className="w-full bg-transparent text-sm text-[#2D2D2D] placeholder-[#737373] focus:outline-none disabled:opacity-50 min-w-0"
                onKeyDown={(e) => {
                  if (handleTagKeys(e)) return;
                  if (e.key === "Enter") handleSubmit(e);
                }}
              />
            )}
            {!isArticleMode && (
              <PenSquare className="w-4 h-4 text-[#737373] shrink-0 ml-2" />
            )}
            {tagSuggestions.length > 0 && (
              <ul className="absolute left-0 top-full mt-2 z-30 w-72 bg-white rounded-xl border border-stone-200 shadow-lg py-1 overflow-hidden">
                {tagSuggestions.map((t, i) => (
                  <li key={t.tag}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickTag(t.tag);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left cursor-pointer ${
                        i === tagIndex ? "bg-[#FDF4F0] text-[#A04622]" : "text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <span className="font-medium truncate">
                        {tagQuery?.mark === "@" ? "@" : "#"}{t.tag}
                        {t.person && (
                          <span className="ml-2 text-[11px] font-normal text-stone-400">
                            {t.person}
                          </span>
                        )}
                      </span>
                      {t.count != null && (
                        <span className="text-[11px] text-stone-400">{t.count} posts</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/*  */}
          {selectedMedia?.url && (
            <div className="relative mt-3 rounded-xl overflow-hidden max-h-48 border border-stone-200/80">
              {selectedMedia.type === "video" ? (
                <video
                  src={selectedMedia.url}
                  controls
                  className="w-full max-h-56 object-cover"
                />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt="Upload Preview"
                  className="w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
      {postedMessage && (
        <div className="text-xs flex items-center justify-between gap-2 border border-emerald-200/70 text-emerald-800 bg-emerald-50 font-medium px-3.5 py-2 rounded-xl">
          <span>{postedMessage}</span>
          <button
            type="button"
            onClick={() => setPostedMessage("")}
            className="text-emerald-500 hover:text-emerald-800 p-1 -mr-1 rounded-lg cursor-pointer shrink-0"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="text-xs flex items-center justify-between gap-2 border border-red-200/60 text-red-700 bg-red-50/70 font-medium px-3.5 py-2 rounded-xl transition-all animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-red-400 hover:text-red-700 p-1 -mr-1 rounded-lg hover:bg-red-100/50 transition-colors cursor-pointer shrink-0"
            title="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-4 sm:gap-6">
          <input
            type="file"
            accept={mediaType}
            ref={fileInputRef}
            onChange={handleMediaChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput("video/*");
            }}
            className="flex items-center gap-2 text-xs font-medium text-[#4A4A4A] hover:text-[#1F1F1F] transition-colors cursor-pointer"
          >
            <Video className="w-4 h-4 text-[#A04622]" />
            <span>Video</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput("image/*");
            }}
            className="flex items-center gap-2 text-xs font-medium text-[#4A4A4A] hover:text-[#1F1F1F] transition-colors cursor-pointer"
          >
            <Image className="w-4 h-4 text-[#A04622]" />
            <span>Photo</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsArticleMode((prev) => !prev);
              setErrorMessage("");
            }}
            className={`flex items-center gap-2 text-xs font-   medium text-[#4A4A4A] hover:text-[#1F1F1F] transition-colors cursor-pointer ${selectedCategory === "Milestones" ? "text-[#0A4622] font-semibold" : "text-[#4A4A4A] hover:text-[#1F1F1F]"}`}
          >
            <Newspaper className="w-4 h-4 text-[#A04622]" />
            <span>{isArticleMode ? "Cancel Article " : "Write Article"}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#A04622] hover:bg-[#8A3A1B] text-white px-5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-sm"
        >
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          <span>
            {isSubmitting
              ? "posting..."
              : isArticleMode
                ? "Publish Article"
                : "Post Update"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default CreateNewPostCard;