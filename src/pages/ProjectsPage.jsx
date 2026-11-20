import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Loader2, Search } from "lucide-react";
import foundryLogo from "../assets/foundry-logo.png";
import { getPublishedProjects } from "../services/projectServices";

const readProjects = (data) => {
  const body = data?.data ?? data;
  if (Array.isArray(body)) return body;
  return body?.projects || body?.items || body?.results || [];
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getPublishedProjects()
      .then((data) => alive && setProjects(readProjects(data)))
      .catch((err) => {
        console.error("Projects failed:", err.response?.status, err.response?.data);
        if (alive) setProjects([]);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const visible = projects.filter((project) => {
    const text = `${project.title || project.name || ""} ${project.tagline || project.description || ""} ${project.category || ""}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#1C1917]">
      <nav className="sticky top-0 z-40 border-b border-stone-200/70 bg-[#FAF8F5]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={foundryLogo} alt="Foundry" className="h-7 w-7 object-contain" />
            <span className="font-bold text-lg">Foundry</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
            <Link to="/manifesto" className="hover:text-stone-950">Manifesto</Link>
            <Link to="/explore" className="hover:text-stone-950">Explore</Link>
            <Link to="/opportunities" className="hover:text-stone-950">Opportunities</Link>
            <Link to="/pricing" className="hover:text-stone-950">Pricing & Ecosystem</Link>
          </div>
          <Link to="/signin" className="rounded-lg bg-[#C66A47] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A8431D]">
            Join Foundry
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C66A47]">Public index</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-serif font-bold tracking-tight sm:text-5xl">Builder projects</h1>
        <p className="mt-4 max-w-xl text-base text-stone-600">Explore the products, experiments, and open-source work being built across the Foundry community.</p>

        <label className="mt-8 flex max-w-xl items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-stone-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
        </label>

        {loading ? (
          <div className="flex items-center gap-2 py-16 text-sm text-stone-500"><Loader2 size={18} className="animate-spin" /> Loading projects...</div>
        ) : visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
            {query ? "No projects match your search." : "No published projects yet."}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((project) => {
              const title = project.title || project.name || "Untitled project";
              const slug = project.slug || project.id || project._id;
              const image = project.banner_url || project.bannerImage || project.image_url || project.cover_url;
              return (
                <article key={slug} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                  {image ? (
                    <img src={image} alt="" className="h-44 w-full object-cover" />
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-[#F7E3D7] to-[#EFECE6]" />
                  )}
                  <div className="p-5">
                    {project.category && <p className="mb-2 text-xs font-semibold text-[#C66A47]">{project.category}</p>}
                    <h2 className="text-lg font-bold">{title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">{project.tagline || project.description || "A Foundry builder project."}</p>
                    {slug && (
                      <Link to={`/projects/${slug}`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#A04622] hover:underline">
                        View project <ArrowUpRight size={15} />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
