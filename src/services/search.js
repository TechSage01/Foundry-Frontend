import api from "./api";
import { getUserAvatar, getUserName } from "../utils/Avatar";

/* One global search that works with the endpoints that exist today.
   - Projects, communities and opportunities are fetched once (cached for a
     minute) and filtered in the browser.
   - Builders use the server search:  GET /api/users/search?q=
   When the backend gets a real  GET /api/search?q=  endpoint, only
   `searchAll` below needs to change. */

const CACHE_MS = 60 * 1000;
const cache = {};

const arrayFrom = (res, ...keys) => {
  const body = res?.data?.data ?? res?.data;
  if (Array.isArray(body)) return body;
  for (const k of keys) if (Array.isArray(body?.[k])) return body[k];
  if (Array.isArray(body?.items)) return body.items;
  return [];
};

const cached = async (key, loader) => {
  const hit = cache[key];
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.items;
  try {
    const items = await loader();
    cache[key] = { at: Date.now(), items };
    return items;
  } catch (err) {
    console.warn(`search: could not load ${key}:`, err.response?.status);
    return hit?.items || [];
  }
};

const loadProjects = () =>
  cached("projects", async () =>
    arrayFrom(await api.get("/api/projects"), "projects"),
  );
const loadCommunities = () =>
  cached("communities", async () =>
    arrayFrom(await api.get("/api/communities"), "communities"),
  );
const loadOpportunities = () =>
  cached("opportunities", async () =>
    arrayFrom(await api.get("/api/opportunities"), "opportunities"),
  );

// everyone, from the paginated user list (GET /api/users)
const loadUsers = () =>
  cached("users", async () => {
    let res;
    try {
      res = await api.get("/api/users", { params: { page: 1, limit: 100 } });
    } catch {
      res = await api.get("/api/users");
    }
    console.log("users list:", res.data);
    return arrayFrom(res, "users");
  });

// people you follow / who follow you (these endpoints already exist)
const loadPeople = () =>
  cached("people", async () => {
    const meRes = await api.get("/api/auth/me");
    const me = meRes.data?.data || meRes.data?.user || meRes.data;
    if (!me?.username) return [];
    const [a, b] = await Promise.all([
      api.get(`/api/users/${me.username}/following`).catch(() => null),
      api.get(`/api/users/${me.username}/followers`).catch(() => null),
    ]);
    const rows = [
      ...(a ? arrayFrom(a, "following", "users") : []),
      ...(b ? arrayFrom(b, "followers", "users") : []),
    ];
    return rows.map(
      (r) => r.follower || r.following || r.followee || r.followed || r.user || r,
    );
  });

const asList = (v) => (Array.isArray(v) ? v : []);

const norm = (v) =>
  String(v ?? "")
    .toLowerCase()
    .trim();

const textOf = (...parts) =>
  parts
    .flat()
    .map((p) => (Array.isArray(p) ? p.join(" ") : norm(p)))
    .join(" ");

const score = (title, haystack, q) => {
  const t = norm(title);
  if (t === q) return 4;
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  if (haystack.includes(q)) return 1;
  return 0;
};

const techList = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [v];
    } catch {
      return v.split(",");
    }
  }
  return [];
};

const rank = (items, q, toResult, haystackOf, titleOf) =>
  items
    .map((it) => ({ it, s: score(titleOf(it), haystackOf(it), q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => toResult(x.it));

/* Builder lookup for pickers (e.g. "Add teammates"). Works even while
   GET /api/users/search is weak: also checks the user list, an exact
   username and the people you follow. Returns [{id, name, username, avatar}]. */
export const findBuilders = async (rawQuery) => {
  // people type "@name" or "#name"; the mark is not part of the name
  const query = String(rawQuery ?? "").trim().replace(/^[@#]+/, "");
  const q = norm(query);
  const [rawUsers, rawPeople, exact, rawServer] = await Promise.all([
    loadUsers(),
    loadPeople(),
    q && /^[\w.-]{3,}$/.test(query)
      ? api
          .get(`/api/users/${encodeURIComponent(query)}`)
          .then((res) => res.data?.data?.user || res.data?.data || res.data?.user || null)
          .catch(() => null)
      : Promise.resolve(null),
    q
      ? api
          .get("/api/users/search", { params: { q: query } })
          .then((res) => arrayFrom(res, "users", "results", "builders"))
          .catch(() => [])
      : Promise.resolve([]),
  ]);
  const allUsers = asList(rawUsers);
  const people = asList(rawPeople);
  const server = asList(rawServer);
  const out = [];
  const add = (u) => {
    if (!u?.username) return;
    if (out.some((x) => norm(x.username) === norm(u.username))) return;
    out.push({
      id: u.id || u._id || u.user_id || "",
      name: u.full_name || u.name || getUserName(u) || u.username,
      username: u.username,
      avatar: getUserAvatar(u),
    });
  };
  if (q) {
    server.forEach(add);
    if (exact) add(exact);
  }
  // just "@" typed: offer a few builders to pick from
  [...allUsers, ...people]
    .filter((u) => u?.username && (!q || textOf(u.username, u.full_name, u.name).includes(q)))
    .forEach(add);
  return out.slice(0, 8);
};

export const searchAll = async (query) => {
  const q = norm(query);
  if (q.length < 2) return { projects: [], communities: [], builders: [], opportunities: [] };

  const [rawProjects, rawCommunities, rawOpportunities, rawPeople, rawUsers, exact, rawBuilders] = await Promise.all([
    loadProjects(),
    loadCommunities(),
    loadOpportunities(),
    loadPeople(),
    loadUsers(),
    // exact username, e.g. "techsage" -> GET /api/users/techsage
    /^[\w.-]{3,}$/.test(query.trim())
      ? api
          .get(`/api/users/${encodeURIComponent(query.trim())}`)
          .then((res) => res.data?.data?.user || res.data?.data || res.data?.user || null)
          .catch(() => null)
      : Promise.resolve(null),
    api
      .get("/api/users/search", { params: { q: query.trim() } })
      .then((res) => {
        console.log("builders search:", res.data);
        return arrayFrom(res, "users", "results", "builders");
      })
      .catch((err) => {
        console.warn("builders search failed:", err.response?.status, err.response?.data);
        return [];
      }),
  ]);

  const projects = asList(rawProjects);
  const communities = asList(rawCommunities);
  const opportunities = asList(rawOpportunities);
  const people = asList(rawPeople);
  const allUsers = asList(rawUsers);
  const builders = asList(rawBuilders);

  // fallback while the user search is limited: people who authored projects
  const seen = new Set(builders.map((u) => norm(u.username)));
  const authors = projects
    .map((p) => {
      const a = [p.author, p.user, p.owner].find((x) => x && typeof x === "object") || {};
      return {
        id: a.id || a._id || p.author_id || p.user_id,
        username: a.username || p.author_username || p.username,
        full_name: a.full_name || a.name || p.author_name || p.author_fullname,
        avatar_url: a.avatar_url || p.author_avatar_url,
      };
    })
    .filter((a) => a.username && !seen.has(norm(a.username)))
    .filter((a) => textOf(a.username, a.full_name).includes(q));
  const merged = [...builders];
  const addUser = (u) => {
    if (u?.username && !merged.some((x) => norm(x.username) === norm(u.username))) merged.push(u);
  };
  if (exact?.username) addUser(exact);
  allUsers
    .filter((u) => u?.username && textOf(u.username, u.full_name, u.name).includes(q))
    .forEach(addUser);
  people
    .filter((u) => u?.username && textOf(u.username, u.full_name, u.name).includes(q))
    .forEach(addUser);
  authors.forEach(addUser);

  return {
    projects: rank(
      projects,
      q,
      (p) => ({
        type: "project",
        id: p.id || p._id,
        title: p.title || "Untitled project",
        subtitle: p.tagline || p.category || "",
        image: p.cover_image_url || p.cover_image || null,
        to: p.slug ? `/projects/${p.slug}` : null,
      }),
      (p) => textOf(p.title, p.tagline, p.description, p.category, techList(p.tech_stack)),
      (p) => p.title,
    )
      .filter((r) => r.to)
      .slice(0, 4),

    communities: rank(
      communities,
      q,
      (c) => ({
        type: "community",
        id: c.id || c._id,
        title: c.name || c.title || "Community",
        subtitle: c.category || c.description || "",
        image: c.avatar_url || c.image_url || null,
        to: c.slug ? `/communities/${c.slug}` : null,
      }),
      (c) => textOf(c.name, c.title, c.description, c.category),
      (c) => c.name || c.title,
    )
      .filter((r) => r.to)
      .slice(0, 4),

    opportunities: rank(
      opportunities,
      q,
      (o) => ({
        type: "opportunity",
        id: o.id || o._id,
        title: o.title || "Opportunity",
        subtitle: [o.company, o.category].filter(Boolean).join(" · "),
        image: null,
        to: `/opportunities/${o.id || o._id}`,
      }),
      (o) => textOf(o.title, o.company, o.description, o.category, o.required_skills),
      (o) => o.title,
    ).slice(0, 4),

    builders: merged
      .filter((u) => u?.username)
      .slice(0, 5)
      .map((u) => ({
        type: "builder",
        id: u.id || u._id || u.user_id || u.username,
        title: getUserName(u),
        subtitle: `@${u.username}`,
        image: getUserAvatar(u),
        to: `/profile/${u.username}`,
      })),
  };
};