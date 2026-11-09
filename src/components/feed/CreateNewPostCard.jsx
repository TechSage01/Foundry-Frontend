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

const isUsableAvatar = (url) =>
  typeof url === "string" &&
  url.trim() !== "" &&
  !url.includes("via.placeholder.com") &&
  // !url.includes("foundry_logo") &&   d
  url !== "https://google.com" &&
  (url.startsWith("http") || url.startsWith("blob:"));
  

const CreateNewPostCard = ({
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
  console.log("AVATAR BOX", { userAvatar, avatarFailed, avatarSrc });

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
       setErrorMessage(
        error.response?.data?.message || "Could not update your profile picture.",
      );
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
      : content.trim().slice(0, 80);
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
      formData.append("content", body);
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
  return (
    <div className="bg-white p-4 rounded-2xl  border border-stone-200/80 shadow-sm space-y-3 font-sans">
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
          <div className="flex items-center justify-between gap-2 w-full">
            {isArticleMode ? (
              <textarea
                value={content}
                disabled={isSubmitting}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Write your article content here..."
                rows={4}
                className="w-full bg-transparent text-sm text-[#2D2D2D] placeholder-[#737373] focus:outline-none resize-none"
              />
            ) : (
              <input
                type="text"
                value={content}
                disabled={isSubmitting}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                placeholder="Share a milestone, metric or what you are building today..."
                className="w-full bg-transparent text-sm text-[#2D2D2D] placeholder-[#737373] focus:outline-none disabled:opacity-50 min-w-0"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
              />
            )}
            {!isArticleMode && (
              <PenSquare className="w-4 h-4 text-[#737373] shrink-0 ml-2" />
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
