import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Loader2, MapPin, Search } from "lucide-react";
import foundryLogo from "../assets/foundry-logo.png";
import { fetchOpportunitiesApi } from "../services/opportunities";

export default function OpportunitiesLandingPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    fetchOpportunitiesApi({ page: 1, limit: 30 })
      .then(({ items }) => alive && setOpportunities(items))
      .catch((err) => {
        console.error("Public opportunities failed:", err.response?.status, err.response?.data);
        if (alive) setOpportunities([]);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const visible = opportunities.filter((item) => {
    const text = `${item.title || ""} ${item.description || ""} ${item.category || ""} ${item.location_range || ""}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <nav className="sticky top-0 z-40 border-b border-stone-200/70 bg-[#FAF8F5]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={foundryLogo} alt="Foundry" className="h-7 w-7 object-contain" />
            <span className="text-lg font-bold">Foundry</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
            <Link to="/manifesto" className="hover:text-stone-950">Manifesto</Link>
            <Link to="/explore" className="hover:text-stone-950">Explore</Link>
            <Link to="/projects" className="hover:text-stone-950">Projects</Link>
            <Link to="/pricing" className="hover:text-stone-950">Pricing & Ecosystem</Link>
          </div>
          <Link to="/signin" className="rounded-lg bg-[#C66A47] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A8431D]">
            Join Foundry
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C66A47]">High-signal opportunities</p>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl font-bold tracking-tight sm:text-5xl">Build what matters next.</h1>
        <p className="mt-4 max-w-2xl text-base text-stone-600">Discover grants, roles, collaborations, and programs posted by teams in the Foundry ecosystem.</p>

        <label className="mt-8 flex max-w-xl items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-stone-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search opportunities..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
        </label>

        {loading ? (
          <div className="flex items-center gap-2 py-16 text-sm text-stone-500"><Loader2 size={18} className="animate-spin" /> Loading opportunities...</div>
        ) : visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
            {query ? "No opportunities match your search." : "No public opportunities are available yet."}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {visible.map((item) => (
              <article key={item.id || item._id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1E4DC] text-[#A04622]">
                    <Briefcase size={20} />
                  </div>
                  {item.category && <span className="rounded-full border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-600">{item.category}</span>}
                </div>
                <h2 className="mt-4 text-lg font-bold">{item.title || "Untitled opportunity"}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">{item.description || item.overview || "A new opportunity for builders in the Foundry network."}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-500">
                  {(item.location_range || item.work_arrangement) && (
                    <span className="flex items-center gap-1"><MapPin size={13} /> {item.location_range || item.work_arrangement}</span>
                  )}
                  {item.compensation && <span>{item.compensation}</span>}
                </div>
                <Link to={`/signin`} className="mt-5 inline-flex rounded-lg bg-[#A04622] px-4 py-2 text-sm font-semibold text-white hover:bg-[#85381a]">
                  View & apply
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
