import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../components/layout/MainLayout";
import api from "../services/api";

import {
  Share2,
  MoreHorizontal,
  Folder,
  Users,
  UserRoundCheck,
  Flame,
  BriefcaseBusiness,
  Code2,
  Loader2,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Camera,
  UploadCloud,
  MapPin,
  TrendingUp,
  Plus,
  Trash2,
  //   Link,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [hasError, setHasError] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [reposts, setReposts] = useState([]);
  const [likedItems, setLikedItems] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [createChooserOpen, setCreateChooserOpen] = useState(false);
  const [projectCoverPreview, setProjectCoverPreview] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    tagLine: "",
    description: "",
    cover_image: null,
    demo_url: "",
    repo_url: "",
    tech_stack: "",
    category: "AI & ML",
  });
  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [followModal, setFollowModal] = useState({
    isOpen: false,
    activeTab: "followers",
    followers: [],
    following: [],
    followersLoaded: false,
    followingLoaded: false,
    loading: false,
    error: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    about: "",
    location: "",
    skills: "",
  });

  const [experienceForm, setExperienceForm] = useState([]);

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const projectCoverInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [imageConfirm, setImageConfirm] = useState({
    isOpen: false,
    type: "",
    file: null,
    preview: "",
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [toast, setToast] = useState({
    // isOpen: false,
    type: "",
    text: "",
  });
  const handleOpenEditWithConfirm = () => {
    setConfirmModal({
      isOpen: true,
      title: "Edit About Section",
      message: "Are you sure you want to edit your About section?",
      onConfirm: () => {
        setIsEditOpen(true);
        setConfirmModal({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
      },
    });
  };

  const handleEditTimelineItem = (item) => {
    setConfirmModal({
      isOpen: true,
      title: "Edit Experience",
      message: "Are you sure you want to edit this Experience/Timeline?",
      onConfirm: () => {
        setConfirmModal({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });
        handleOpenEdit();
      },
    });
  };

  const handleExperienceChange = (index, field, value) => {
    setExperienceForm((prev) =>
      prev.map((exp, i) =>
        i === index ? { ...exp, [field]: value, isDirty: true } : exp,
      ),
    );
  };
  const handleDeleteExperience = async (index, exp) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Experience",
      message: "Are you sure you want to delete this experience?",
      onConfirm: async () => {
        // Close modal first
        setConfirmModal({
          isOpen: false,
          title: "",
          message: "",
          onConfirm: null,
        });

        const expId = exp.id || exp._id;
        if (exp.isNew || !expId) {
          setExperienceForm((prev) => prev.filter((_, i) => i !== index));
          return;
        }
        try {
          await api.delete(`/api/experiences/${expId}`);
          setExperienceForm((prev) => prev.filter((_, i) => i !== index));
          setTimeline((prev) =>
            prev.filter((item) => (item._id || item.id) !== expId),
          );

          setStatusMessage({
            type: "success",
            text: "Experience deleted successfully",
          });
        } catch (error) {
          const backendDetails =
            error.response?.data?.message || "Failed to delete experience";
          setStatusMessage({
            type: "error",
            text: backendDetails,
          });
          console.error("Error deleting experience:", error);
        }
      },
    });
  };
  const CATEGORY_OPTIONS = [
    "AI_ML",
    "Web_Development",
    "Mobile",
    "DevOps",
    "Graphic_Design",
    "Data_Science",
    "Other",
  ];

  const handleCreateProject = async () => {
    if (!projectForm.title.trim() || !projectForm.tagLine.trim()) {
      setCreateError("Project title and tagline is required.");
      return;
    }
    setCreateError("");
    setCreating(true);
    try {
      const data = new FormData();
      data.append("title", projectForm.title.trim());
      data.append("tagline", projectForm.tagLine.trim());
      data.append("description", projectForm.description.trim());
      data.append("category", projectForm.category.trim());
      data.append(
        "tech_stack",
        JSON.stringify(
          projectForm.tech_stack
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      );
      if (projectForm.demo_url)
        data.append("demo_url", projectForm.demo_url.trim());
      if (projectForm.repo_url)
        data.append("repo_url", projectForm.repo_url.trim());
      if (projectForm.cover_image)
        data.append("cover_image", projectForm.cover_image);

      const res = await api.post("/api/projects", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const created = res.data?.data || res.data?.project || res.data;

      setUserProjects((prev) => [created, ...prev]);
      setProjectForm({
        title: "",
        tagline: "",
        description: "",
        tech_stack: "",
        demo_url: "",
        repo_url: "",
        cover_image: null,
        category: "AI & ML",
      });
      setProjectCoverPreview("");
      setCreateProjectOpen(false);
      showToast("success", "Project published successfully.");
    } catch (error) {
      setCreateError(
        error.response?.data?.message || "Failed to create project.",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postForm.title.trim() || !postForm.content.trim()) {
      setCreateError("Title and content are required.");
      return;
    }
    setCreateError("");
    setCreating(true);
    try {
      const data = new FormData();
      data.append("title", postForm.title.trim());
      data.append("content", postForm.content.trim());
      if (postForm.image) data.append("image", postForm.image);

      const res = await api.post("/api/posts", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const created = res.data?.data || res.data?.post || res.data;

      setPosts((prev) => [created, ...prev]);
      setPostForm({ title: "", content: "", image: null });
      setCreatePostOpen(false);
      showToast("success", "Post published successfully.");
    } catch (error) {
      setCreateError(error.response?.data?.message || "Failed to create post.");
    } finally {
      setCreating(false);
    }
  };
  const handleToggleFollow = async () => {
    const targetUserId = user?.id || user?._id;
    if (!targetUserId || followLoading) return;
    const previousState = isFollowing;
    const previousCount = followersCount;
    setIsFollowing(!previousState);
    setFollowersCount((prev) =>
      previousState ? Math.max(0, prev - 1) : prev + 1,
    );
    setFollowLoading(true);
    try {
      if (previousState) {
        await api.delete(`/api/users/${targetUserId}/follow`);
        showToast("success", `You Unfollowed @${user.username || "user"}.`);
      } else {
        await api.post(`/api/users/${targetUserId}/follow`);
        showToast(
          "success",
          `Following @${user.username || "user"} successfully.`,
        );
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setIsFollowing(previousState);
      setFollowersCount(previousCount);
      const errorMsg =
        error.response?.data?.message || "Failed to update follow status";
      showToast("error", errorMsg);
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchFollowList = async (type) => {
    const username = user?.username;
    if (!username) return;
    setFollowModal((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }));
    try {
      const res = await api.get(`/api/users/${username}/${type}`);
      const raw = res.data?.data || res.data?.users || res.data || [];
      const list = Array.isArray(raw) ? raw : raw?.[type] || raw?.users || [];
      const users = list.map(
        (item) => item.follower || item.following || item.user || item,
      );
      setFollowModal((prev) => ({
        ...prev,
        [type]: users,
        [`${type}Loaded`]: true,
      }));
      if (type === "followers") setFollowersCount(users.length);
      else setFollowingCount(users.length);
    } catch (error) {
      showToast("error", `Failed to fetch ${type}`);
      setFollowModal((prev) => ({
        ...prev,
        error:
          error.response?.data?.message ||
          `couldn't load ${type} please try again later`,
      }));
    } finally {
      setFollowModal((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };
  const openFollowModal = (type) => {
    setFollowModal((prev) => ({
      ...prev,
      isOpen: true,
      activeTab: type,
      error: "",
    }));
    fetchFollowList(type);
  };
  const switchFollowTab = (type) => {
    setFollowModal((prev) => ({
      ...prev,
      activeTab: type,
      error: "",
    }));
    const alreadyLoaded =
      type === "followers"
        ? followModal.followersLoaded
        : followModal.followingLoaded;
    if (!alreadyLoaded) fetchFollowList(type);
  };
  const closeFollowModal = (prev) => {
    setFollowModal({
      isOpen: false,
      activeTab: "followers",
      followers: [],
      following: [],
      followersLoaded: false,
      followingLoaded: false,
      error: "",
    });
  };

  // GET Requests: Fetch initial profile & experiences
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/auth/me");
      const userData = res.data?.data || res.data?.user || res.data;

      if (userData) {
        let parsedSkills = userData.skills || [];
        if (typeof parsedSkills === "string") {
          try {
            parsedSkills = JSON.parse(parsedSkills);
          } catch {
            parsedSkills = parsedSkills.split(",").map((s) => s.trim());
          }
        }

        const userAvatar =
          userData.avatar_url ||
          userData.avatarUrl ||
          userData.avatar ||
          userData.profilePicture;

        const userCover = userData.cover_url || userData.cover;

        setUser({
          ...userData,
          name: userData.full_name || userData.name || userData.username || "",
          bio: userData.headline || userData.bio || "",
          about: userData.bio || userData.about || "",
          location: userData.location || "",
          skills: Array.isArray(parsedSkills) ? parsedSkills : [],
          avatar: userAvatar,
          cover: userCover,
        });
        setFollowersCount(
          userData.followersCount ?? userData.followers?.length ?? 0,
        );
        setFollowingCount(
          userData.followingCount ?? userData.following?.length ?? 0,
        );
        setIsFollowing(Boolean(userData.isFollowing));
        const username = userData.username;

        if (username) {
          fetchUserPosts(username);
          try {
            const expRes = await api.get(`/api/experiences/user/${username}`);
            const rawData =
              expRes.data?.data || expRes.data?.experiences || expRes.data;
            let fetchedTimeline = [];
            if (Array.isArray(rawData)) {
              fetchedTimeline = rawData;
            } else if (rawData && typeof rawData === "object") {
              fetchedTimeline = [rawData];
            }

            if (fetchedTimeline.length > 0) {
              setTimeline(fetchedTimeline);
              setExperienceForm(fetchedTimeline);
            }
          } catch (expErr) {
            console.error("Failed to fetch user experiences:", expErr);

            const embeddedTimeline =
              userData.timeline || userData.experience || userData.experiences;
            if (Array.isArray(embeddedTimeline)) {
              setTimeline(embeddedTimeline);
              setExperienceForm(embeddedTimeline);
            }
          }

          // 2. GET Projects
          try {
            const projRes = await api.get(`/api/projects/user/${username}`);
            const fetchedProjects =
              projRes.data?.projects || projRes.data?.data || projRes.data;
            if (Array.isArray(fetchedProjects)) {
              setUserProjects(fetchedProjects);
            }
          } catch (projErr) {
            if (Array.isArray(userData.projects)) {
              setUserProjects(userData.projects);
            }
          }
        }

        setFormData({
          name: userData.full_name || userData.name || "",
          username: userData.username || "",
          bio: userData.headline || userData.bio || "",
          about: userData.bio || userData.about || "",
          location: userData.location || "",
          skills: Array.isArray(parsedSkills)
            ? parsedSkills.join(", ")
            : parsedSkills || "",
        });

        if (userAvatar) setAvatarPreview(userAvatar);
        if (userCover) setCoverPreview(userCover);
      }
    } catch (error) {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUserProfile();
  }, []);
  // LIKES
  useEffect(() => {
    const projectLikes = userProjects.reduce(
      (sum, p) => sum + (p.likes_count || p.likes || 0),
      0,
    );
    const postLikes = posts.reduce(
      (sum, p) => sum + (p.likes_count || p.likes || 0),
      0,
    );
    setTotalLikes(projectLikes + postLikes);
  }, [userProjects, posts]);

  const fetchUserPosts = async (username) => {
    try {
      setPostsLoading(true);
      const res = await api.get(`/api/posts/user/${username}`); // adjust if your route differs
      const fetched = res.data?.data || res.data?.posts || res.data;
      if (Array.isArray(fetched)) setPosts(fetched);
    } catch (error) {
      console.error("Failed to fetch user posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (hasError) setHasError(false);
  };

  const addExperienceField = () => {
    const today = new Date().toISOString().split("T")[0];

    setExperienceForm((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`, // unique temporary key
        isNew: true,
        company_name: "",
        // company_url: "",
        role: "",
        location: "",
        employment_type: "Full-time",
        start_date: today,
        end_date: "",
        is_current: true,
        description: "",
        technologies: [],
        // isNew: true,
      },
    ]);
  };

  const removeExperienceField = (index) => {
    const updated = experienceForm.filter((_, i) => i !== index);
    setExperienceForm(updated);
  };
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 3000);
  };
  const handleQuickImageSelect = (e, type) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast(
        "error",
        "Image is to0 large, Image size should be less than 5MB.",
      );
      return;
    }
    setImageConfirm({
      isOpen: true,
      type,
      file,
      preview: URL.createObjectURL(file),
    });
  };
  const handleProjectCoverSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast(
        "error",
        "Image is too large, Image size should be less than 5MB.",
      );
      return;
    }
    if (projectCoverPreview) URL.revokeObjectURL(projectCoverPreview);
    setProjectForm((p) => ({ ...p, cover_image: file }));
    setProjectCoverPreview(URL.createObjectURL(file));
  };
  const cancelImageChange = async () => {
    if (imageConfirm.preview) URL.revokeObjectURL(imageConfirm.preview);
    setImageConfirm({
      isOpen: false,
      type: "",
      file: null,
      preview: "",
    });
  };
  const confirmImageChange = async () => {
    const { type, file, preview } = imageConfirm;
    if (!file) return;

    try {
      setImageUploading(true);

      const data = new FormData();
      data.append("username", user.username || "");
      data.append("headline", user.bio || "");
      data.append("bio", user.about || "");
      data.append("location", user.location || "");
      data.append(
        "skills",
        JSON.stringify(Array.isArray(user.skills) ? user.skills : []),
      );
      data.append(
        type === "avatar" ? "avatar" : "cover_image",
        imageConfirm.file,
      );

      const res = await api.put("/api/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = res.data?.data || res.data?.user || res.data;
      let newUrl;
      if (type === "avatar") {
        newUrl =
          updated?.avatar ||
          updated?.avatar_url ||
          updated?.avatarUrl ||
          preview;
        setAvatarPreview(newUrl);
        setUser((prev) => ({ ...prev, avatar: newUrl, avatar_url: newUrl }));
        setAvatarFile(null);
      } else {
        newUrl =
          updated?.cover_url ||
          updated?.cover ||
          updated?.coverUrl ||
          updated?.cover_image_url;
        preview;
        setCoverPreview(newUrl);
        setUser((prev) => ({ ...prev, cover: newUrl, cover_url: newUrl }));
        setCoverFile(null);
      }
      if (newUrl !== preview) URL.revokeObjectURL(preview);
      setImageConfirm({
        isOpen: false,
        type: "",
        file: null,
        preview: "",
      });
      showToast(
        "success",
        type === "avatar"
          ? "Profile picture updated successfully."
          : "Cover image updated successfully.",
      );
    } catch (error) {
      showToast(
        "error",
        error.response?.data.message ||
          "An error occurred while updating the image.",
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "avatar") {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else if (type === "cover") {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
    if (hasError) setHasError(false);
  };

  // POST / PUT Request Execution
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", text: "" });

    const cleanStr = (str) =>
      str && String(str).trim() !== "" ? String(str).trim() : null;

    const formatDate = (dateVal) => {
      if (!dateVal) return null;
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
    };

    const todayFormatted = new Date().toISOString().split("T")[0];

    try {
      setSaving(true);
      setHasError(false);

      // const validExperiences = experienceForm.filter(
      //   (exp) =>
      //     exp.company_name?.trim() && (exp.role?.trim() || exp.title?.trim()),
      // );

      // const savedExperiences = await Promise.all(
      const toSave = experienceForm.filter(
        (exp) =>
          (exp.isNew || exp.isDirty) &&
          exp.company_name?.trim() &&
          (exp.role?.trim() || exp.title?.trim()),
      );
      const savedExperiences = [];
      for (const exp of toSave) {
        let empType = cleanStr(exp.employment_type);
        if (empType === "Intern") empType = "Internship";

        const payload = {
          company_name: exp.company_name?.trim(),
          company_url: cleanStr(exp.company_url),
          role: (exp.role || exp.title)?.trim(),
          location: cleanStr(exp.location),
          employment_type: empType || "Full-time",
          start_date: formatDate(exp.start_date) || todayFormatted,
          end_date: exp.is_current ? null : formatDate(exp.end_date),
          is_current: Boolean(exp.is_current),
          description: cleanStr(exp.description),
          technologies: Array.isArray(exp.technologies)
            ? exp.technologies
            : typeof exp.technologies === "string"
              ? exp.technologies
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
        };

        const expId = exp._id || exp.id;
        const isTemporaryId = String(expId).startsWith("temp-");

        let res;
        // Check if item is new or has a temporary key
        if (exp.isNew || isTemporaryId || !expId) {
          res = await api.post("/api/experiences", payload);
        } else {
          res = await api.put(`/api/experiences/${expId}`, payload);
        }

        // Extract object correctly based on payload structure
        savedExperiences.push(
          res.data?.data || res.data?.experience || res.data,
        );
      }
      // );

      // 2. Save remaining profile details
      const data = new FormData();
      data.append("username", formData.username || "");
      data.append("headline", formData.bio || "");
      data.append("bio", formData.about || "");
      data.append("location", formData.location || "");

      const skillsArray =
        typeof formData.skills === "string"
          ? formData.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : formData.skills || [];

      data.append("skills", JSON.stringify(skillsArray));

      if (avatarFile) data.append("avatar", avatarFile);
      if (coverFile) data.append("cover_image", coverFile);

      await api.put("/api/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 3. Directly update state using returned records (DO NOT overwrite via fetchUserProfile)
      // setTimeline((prevTimeline) => {
      //   const savedMap = new Map(
      //     savedExperiences.map((item) => [item._id || item.id, item]),
      //   );

      //   const updatedExisting = prevTimeline.map((item) => {
      //     const itemId = item._id || item.id;
      //     return savedMap.has(itemId) ? savedMap.get(itemId) : item;
      //   });

      //   const brandNewItems = savedExperiences.filter((item) => {
      //     const itemId = item._id || item.id;
      //     return !prevTimeline.some((prev) => (prev._id || prev.id) === itemId);
      //   });

      //   return [...brandNewItems, ...updatedExisting];
      // });
      // setExperienceForm(savedExperiences);
      const idOf = (i) => String(i._id || i.id);
      const savedMap = new Map(savedExperiences.map((i) => [idOf(i), i]));
      const merged = timeline.map((item) => savedMap.get(idOf(item)) ?? item);
      const brandNew = savedExperiences.filter(
        (i) => !timeline.some((t) => idOf(t) === idOf(i)),
      );
      const newTimeline = [...brandNew, ...merged];
      setTimeline(newTimeline);
      setExperienceForm(
        newTimeline.map((item) => ({
          ...item,
          id: item._id || item.id,
          role: item.role || item.title || "",
          isNew: false,
          isDirty: false,
        })),
      );

      setStatusMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      setTimeout(() => {
        setIsEditOpen(false);
        setStatusMessage({ type: "", text: "" });
      }, 1200);
    } catch (error) {
      setHasError(true);
      const backendDetails =
        error.response?.data?.details ||
        error.response?.data?.message ||
        error.message;

      setStatusMessage({
        type: "error",
        text:
          typeof backendDetails === "object"
            ? JSON.stringify(backendDetails)
            : backendDetails || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = () => {
    setHasError(false);
    setStatusMessage({ type: "", text: "" });
    setIsEditOpen(true);
    setExperienceForm(
      timeline.map((item) => ({
        ...item,
        id: item._id || item.id,
        role: item.role || item.title || "",
        isNew: false,
      })),
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#A04622]" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-stone-500">
          Failed to load profile details. Please check your login session.
        </div>
      </MainLayout>
    );
  }

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || user?.username || "Builder",
  )}&background=A04622&color=fff`;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* HERO HEADER */}
        <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="relative h-52 md:h-64 bg-stone-100">
            <img
              src={
                coverPreview ||
                user?.cover ||
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"
              }
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              aria-label="Change cover image"
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-white hover:bg-black/65 bg-black/50 font-semibold text-xs backdrop-blur-sm active:scale-95 rounded-xl transition cursor-pointer"
            >
              <Camera size={14} />
              <span>Change cover</span>
            </button>
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleQuickImageSelect(e, "cover")}
            />
            <div className="absolute -bottom-12 left-6 ring-4 ring-white rounded-2xl overflow-hidden bg-white shadow-md">
              <img
                src={
                  avatarPreview ||
                  user?.avatar_url ||
                  user?.avatar ||
                  fallbackAvatar
                }
                alt={user?.name || user?.username}
                className="w-24 h-24 md:w-28 md:h-28 object-cover"
                onError={(e) => {
                  e.target.src = fallbackAvatar;
                }}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Change profile picture"
                title="Change Profile Picture"
                className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5 px-3 py-1.5 text-white bg-[#A04622] hover:bg-[#85381a] font-semibold text-xs backdrop-blur-sm active:scale-95 rounded-xl transition cursor-pointer"
              >
                <Camera size={14} />
                <span>Change Profile</span>
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleQuickImageSelect(e, "avatar")}
              />
            </div>
          </div>

          <div className="pt-16 pb-6 px-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                  {user?.name ||
                    user?.full_name ||
                    user?.username ||
                    "Anonymous Builder"}
                </h1>
                {user?.badge && (
                  <span className="px-2.5 py-0.5 bg-[#FDF4F0] text-[#A04622] border border-[#f6e2d9] rounded-full text-xs font-semibold">
                    {user.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-500 font-medium flex-wrap">
                <span>
                  @{user?.username || "builder"}{" "}
                  {user?.bio ? `· ${user.bio}` : ""}
                </span>
                {user?.location && (
                  <span className="flex items-center gap-1 text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md text-xs">
                    <MapPin size={13} className="text-[#A04622]" />
                    {user.location}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateChooserOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#A04622] text-[#A04622] hover:bg-[#FDF4F0] rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Create</span>
              </button>
              <button
                onClick={handleOpenEdit}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#A04622] hover:bg-[#85381a] text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Edit2 size={16} />
                <span>Edit Profile</span>
              </button>

              <button
                className="p-2.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl transition cursor-pointer"
                aria-label="Share profile"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="p-3 bg-[#FDF4F0] text-[#A04622] rounded-xl">
              <Folder size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-stone-500 font-medium">
                Active Projects
              </span>
              <strong className="text-xl font-bold text-stone-900">
                {userProjects?.length || user?.stats?.activeProjects || 0}
              </strong>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openFollowModal("followers")}
            className="cursor-pointer flex items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm  text-left hover:border-[#A04622]/40  hover:shadow-md transition active:scale-[0.98]"
          >
            <div
              className="p-2.5 sm:p-3 bg-[#FDF4F0] text-[#A04622] rounded-xl
              shrink-0"
            >
              <Users size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-stone-500 font-medium leading-tight">
                Followers
              </span>
              <strong className="text-xl font-bold text-stone-900">
                {followersCount}
              </strong>
            </div>
          </button>
          <button
            type="button"
            onClick={() => openFollowModal("following")}
            className="cursor-pointer flex items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm  text-left hover:border-[#A04622]/40  hover:shadow-md transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm">
              <div className="p-2.5 sm:p-3 bg-[#FDF4F0] text-[#A04622] rounded-xl">
                <UserRoundCheck size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-stone-500 font-medium leading-tight">
                  Following
                </span>
                <strong className="text-xl font-bold text-stone-900">
                  {followingCount}
                </strong>
              </div>
            </div>
          </button>

          {/* <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="p-2.5 sm:p-3 bg-[#FDF4F0] text-[#A04622] rounded-xl">
              <Flame size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-stone-500 font-medium leading-tight">
                Builder Score
              </span>
              <strong className="text-xl font-bold text-stone-900">
                {user?.stats?.builderScore || 0}
              </strong>
            </div>
          </div> */}
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="p-2.5 sm:p-3 bg-[#FDF4F0] text-[#A04622] rounded-xl shrink-0">
              <Flame size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-stone-500 font-medium leading-tight">
                Total Likes
              </span>
              <strong className="text-xl font-bold text-stone-900">
                {totalLikes}
              </strong>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
                  <BriefcaseBusiness size={18} className="text-[#A04622]" />
                  <h2>About Builder</h2>
                </div>
                <button
                  onClick={handleOpenEditWithConfirm}
                  className="p-1.5 text-stone-400 hover:text-[#A04622] hover:bg-stone-50 rounded-lg transition cursor-pointer"
                  title="Edit About Section"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">
                {user?.about || user?.bio || "No bio added yet."}
              </p>
            </section>

            {/* JOURNEY TIMELINE */}
            {/* JOURNEY TIMELINE */}
            <section className="bg-[#FAF8F5] p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#7C2D12] font-bold text-lg font-serif">
                  <TrendingUp size={20} className="text-[#A04622]" />
                  <h2>Journey Timeline</h2>
                </div>
                <button
                  onClick={handleOpenEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#A04622] hover:bg-[#FDF4F0] border border-[#f6e2d9] rounded-lg transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Experience</span>
                </button>
              </div>

              {timeline && timeline.length > 0 ? (
                <div className="relative pl-6 space-y-8 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-200">
                  {timeline.map((item, index) => (
                    <div
                      key={item.id || item._id || index}
                      className="relative space-y-1.5 group"
                    >
                      <span
                        className={`absolute -left-[23.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#FAF8F5] ${
                          index === 0 ? "bg-[#A04622]" : "bg-stone-400"
                        }`}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                            {item.start_date
                              ? `${new Date(item.start_date).getFullYear()} — ${
                                  item.is_current
                                    ? "PRESENT"
                                    : item.end_date
                                      ? new Date(item.end_date).getFullYear()
                                      : "PRESENT"
                                }`
                              : item.period || "PRESENT"}
                          </span>
                          {item.employment_type && (
                            <span className="px-2 py-0.5 bg-stone-200/60 text-stone-700 text-[10px] font-semibold rounded-md">
                              {item.employment_type}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditTimelineItem(item)}
                            className="p-1.5 text-stone-400 hover:text-[#A04622] hover:bg-white rounded-lg transition cursor-pointer"
                            title="Edit Experience"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteExperience(index, item)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-white rounded-lg transition cursor-pointer"
                            title="Delete Experience"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-semibold text-stone-900">
                        {item.role || item.title}{" "}
                        {item.company_name && (
                          <span className="font-normal text-stone-600">
                            at {item.company_name}
                          </span>
                        )}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-stone-500 leading-relaxed max-w-xl">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  No timeline experience entries listed yet. Click "Add
                  Experience" to add work experience.
                </p>
              )}
            </section>

            {/* CONTENT TABS */}
            <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
              {/* ...unchanged, keep what's already there... */}
            </section>
            {/* CONTENT TABS */}
            <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
              <div className="flex overflow-x-auto border-b border-stone-100">
                {[
                  {
                    key: "projects",
                    label: "Projects",
                    count: userProjects.length,
                  },
                  { key: "posts", label: "Posts", count: posts.length },
                  { key: "reposts", label: "Reposts", count: reposts.length },
                  { key: "likes", label: "Likes", count: likedItems.length },
                  {
                    key: "bookmarks",
                    label: "Bookmarks",
                    count: bookmarks.length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition border-b-2 ${
                      activeTab === tab.key
                        ? "text-[#A04622] border-[#A04622]"
                        : "text-stone-500 border-transparent hover:text-stone-700"
                    }`}
                  >
                    {tab.label}{" "}
                    <span className="text-xs text-stone-400">
                      ({tab.count})
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "projects" &&
                  (userProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userProjects.map((project, index) => (
                        <article
                          key={project._id || project.id || index}
                          className="group border border-stone-100 rounded-xl overflow-hidden hover:border-stone-300 transition"
                        >
                          <div className="h-36 bg-stone-100 overflow-hidden">
                            <img
                              src={
                                project.image ||
                                project.cover_image_url ||
                                "https://images.unsplash.com/photo-1555066931-4365d14bab8c"
                              }
                              alt={project.title || project.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                          <div className="p-3.5 space-y-1">
                            <h3 className="font-semibold text-stone-900 text-sm">
                              {project.title || project.name}
                            </h3>
                            <p className="text-xs text-stone-500 line-clamp-2">
                              {project.description ||
                                "No description provided."}
                            </p>
                            <div className="flex items-center gap-3 pt-1 text-xs text-stone-400">
                              <span>
                                ❤ {project.likes_count || project.likes || 0}
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-400 text-center py-10">
                      No projects yet. Click "Create" to add one.
                    </p>
                  ))}

                {activeTab === "posts" &&
                  (postsLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-[#A04622]" />
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-3">
                      {posts.map((post, index) => (
                        <article
                          key={post._id || post.id || index}
                          className="p-4 border border-stone-100 rounded-xl hover:border-stone-300 transition"
                        >
                          <h3 className="font-semibold text-stone-900 text-sm">
                            {post.title}
                          </h3>
                          <p className="text-xs text-stone-500 line-clamp-3 mt-1">
                            {post.content}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-400 text-center py-10">
                      No posts yet. Click "Create" to write one.
                    </p>
                  ))}

                {activeTab === "reposts" && (
                  <p className="text-sm text-stone-400 text-center py-10">
                    Reposts aren't available yet — this tab will populate once
                    the reposts API is ready.
                  </p>
                )}
                {activeTab === "likes" && (
                  <p className="text-sm text-stone-400 text-center py-10">
                    Liked content isn't available yet — this tab will populate
                    once the likes API is ready.
                  </p>
                )}
                {activeTab === "bookmarks" && (
                  <p className="text-sm text-stone-400 text-center py-10">
                    Bookmarks aren't available yet — this tab will populate once
                    the bookmarks API is ready.
                  </p>
                )}
              </div>
            </section>

            {/* SKILLS & TECH STACK */}
            {Array.isArray(user?.skills) && user.skills.length > 0 && (
              <section className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
                  <Code2 size={18} className="text-[#A04622]" />
                  <h2>Skills & Tech Stack</h2>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-stone-100 border border-stone-200/60 text-stone-700 text-xs font-semibold rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: SHOWCASE SIDEBAR */}
          <aside className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-bold text-stone-900 text-base">
                Active Showcase
              </h2>
              <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                {userProjects?.length || 0} modules
              </span>
            </div>

            {userProjects && userProjects.length > 0 ? (
              <div className="space-y-4">
                {userProjects.slice(0, 3).map((project, index) => (
                  <article
                    className="group border border-stone-100 rounded-xl overflow-hidden hover:border-stone-300 transition"
                    key={project._id || project.id || index}
                  >
                    <div className="h-32 bg-stone-100 overflow-hidden">
                      <img
                        src={
                          project.image ||
                          project.cover_image_url ||
                          "https://images.unsplash.com/photo-1555066931-4365d14bab8c"
                        }
                        alt={project.title || project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-3.5 space-y-1">
                      <h3 className="font-semibold text-stone-900 text-sm">
                        {project.title || project.name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                  </article>
                ))}

                {userProjects.length > 3 && (
                  <Link
                    to="/projects"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition"
                  >
                    <span>See More ({userProjects.length - 3} more)</span>
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-stone-400 py-4 text-center">
                No active projects showcased yet.
              </p>
            )}
          </aside>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-stone-900">
                Edit Profile & Journey
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* SCROLLABLE MODAL BODY */}
            <div className="p-6 overflow-y-auto space-y-5">
              {statusMessage?.text && (
                <div
                  className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-medium ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                      : "bg-rose-50 text-rose-800 border border-rose-200/60"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <form
                id="edit-profile-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A04622]/20 focus:border-[#A04622] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username || ""}
                    onChange={handleChange}
                    placeholder="e.g. janedoe"
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A04622]/20 focus:border-[#A04622] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Short Bio
                  </label>
                  <input
                    type="text"
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleChange}
                    placeholder="Full-Stack Developer & CS Student"
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A04622]/20 focus:border-[#A04622] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    About
                  </label>
                  <textarea
                    name="about"
                    rows={3}
                    value={formData.about || ""}
                    onChange={handleChange}
                    placeholder="Describe your tech stack and background..."
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A04622]/20 focus:border-[#A04622] transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleChange}
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A04622]/20 focus:border-[#A04622] transition"
                  />
                </div>

                {/* DYNAMIC TIMELINE / WORK EXPERIENCE */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-800">
                      Journey Timeline (Experiences)
                    </label>
                    <button
                      type="button"
                      onClick={addExperienceField}
                      disabled={experienceForm.length >= 15}
                      className="flex items-center gap-1 text-xs font-semibold text-[#A04622] hover:underline cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Experience</span>
                    </button>
                  </div>

                  {experienceForm.map((exp, idx) => (
                    <div
                      key={exp.id || exp._id || idx}
                      className="p-3 border border-stone-200 rounded-xl bg-stone-50/40 space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(idx, exp)}
                        className="absolute top-2 right-2 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>

                      <div className="grid grid-cols-2 gap-2 pr-6">
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={exp.company_name || ""}
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              "company_name",
                              e.target.value,
                            )
                          }
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800"
                        />
                        <input
                          type="text"
                          placeholder="Role (e.g. Developer)"
                          value={exp.role || exp.title || ""}
                          onChange={(e) =>
                            handleExperienceChange(idx, "role", e.target.value)
                          }
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={exp.employment_type || "Full-time"}
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              "employment_type",
                              e.target.value,
                            )
                          }
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Freelance">Freelance</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Location (e.g. Remote)"
                          value={exp.location || ""}
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              "location",
                              e.target.value,
                            )
                          }
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={
                            exp.start_date ? exp.start_date.split("T")[0] : ""
                          }
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              "start_date",
                              e.target.value,
                            )
                          }
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800"
                        />
                        <input
                          type="date"
                          disabled={exp.is_current}
                          value={exp.end_date ? exp.end_date.split("T")[0] : ""}
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              "end_date",
                              e.target.value,
                            )
                          }
                          className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800 disabled:opacity-50"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-${idx}`}
                          checked={Boolean(exp.is_current)}
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              "is_current",
                              e.target.checked,
                            )
                          }
                        />
                        <label
                          htmlFor={`current-${idx}`}
                          className="text-xs text-stone-600 cursor-pointer"
                        >
                          Currently working here
                        </label>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Description of role..."
                        value={exp.description || ""}
                        onChange={(e) =>
                          handleExperienceChange(
                            idx,
                            "description",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-medium text-stone-800 resize-none"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills || ""}
                    onChange={handleChange}
                    placeholder="JavaScript, React, Node.js, TailwindCSS"
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A04622]/20 focus:border-[#A04622] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Avatar Image
                  </label>
                  <div className="flex items-center gap-4 p-3 border border-stone-200 rounded-xl bg-stone-50/30">
                    <img
                      src={
                        avatarPreview ||
                        user?.avatar_url ||
                        user?.avatar ||
                        fallbackAvatar
                      }
                      alt="Avatar Preview"
                      className="w-12 h-12 rounded-full object-cover border border-stone-200 shrink-0"
                      onError={(e) => {
                        e.target.src = fallbackAvatar;
                      }}
                    />
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer transition shadow-2xs">
                      <Camera size={14} className="text-stone-500" />
                      <span>Choose Avatar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "avatar")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Cover Image
                  </label>
                  <div className="space-y-2 p-3 border border-stone-200 rounded-xl bg-stone-50/30">
                    {coverPreview && (
                      <img
                        src={coverPreview}
                        alt="Cover Preview"
                        className="w-full h-28 rounded-lg object-cover border border-stone-200"
                      />
                    )}
                    <label className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-semibold rounded-lg cursor-pointer transition shadow-2xs">
                      <UploadCloud size={14} className="text-stone-500" />
                      <span>Upload New Cover</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "cover")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-100 bg-white sticky bottom-0 z-10">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                form="edit-profile-form"
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50 ${
                  hasError
                    ? "bg-amber-700 hover:bg-amber-800"
                    : "bg-[#A04622] hover:bg-[#85381a]"
                }`}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                <span>
                  {saving
                    ? "Saving..."
                    : hasError
                      ? "Try Again"
                      : "Save Changes"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 space-y-4 border border-stone-200">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">
                {confirmModal.title || "Confirm Action"}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    onConfirm: null,
                  })
                }
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#A04622] hover:bg-[#85381a] rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* IMAGE CONFIRMATION MODAL  */}
      {imageConfirm.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 space-y-4 border border-stone-200">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-900">
                {imageConfirm.type === "avatar"
                  ? "Change profile picture"
                  : "Change cover Image"}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to change your{" "}
                {imageConfirm.type === "avatar"
                  ? "profile picture"
                  : "cover image"}
                ?
              </p>
            </div>
            <div className=" flex justify-center">
              <img
                src={imageConfirm.preview}
                alt="New image preview"
                className={
                  imageConfirm.type === "avatar"
                    ? "w-28 h-28 rounded-2xl object-cover border border-stone-200"
                    : "w-full h-28 rounded-xl object-cover border border-stone-200"
                }
              />
            </div>
            <div className=" flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={cancelImageChange}
                disabled={imageUploading}
                className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl font-semibold transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmImageChange}
                disabled={imageUploading}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold  text-white bg-[#A04622] hover:bg-[#85381A] cursor-pointer rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                {imageUploading && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                <span>{imageUploading ? "Uploading" : "Confirm"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* {Toast} */}
      {toast.text && (
        <div
          className={`fixed bottom-4 right-4 z-[80] px-4 py-3 rounded-xl text-xs font-medium shadow-lg border ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toast.text}
        </div>
      )}
      {followModal.isOpen && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={closeFollowModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-stone-200 flex flex-col max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                @{user?.username}
              </h3>
              <button
                type="button"
                onClick={closeFollowModal}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg transition cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stone-100">
              <button
                type="button"
                onClick={() => switchFollowTab("following")}
                className={`flex-1 py-3 text-sm font-semibold transition ${
                  followModal.activeTab === "following"
                    ? "text-[#A04622] border-b-2 border-[#A04622]"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                Following {followingCount}
              </button>
              <button
                type="button"
                onClick={() => switchFollowTab("followers")}
                className={`flex-1 py-3 text-sm font-semibold transition ${
                  followModal.activeTab === "followers"
                    ? "text-[#A04622] border-b-2 border-[#A04622]"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                Followers {followersCount}
              </button>
            </div>

            {/* Body */}
            <div className="p-3 overflow-y-auto">
              {followModal.loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-[#A04622]" />
                </div>
              ) : followModal.error ? (
                <p className="text-sm text-stone-500 text-center py-10">
                  {followModal.error}
                </p>
              ) : (
                (() => {
                  const list =
                    followModal.activeTab === "followers"
                      ? followModal.followers
                      : followModal.following;

                  if (list.length === 0) {
                    return (
                      <p className="text-sm text-stone-400 text-center py-10">
                        {followModal.activeTab === "followers"
                          ? "No followers yet."
                          : "Not following anyone yet."}
                      </p>
                    );
                  }

                  return (
                    <ul className="space-y-1">
                      {list.map((u, index) => {
                        const name =
                          u.full_name || u.name || u.username || "Builder";
                        const avatar =
                          u.avatar_url ||
                          u.avatar ||
                          u.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=A04622&color=fff`;

                        return (
                          <li
                            key={u.id || u._id || index}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition"
                          >
                            <Link
                              to={`/profile/${u.username}`}
                              onClick={closeFollowModal}
                              className="flex items-center gap-3 min-w-0 flex-1"
                            >
                              <img
                                src={avatar}
                                alt={name}
                                className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-stone-900 truncate">
                                  {name}
                                </p>
                                <p className="text-xs text-stone-500 truncate">
                                  @{u.username}
                                </p>
                              </div>
                            </Link>
                            <span className="shrink-0 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 rounded-lg">
                              {followModal.activeTab === "followers"
                                ? "Follower"
                                : "Following"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}
      {/* CREATE CHOOSER */}
      {createChooserOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setCreateChooserOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 space-y-3 border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-stone-900">
              What do you want to create?
            </h3>
            <button
              type="button"
              onClick={() => {
                setCreateChooserOpen(false);
                setCreateProjectOpen(true);
              }}
              className="w-full flex items-center gap-3 p-3 border border-stone-200 rounded-xl hover:border-[#A04622]/40 hover:bg-[#FDF4F0] transition text-left"
            >
              <Folder size={18} className="text-[#A04622]" />
              <div>
                <p className="text-sm font-semibold text-stone-900">Project</p>
                <p className="text-xs text-stone-500">
                  A build with a title, description and links.
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreateChooserOpen(false);
                setCreatePostOpen(true);
              }}
              className="w-full flex items-center gap-3 p-3 border border-stone-200 rounded-xl hover:border-[#A04622]/40 hover:bg-[#FDF4F0] transition text-left"
            >
              <Edit2 size={18} className="text-[#A04622]" />
              <div>
                <p className="text-sm font-semibold text-stone-900">Post</p>
                <p className="text-xs text-stone-500">
                  A quick update, write-up, or announcement.
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setCreateChooserOpen(false)}
              className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {createProjectOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6 space-y-4 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">
                Post New Project
              </h3>
              <button
                onClick={() => {
                  if (projectCoverPreview)
                    URL.revokeObjectURL(projectCoverPreview);
                  setProjectCoverPreview("");
                  setCreateProjectOpen(false);
                }}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200/60 text-xs font-medium">
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Project title"
                  value={projectForm.title}
                  onChange={(e) =>
                    setProjectForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tagline  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous runtime engine"
                  value={projectForm.tagLine}
                  onChange={(e) =>
                    setProjectForm((p) => ({ ...p, tagLine: e.target.value }))
                  }
                  className="w-full bg-stone-50/50 p-3 rounded-xl border border-stone-200 "
                />
              </div>
              <div>
                <label className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded-xl cursor-pointer text-xs font-semibold text-stone-700">
                  Project Display Image
                </label>
                <button
                  type="button"
                  onClick={() => projectCoverInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 hover:border-stone-400 transition cursor-pointer overflow-hidden"
                >
                  {projectCoverPreview ? (
                    <img
                      src={projectCoverPreview}
                      alt="Cover Preview"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                      <UploadCloud size={14} />
                      <p className="text-sm font-medium text-stone-600">
                         Click to Upload Project cover image
                      </p>
                      <p className="text-xs text-stone-400">
                        PNG, JPG, WebP up to 5MB
                      </p>
                    </div>
                  )}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProjectCoverSelect}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                  Demo URL / Video Link
                </label>
                <input
                  type="text"
                  placeholder="Live URL"
                  value={projectForm.demo_url}
                  onChange={(e) =>
                    setProjectForm((p) => ({
                      ...p,
                      demo_url: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  placeholder="Github Repository URL"
                  value={projectForm.repo_url}
                  onChange={(e) =>
                    setProjectForm((p) => ({
                      ...p,
                      repo_url: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5 ">
                  Technologies used (comma seperated)
                </label>
                <input
                  type="text"
                  placeholder="Technologies (comma separated)"
                  value={projectForm.technologies}
                  onChange={(e) =>
                    setProjectForm((p) => ({
                      ...p,
                      technologies: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Category
                </label>
                <select
                  value={projectForm.category}
                  onChange={(e) =>
                    setProjectForm((p) => ({
                      ...p,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide Project details..."
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-stone-50/50 p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#A04622] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
              <button
                onClick={() => {
                  if (projectCoverPreview) URL.revokeObjectURL(projectCoverPreview);
                  setProjectCoverPreview("");
                  setCreateProjectOpen(false);
                }}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#A04622] hover:bg-[#85381a] rounded-xl disabled:opacity-50"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                <span>{creating ? "Publishing..." : "Publish Project"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE POST MODAL */}
      {createPostOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl p-6 space-y-4 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">New Post</h3>
              <button
                onClick={() => setCreatePostOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200/60 text-xs font-medium">
                {createError}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Post title"
                value={postForm.title}
                onChange={(e) =>
                  setPostForm((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm"
              />
              <textarea
                rows={5}
                placeholder="What's on your mind?"
                value={postForm.content}
                onChange={(e) =>
                  setPostForm((p) => ({ ...p, content: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm resize-none"
              />
              <label className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded-xl cursor-pointer text-xs font-semibold text-stone-700">
                <UploadCloud size={14} />
                <span>
                  {postForm.image ? postForm.image.name : "Image (optional)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setPostForm((p) => ({ ...p, image: e.target.files[0] }))
                  }
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCreatePostOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#A04622] hover:bg-[#85381a] rounded-xl disabled:opacity-50"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                <span>{creating ? "Publishing..." : "Publish Post"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Profile;
