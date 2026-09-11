import React, { useState, useRef } from "react";
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
} from "lucide-react";

const CreateNewPostCard = ({
  onAddPost,
  userAvatar,
  userName = "TechSage",
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState("image/*");
  const [selectedCategory, setSelectedCategory] = useState("Trending");
  const [isArticleMode, setIsArticleMode] = useState(false);
  const [articleTitle, setArticleTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleMediaChange = (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      setSelectedMedia({
        url: URL.createObjectURL(file),
        type: isVideo ? "video" : "image",
      });
    }
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
    console.log("submit triggered");
    console.log("isArticleMode: ", isArticleMode);

    //     if ((!content.trim() && !selectedMedia) || isSubmitting) return;
    //    if(isArticleMode) {
    //     if(!isArticleMode && !content.trim()) return;
    //     console.log("BLOCKED: Article title is empty!");
    //    }else{
    //     if(!content.trim() && !selectedMedia) return;
    //     console.log("BLOCKED: Article content is empty!");
    //    }
    //     if(!isArticleMode && !content.trim() && !selectedMedia) return;

    //     s
    if (isSubmitting) return;
    if (isArticleMode) {
      if (!articleTitle.trim()) {
        setErrorMessage("Please enter an article title.");
        return;
      }
      if (!content.trim()) {
        setErrorMessage("Please write some content for your article.");
        return;
      }
    } else {
      if (!content.trim() && !selectedMedia) {
        setErrorMessage("Please write something or attach media to post.");
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const newPost = {
        id: Date.now(),
        author: userName,
        badge: "Builder",
        avatar:
          userAvatar ||
          "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
        timestamp: new Date().toISOString(),
        isArticle: isArticleMode,
        isMilestone: isArticleMode,
        isFollowingAuthor: true,
        title: isArticleMode ? articleTitle.trim() : null,
        content: content.trim(),
        image: selectedMedia?.type === "image" ? selectedMedia.url : null,
        video: selectedMedia?.type === "video" ? selectedMedia.url : null,
        likes: 0,
        commentsList: [],
        category: selectedCategory,
      };
      if (onAddPost) await onAddPost(newPost);
      setContent("");
      setArticleTitle("");
      setSelectedMedia(null);
      setIsArticleMode(false);
      setErrorMessage("");
      if (fileInputRef.current) fileInputRef.current.value = null;
      //   setSelectedCategory("Trending")
    } catch (error) {
      console.error("Failed to post Update: ", error);
      setErrorMessage("Failed to post update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="bg-white p-4 rounded-2xl  border border-stone-200/80 shadow-sm space-y-3 font-sans">
      <div className="flex items-center gap-3">
        <img
          src={userAvatar && userAvatar.trim()}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover border border-stone-200/80 bg-[#F7F4F0] shrink-0"
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
                onClick={() => setSelectedMedia(null)}
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
