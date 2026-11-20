import { Search, Plus, User, Loader2, FolderKanban, Users, Briefcase, LogOut, Settings } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import foundryLogo from "../../assets/foundry-logo.png";
import { searchAll } from "../../services/search";
import api from "../../services/api";
import { logoutApi } from "../../services/auth";
import { AvatarFallback, getUserAvatar, getUserName } from "../../utils/Avatar";

const GROUPS = [
  { key: "builders", label: "Builders", icon: User },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "communities", label: "Communities", icon: Users },
  { key: "opportunities", label: "Opportunities", icon: Briefcase },
];

const EMPTY = { projects: [], communities: [], builders: [], opportunities: [] };

export default function Header() {
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const requestRef = useRef(0);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  // account menu (profile / settings / log out)
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((res) => setMe(res.data?.data || res.data?.user || res.data))
      .catch(() => {});
  }, []);

  // the API client fires this when a session can no longer be renewed
  useEffect(() => {
    const onExpired = () => navigate("/signin", { replace: true });
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [navigate]);

  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setMenuOpen(false);
    logoutApi();
    window.location.replace("/signin");
  };

  // flat list so the arrow keys can walk through every result
  const flat = useMemo(
    () => GROUPS.flatMap((g) => results[g.key].map((r) => ({ ...r, group: g.key }))),
    [results],
  );

  // debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++requestRef.current;
    const timer = setTimeout(async () => {
      try {
        const data = await searchAll(q);
        if (id === requestRef.current) {
          setResults(data);
          setHighlight(-1);
        }
      } catch (err) {
        console.error("search failed:", err);
      } finally {
        if (id === requestRef.current) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // close when clicking outside
  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (item) => {
    if (!item?.to) return;
    setOpen(false);
    setQuery("");
    setResults(EMPTY);
    navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      e.currentTarget.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[highlight] || flat[0]);
    }
  };

  const showPanel = open && query.trim().length >= 2;
  let flatIndex = -1;

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-[#FAF9F6] border-b border-[#E5E5E5]/60 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3 md:gap-8">
        <div className="md:w-56 flex items-center gap-2 shrink-0">
          <div>
            <img src={foundryLogo} alt="Foundry Logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="hidden sm:inline text-lg font-bold tracking-tight text-[#1F1F1F]">Foundry</span>
        </div>

        <div className="flex-1 max-w-2xl" ref={boxRef}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Search Builders, projects, ideas..."
              className="w-full bg-[#E5E5E5]/30 border border-[#E5E5E5] rounded-xl pl-10 pr-10 py-2 text-sm text-[#1F1F1F] placeholder-[#737373] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D97757] transition-all"
            />
            {loading && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A04622] animate-spin" />
            )}

            {showPanel && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 shadow-xl max-h-[70vh] overflow-y-auto py-2">
                {flat.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-stone-500">
                    {loading ? "Searching..." : `No results for "${query.trim()}"`}
                  </p>
                ) : (
                  GROUPS.map(({ key, label, icon: Icon }) => {
                    const items = results[key];
                    if (!items.length) return null;
                    return (
                      <div key={key} className="py-1">
                        <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          {label}
                        </p>
                        {items.map((item) => {
                          flatIndex += 1;
                          const active = flatIndex === highlight;
                          return (
                            <button
                              key={`${key}-${item.id}`}
                              type="button"
                              onMouseEnter={() => setHighlight(flat.findIndex((f) => f.id === item.id && f.group === key))}
                              onClick={() => go(item)}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-left cursor-pointer transition-colors ${
                                active ? "bg-[#F5F0EB]" : "hover:bg-stone-50"
                              }`}
                            >
                              {key === "builders" ? (
                                <img
                                  src={item.image || AvatarFallback(item.title)}
                                  alt=""
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = AvatarFallback(item.title);
                                  }}
                                  className="w-8 h-8 rounded-full object-cover shrink-0 bg-[#F5F0EB]"
                                />
                              ) : item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-8 h-8 rounded-lg object-cover shrink-0 bg-stone-100"
                                />
                              ) : (
                                <span className="w-8 h-8 rounded-lg bg-[#F1E4DC] text-[#A04622] flex items-center justify-center shrink-0">
                                  <Icon size={15} />
                                </span>
                              )}
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-stone-900 truncate">
                                  {item.title}
                                </span>
                                {item.subtitle && (
                                  <span className="block text-xs text-stone-500 truncate">
                                    {item.subtitle}
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 shrink-0">
          <button
            aria-label="Create new Project or Update"
            onClick={() => navigate("/discover")}
            className="hidden min-[511px]:block p-2 hover:bg-[#E5E5E5]/50 rounded-xl transition-colors text-[#1F1F1F] cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              aria-label="Account menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#E5E5E5]/50 text-[#2D2D2D] flex items-center justify-center cursor-pointer shadow-sm hover:opacity-95 transition-opacity overflow-hidden"
            >
              {me && getUserAvatar(me) ? (
                <img
                  src={getUserAvatar(me)}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = AvatarFallback(getUserName(me));
                  }}
                />
              ) : (
                <User className="w-5 h-5 text-[#2D2D2D]" />
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-stone-200 shadow-xl py-2 z-50">
                {me && (
                  <div className="px-4 pb-2 mb-1 border-b border-stone-100">
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {getUserName(me)}
                    </p>
                    {me.username && (
                      <p className="text-xs text-stone-500 truncate">@{me.username}</p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  <User size={16} /> View profile
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/settings/notifications");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  <Settings size={16} /> Notification settings
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-60"
                >
                  {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loggingOut) setConfirmOpen(false);
          }}
        >
          <div role="dialog" aria-modal="true" className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <LogOut size={20} />
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              {(me?.name || me?.full_name || me?.username || "").split(" ")[0] || "Hey"}, are you sure you want to log out?
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              You will need to sign in again to get back into Foundry.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={loggingOut}
                className="px-4 py-2 rounded-full text-sm font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer disabled:opacity-60"
              >
                Stay signed in
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer disabled:opacity-60"
              >
                {loggingOut && <Loader2 size={14} className="animate-spin" />}
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}