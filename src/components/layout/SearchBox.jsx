import { Search, Loader2, FolderKanban, Users, Briefcase, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchAll } from "../../services/search";
import { AvatarFallback } from "../../utils/Avatar";

const GROUPS = [
  { key: "builders", label: "Builders", icon: User },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "communities", label: "Communities", icon: Users },
  { key: "opportunities", label: "Opportunities", icon: Briefcase },
];
const EMPTY = { projects: [], communities: [], builders: [], opportunities: [] };

/* Search in X's style (dark pill). Same search as the top bar. */
export default function SearchBox() {
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const requestRef = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const flat = useMemo(
    () => GROUPS.flatMap((g) => results[g.key].map((r) => ({ ...r, group: g.key }))),
    [results],
  );

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
    <div ref={boxRef} className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-stone-500 group-focus-within:text-[#C66A47]" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search"
        className="w-full h-11 bg-[#F2EFEA] rounded-full pl-12 pr-10 text-[15px] text-[#1C1917] placeholder-stone-400 border border-transparent focus:border-[#C66A47] focus:bg-white outline-none transition-colors"
      />
      {loading && (
        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C66A47] animate-spin" />
      )}

      {showPanel && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-stone-200 shadow-xl max-h-[70vh] overflow-y-auto py-2 z-50">
          {flat.length === 0 ? (
            <p className="px-4 py-6 text-center text-[15px] text-stone-500">
              {loading ? "Searching..." : `No results for "${query.trim()}"`}
            </p>
          ) : (
            GROUPS.map(({ key, label, icon: Icon }) => {
              const items = results[key];
              if (!items.length) return null;
              return (
                <div key={key} className="py-1">
                  <p className="px-4 pt-2 pb-1 text-[13px] font-bold text-stone-500">{label}</p>
                  {items.map((item) => {
                    flatIndex += 1;
                    const active = flatIndex === highlight;
                    return (
                      <button
                        key={`${key}-${item.id}`}
                        type="button"
                        onMouseEnter={() =>
                          setHighlight(flat.findIndex((f) => f.id === item.id && f.group === key))
                        }
                        onClick={() => go(item)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors ${
                          active ? "bg-white/10" : "hover:bg-stone-50"
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
                            className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#F7F4F0]"
                          />
                        ) : item.image ? (
                          <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 bg-[#F7F4F0]" />
                        ) : (
                          <span className="w-10 h-10 rounded-lg bg-[#F7F4F0] text-[#C66A47] flex items-center justify-center shrink-0">
                            <Icon size={18} />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block text-[15px] font-bold text-[#1C1917] truncate">{item.title}</span>
                          {item.subtitle && (
                            <span className="block text-[13px] text-stone-500 truncate">{item.subtitle}</span>
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
  );
}