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
  CalendarDays,
  Building2,
  Globe,
  Link2,
  MessageSquare,
  UserPlus,
  UserCheck,
  ExternalLink,
} from "lucide-react";


/* ---------- small helpers ---------- */

const monthYear = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const durationText = (start, end) => {
  const a = new Date(start);
  const b = end ? new Date(end) : new Date();
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
  const months = Math.max(
    1,
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()),
  );
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} yr${y > 1 ? "s" : ""}` : "", m ? `${m} mo${m > 1 ? "s" : ""}` : ""]
    .filter(Boolean)
    .join(" ");
};

const linkLabel = (key, url) => {
  const k = String(key).toLowerCase();
  if (k.includes("github")) return "GitHub";
  if (k.includes("linkedin")) return "LinkedIn";
  if (k.includes("twitter") || k === "x") return "X / Twitter";
  if (k.includes("web") || k.includes("site") || k.includes("portfolio")) return "Website";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return key;
  }
};

const Card = ({ title, action, children }) => (
  <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-6 space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-stone-900">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const ShowMore = ({ shown, total, step, onClick, label }) =>
  total > step ? (
    <button
      type="button"
      onClick={onClick}
      className="w-full pt-3 border-t border-stone-100 text-sm font-semibold text-stone-600 hover:text-[#A04622] cursor-pointer"
    >
      {shown ? `Show less` : `Show all ${total} ${label}`}
    </button>
  ) : null;
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
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
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
  const cover = author.cover_image_url || author.cover_image || null;
  const skills = parseSkills(author.skills);
  const isSelf = me?.username && me.username === author.username;
  const authorId = author.user_id || author.id || author._id;
  const links = Object.entries(author.external_links || {}).filter(
    ([, url]) => typeof url === "string" && url.trim(),
  );

  const visibleProjects = showAllProjects ? projects : projects.slice(0, 4);
  const visiblePosts = showAllPosts ? posts : posts.slice(0, 3);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        {/* ---------------- main column ---------------- */}
        <div className="space-y-4 min-w-0">
          {/* TOP CARD */}
          <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            <div className="h-36 md:h-52">
              {cover && (
                <img
                  src={cover}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="px-6 pb-6">
              <div className="-mt-14 md:-mt-16 mb-3">
                <img
                  src={avatar}
                  alt={name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-white bg-white shadow-md"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackAvatar;
                  }}
                />
              </div>

              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{name}</h1>
              {author.headline && (
                <p className="text-base text-stone-700 mt-0.5">{author.headline}</p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-stone-500">
                <span>@{author.username}</span>
                {author.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {author.location}
                  </span>
                )}
                {author.joined_at && (
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} />
                    Joined {author.joined_at}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm font-semibold text-[#A04622]">
                {followersCount.toLocaleString()} {followersCount === 1 ? "follower" : "followers"}
                <span className="text-stone-300 mx-2">•</span>
                {followingCount.toLocaleString()} following
                <span className="text-stone-300 mx-2">•</span>
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </p>

              {!isSelf && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition active:scale-95 cursor-pointer disabled:opacity-60 ${
                      isFollowing
                        ? "border border-stone-300 text-stone-700 hover:bg-stone-50"
                        : "bg-[#A04622] text-white hover:bg-[#85381a]"
                    }`}
                  >
                    {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  {authorId && (
                    <button
                      onClick={() => navigate(`/messages?to=${authorId}`)}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border border-[#A04622] text-[#A04622] hover:bg-[#FDF4F0] transition active:scale-95 cursor-pointer"
                    >
                      <MessageSquare size={16} />
                      Message
                    </button>
                  )}
                </div>
              )}

              {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
              {author._partial && (
                <p className="mt-3 text-xs text-stone-400">
                  Full profile details aren't available right now.
                </p>
              )}
            </div>
          </section>

          {/* ABOUT */}
          <Card title="About">
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {author.bio || "No bio added yet."}
            </p>
          </Card>

          {/* EXPERIENCE */}
          <Card title="Experience">
            {timeline.length > 0 ? (
              <div className="space-y-6">
                {timeline.map((item, i) => {
                  const start = item.start_date;
                  const end = item.is_current ? null : item.end_date;
                  return (
                    <div key={item.id || item._id || i} className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#F5F0EB] text-[#A04622] flex items-center justify-center shrink-0">
                        <Building2 size={22} />
                      </div>
                      <div className="min-w-0 flex-1 pb-6 border-b border-stone-100 last:border-0 last:pb-0">
                        <h3 className="text-sm font-semibold text-stone-900">
                          {item.role || item.title}
                        </h3>
                        {item.company_name && (
                          <p className="text-sm text-stone-700">{item.company_name}</p>
                        )}
                        {start && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            {monthYear(start)} – {item.is_current || !item.end_date ? "Present" : monthYear(item.end_date)}
                            {durationText(start, end) && ` · ${durationText(start, end)}`}
                          </p>
                        )}
                        {item.location && (
                          <p className="text-xs text-stone-500">{item.location}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-stone-600 leading-relaxed mt-2 whitespace-pre-line">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-stone-400">No experience listed yet.</p>
            )}
          </Card>

          {/* PROJECTS */}
          <Card title={`Projects (${projects.length})`}>
            {projects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visibleProjects.map((project, i) => {
                    const slug = project._slug || project.slug;
                    return (
                      <Link
                        to={slug ? `/projects/${slug}` : "#"}
                        key={slug || i}
                        className="group border border-stone-200/80 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-sm transition"
                      >
                        <div className="h-32 bg-stone-100 overflow-hidden">
                          <img
                            src={
                              project.image ||
                              project.cover_image_url ||
                              "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
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
                            {project.tagline || project.description || "No description provided."}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <ShowMore
                  shown={showAllProjects}
                  total={projects.length}
                  step={4}
                  label="projects"
                  onClick={() => setShowAllProjects((v) => !v)}
                />
              </>
            ) : (
              <p className="text-sm text-stone-400">No projects yet.</p>
            )}
          </Card>

          {/* SKILLS */}
          {skills.length > 0 && (
            <Card title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-stone-100 border border-stone-200/60 text-stone-700 text-xs font-semibold rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* ACTIVITY */}
          <Card title={`Activity (${posts.length})`}>
            {posts.length > 0 ? (
              <>
                <div className="space-y-4">
                  {visiblePosts.map((post) => (
                    <PostCard key={post.id} post={post} currentUser={me} />
                  ))}
                </div>
                <ShowMore
                  shown={showAllPosts}
                  total={posts.length}
                  step={3}
                  label="posts"
                  onClick={() => setShowAllPosts((v) => !v)}
                />
              </>
            ) : (
              <p className="text-sm text-stone-400">@{author.username} hasn't posted yet.</p>
            )}
          </Card>
        </div>

        {/* ---------------- right rail ---------------- */}
        <aside className="space-y-4 lg:sticky lg:top-20">
          <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-bold text-stone-900">Profile</h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between gap-3">
                <dt className="text-stone-500">Username</dt>
                <dd className="font-medium text-stone-800 truncate">@{author.username}</dd>
              </div>
              {author.location && (
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-500">Location</dt>
                  <dd className="font-medium text-stone-800 truncate">{author.location}</dd>
                </div>
              )}
              {author.joined_at && (
                <div className="flex justify-between gap-3">
                  <dt className="text-stone-500">Joined</dt>
                  <dd className="font-medium text-stone-800">{author.joined_at}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-bold text-stone-900">Links</h2>
            {links.length > 0 ? (
              <ul className="space-y-2">
                {links.map(([key, url]) => (
                  <li key={key}>
                    <a
                      href={/^https?:\/\//i.test(url) ? url : `https://${url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 text-sm text-stone-700 hover:text-[#A04622]"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        {String(key).toLowerCase().includes("web") ? (
                          <Globe size={15} />
                        ) : (
                          <Link2 size={15} />
                        )}
                        <span className="truncate">{linkLabel(key, url)}</span>
                      </span>
                      <ExternalLink size={13} className="text-stone-400 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400">No links added.</p>
            )}
          </section>
        </aside>
      </div>
    </MainLayout>
  );
}