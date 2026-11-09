import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import api from "../services/api";
import PostCard from "../components/feed/PostCard";
import {
  fetchUserApi,
  followUserApi,
  fetchUserProjectsApi,
  fetchUserExperiencesApi,
  fetchUserPostsApi,
} from "../services/users";
import {
  Loader2,
  MapPin,
  Users,
  UserRoundCheck,
  Folder,
  BriefcaseBusiness,
  Code2,
  TrendingUp,
} from "lucide-react";

const parseSkills = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

export default function AuthorProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [tab, setTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // who is logged in (to hide Follow on your own page and for PostCard)
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/auth/me");
        const u = res.data?.data || res.data?.user || res.data;
        setMe(u);
        if (u?.username === username) navigate("/profile", { replace: true });
      } catch {
        /* ignore */
      }
    })();
  }, [username, navigate]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setError("");
      // posts / projects / experience have their own endpoints, so load them first
      const [p, pr, ex] = await Promise.allSettled([
        fetchUserPostsApi(username),
        fetchUserProjectsApi(username),
        fetchUserExperiencesApi(username),
      ]);
      if (cancelled) return;
      const asList = (r) =>
        r.status === "fulfilled" && Array.isArray(r.value) ? r.value : [];
      if (p.status === "rejected") console.error("posts failed:", p.reason);
      const postList = asList(p);
      setPosts(postList);
      setProjects(asList(pr));
      setTimeline(asList(ex));

      let a = null;
      try {
        a = await fetchUserApi(username);
      } catch (err) {
        console.error(
          "GET /api/users/" + username + " failed:",
          err.response?.status,
          err.response?.data,
        );
        // fall back to the little we know from their posts
        if (postList.length > 0) {
          const first = postList[0];
          a = {
            username: first.username || username,
            full_name: first.full_name,
            avatar_url: first.avatar_url,
            _partial: true,
          };
        } else if (err.response?.status === 404) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        } else {
          if (!cancelled) {
            setError(
              err.response?.data?.message || "Could not load this profile.",
            );
            setLoading(false);
          }
          return;
        }
      }
      if (cancelled) return;
      setAuthor(a);
      setIsFollowing(Boolean(a?.is_following ?? a?.isFollowing));
      setFollowersCount(a?.followers_count ?? a?.followersCount ?? 0);
      setFollowingCount(a?.following_count ?? a?.followingCount ?? 0);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  // If /api/users/{username} didn't include follow info, work it out from the lists
  useEffect(() => {
    if (!author) return;
    let cancelled = false;
    const listOf = (res) => {
      const raw = res.data?.data ?? res.data;
      if (Array.isArray(raw)) return raw;
      return raw?.followers || raw?.following || raw?.users || raw?.items || [];
    };
    const sameUser = (item, name) => {
      const u = item?.follower || item?.following || item?.user || item;
      return (u?.username || u?.user_name) === name;
    };
    (async () => {
      const hasCounts =
        author.followers_count != null && author.following_count != null;
      const hasFlag = author.is_following != null || author.isFollowing != null;
      try {
        if (!hasCounts) {
          const [f, g] = await Promise.allSettled([
            api.get(`/api/users/${username}/followers`),
            api.get(`/api/users/${username}/following`),
          ]);
          if (cancelled) return;
          if (f.status === "fulfilled") {
            const list = listOf(f.value);
            setFollowersCount(list.length);
            if (!hasFlag && me?.username) {
              setIsFollowing(list.some((i) => sameUser(i, me.username)));
            }
          }
          if (g.status === "fulfilled") setFollowingCount(listOf(g.value).length);
        } else if (!hasFlag && me?.username) {
          const f = await api.get(`/api/users/${username}/followers`);
          if (!cancelled) {
            setIsFollowing(listOf(f).some((i) => sameUser(i, me.username)));
          }
        }
      } catch (err) {
        console.error("follow info lookup failed:", err.response?.status);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [author, me, username]);

  const handleToggleFollow = async () => {
    if (followLoading) return;
    const prev = isFollowing;
    const prevCount = followersCount;
    setIsFollowing(!prev);
    setFollowersCount((c) => (prev ? Math.max(0, c - 1) : c + 1));
    setFollowLoading(true);
    try {
      await followUserApi(username, !prev);
    } catch (err) {
      const msg = (err.response?.data?.message || "").toLowerCase();
      if (err.response?.status === 400 && msg.includes("already following")) {
        // server says we already follow: just show that state
        setIsFollowing(true);
        setFollowersCount(prevCount);
        setError("");
      } else if (err.response?.status === 400 && msg.includes("not following")) {
        setIsFollowing(false);
        setFollowersCount(prevCount);
        setError("");
      } else {
        setIsFollowing(prev);
        setFollowersCount(prevCount);
        setError(err.response?.data?.message || "Could not update follow status.");
      }
    } finally {
      setFollowLoading(false);
    }
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

  if (notFound) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto py-16 text-center space-y-2">
          <h1 className="text-xl font-bold text-stone-900">User not found</h1>
          <p className="text-sm text-stone-500">
            There is no builder with the username @{username}.
          </p>
          <Link to="/home" className="text-sm font-semibold text-[#A04622] hover:underline">
            Back to feed
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (!author) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-stone-500 text-sm">
          {error || "Could not load this profile."}
        </div>
      </MainLayout>
    );
  }

  const name = author.full_name || author.name || author.username;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Builder",
  )}&background=A04622&color=fff`;
  const avatar = author.avatar_url || author.avatar || fallbackAvatar;
  const cover =
    author.cover_image_url ||
    author.cover_image ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe";
  const skills = parseSkills(author.skills);
  const isSelf = me?.username && me.username === author.username;

  const tabs = [
    { key: "posts", label: "Posts", count: posts.length },
    { key: "projects", label: "Projects", count: projects.length },
  ];

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* HEADER */}
        <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="relative h-52 md:h-64 bg-stone-100">
            <img src={cover} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute -bottom-12 left-6 ring-4 ring-white rounded-2xl overflow-hidden bg-white shadow-md">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 md:w-28 md:h-28 object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackAvatar;
                }}
              />
            </div>
          </div>

          <div className="pt-16 pb-6 px-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{name}</h1>
              <div className="flex items-center gap-3 text-sm text-stone-500 font-medium flex-wrap">
                <span>
                  @{author.username}
                  {author.headline ? ` · ${author.headline}` : ""}
                </span>
                {author.location && (
                  <span className="flex items-center gap-1 text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md text-xs">
                    <MapPin size={13} className="text-[#A04622]" />
                    {author.location}
                  </span>
                )}
              </div>
            </div>

            {!isSelf && (
              <button
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 cursor-pointer disabled:opacity-60 ${
                  isFollowing
                    ? "bg-stone-100 text-stone-800 hover:bg-stone-200"
                    : "bg-[#A04622] text-white hover:bg-[#85381a]"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {error && (
            <p className="px-6 pb-4 text-xs font-medium text-rose-600">{error}</p>
          )}
          {author._partial && (
            <p className="px-6 pb-4 text-xs text-stone-400">
              Full profile details aren't available right now.
            </p>
          )}
        </section>

        {/* STATS */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { icon: Folder, label: "Projects", value: projects.length },
            { icon: Users, label: "Followers", value: followersCount },
            { icon: UserRoundCheck, label: "Following", value: followingCount },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm"
            >
              <div className="p-3 bg-[#FDF4F0] text-[#A04622] rounded-xl">
                <Icon size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-stone-500 font-medium">{label}</span>
                <strong className="text-xl font-bold text-stone-900">{value}</strong>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* ABOUT */}
            <section className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
                <BriefcaseBusiness size={18} className="text-[#A04622]" />
                <h2>About</h2>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">
                {author.bio || "No bio added yet."}
              </p>
            </section>

            {/* TABS */}
            <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
              <div className="flex overflow-x-auto border-b border-stone-100">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition border-b-2 ${
                      tab === t.key
                        ? "text-[#A04622] border-[#A04622]"
                        : "text-stone-500 border-transparent hover:text-stone-700"
                    }`}
                  >
                    {t.label} <span className="text-xs text-stone-400">({t.count})</span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                {tab === "posts" &&
                  (posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <PostCard key={post.id} post={post} currentUser={me} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-400 text-center py-10">
                      @{author.username} hasn't posted yet.
                    </p>
                  ))}

                {tab === "projects" &&
                  (projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {projects.map((project, i) => {
                        const slug = project._slug || project.slug;
                        return (
                          <Link
                            to={`/projects/${slug}`}
                            key={slug || i}
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
                                {project.description || "No description provided."}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-400 text-center py-10">
                      No projects yet.
                    </p>
                  ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <section className="bg-[#FAF8F5] p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-[#7C2D12] font-bold text-lg font-serif">
                <TrendingUp size={20} className="text-[#A04622]" />
                <h2>Journey</h2>
              </div>
              {timeline.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-200">
                  {timeline.map((item, i) => (
                    <div key={item.id || item._id || i} className="relative space-y-1">
                      <span
                        className={`absolute -left-[23.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#FAF8F5] ${
                          i === 0 ? "bg-[#A04622]" : "bg-stone-400"
                        }`}
                      />
                      <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
                        {item.start_date
                          ? `${new Date(item.start_date).getFullYear()} — ${
                              item.is_current
                                ? "PRESENT"
                                : item.end_date
                                  ? new Date(item.end_date).getFullYear()
                                  : "PRESENT"
                            }`
                          : "PRESENT"}
                      </span>
                      <h3 className="text-sm font-semibold text-stone-900">
                        {item.role || item.title}
                        {item.company_name && (
                          <span className="font-normal text-stone-600"> at {item.company_name}</span>
                        )}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-stone-500 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">No experience listed yet.</p>
              )}
            </section>

            {skills.length > 0 && (
              <section className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
                  <Code2 size={18} className="text-[#A04622]" />
                  <h2>Skills</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-stone-100 border border-stone-200/60 text-stone-700 text-xs font-semibold rounded-lg"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}