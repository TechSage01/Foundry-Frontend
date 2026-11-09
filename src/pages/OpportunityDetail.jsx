import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  Phone,
  Trash2,
  Zap,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout"
import api from "../services/api";
import {
  fetchOpportunityApi,
  deleteOpportunityApi,
} from "../services/opportunities";

const cap = (v) =>
  v ? String(v).charAt(0).toUpperCase() + String(v).slice(1) : "";

const parseSkills = (raw) => {
  if (Array.isArray(raw)) return raw.filter(Boolean).map(cap);
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p.filter(Boolean);
    } catch {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchOpportunityApi(id)
      .then((o) => !cancelled && setOpportunity(o))
      .catch((err) => {
        console.error(
          "Error fetching opportunity:",
          err.response?.status,
          err.message,
        );
        if (!cancelled)
          setError(
            err.response?.status === 404
              ? "This opportunity doesn't exist or was removed."
              : "Could not load this opportunity. The server may be waking up — try again.",
          );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((r) =>
        setMe(r.data?.data?.user || r.data?.data || r.data?.user || r.data),
      )
      .catch((err) => {
        console.error(
          "Error fetching user info:",
          err.response?.status,
          err.message,
        );
      });
  }, []);

  const rawUsername =
    opportunity?.username ||
    opportunity?.user?.username ||
    opportunity?.user?.handle ||
    opportunity?.user?.name ||
    opportunity?.user?.email ||
    opportunity?.user?.id;
  const username =
    rawUsername && String(rawUsername).toLowerCase() !== "unknown"
      ? rawUsername
      : null;

  const isOwner = Boolean(me?.username && username && me.username === username);
  const deadline = opportunity?.deadline_at
    ? new Date(opportunity.deadline_at)
    : null;
  const closed = deadline && deadline.getTime() < Date.now();

  const handleDelete = async () => {
    if (!window.confirm("Delete this opportunity? This can't be undone."))
      return;
    try {
      await deleteOpportunityApi(id);
      navigate("/opportunities");
    } catch (err) {
      setNotice(
        err.response?.data?.message || "Could not delete this opportunity.",
      );
    }
  };
  return (
    <MainLayout>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px" }}>
        <Link to="/opportunities" style={{ display: "inline-flex", gap: 6, alignItems: "center", marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back to opportunities
        </Link>

        {loading && <p>Loading opportunity...</p>}
        {!loading && error && <p>{error}</p>}

        {!loading && opportunity && (
          <article className="opportunity-card" style={{ display: "block" }}>
            <div className="opportunity-company">
              <div className="company-logo"><BriefcaseBusiness size={20} /></div>
              <div className="company-info">
                <div className="company-name">
                  {username ? (
                    <Link to={`/profile/${username}`} className="hover:underline" style={{ color: "inherit" }}>
                      <strong>{opportunity.company_name || opportunity.full_name || `@${username}`}</strong>
                      <span> • @{username}</span>
                    </Link>
                  ) : (
                    <strong>{opportunity.company_name || "Foundry builder"}</strong>
                  )}
                </div>
              </div>
              <div className="opportunity-card-actions">
                <span className="opportunity-type">{opportunity.category}</span>
              </div>
            </div>

            <div className="opportunity-main">
              <h1 style={{ fontSize: 26, fontWeight: 700, margin: "12px 0" }}>{opportunity.title}</h1>
              <p style={{ whiteSpace: "pre-wrap" }}>{opportunity.description}</p>
            </div>

            <div className="opportunity-details">
              <div>
                <span>Compensation</span>
                <strong>{opportunity.compensation || "Not specified"}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>
                  <MapPin size={14} />
                  {opportunity.location_range || cap(opportunity.work_arrangement) || "Not specified"}
                </strong>
              </div>
              <div>
                <span>Deadline</span>
                <strong className="deadline">
                  <CalendarDays size={14} />
                  {deadline
                    ? closed
                      ? "Closed"
                      : deadline.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : "Open"}
                </strong>
              </div>
            </div>

            {parseSkills(opportunity.required_skills).length > 0 && (
              <div className="opportunity-tags">
                {parseSkills(opportunity.required_skills).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}

            {opportunity.screening_prompt && (
              <p style={{ marginTop: 16 }}>
                <strong>Screening question:</strong> {opportunity.screening_prompt}
              </p>
            )}

            {notice && <p style={{ marginTop: 12 }}>{notice}</p>}

            <div className="opportunity-actions">
              <button
                className="quick-apply-button"
                disabled={!opportunity.external_apply_url || closed}
                onClick={() => window.open(opportunity.external_apply_url, "_blank", "noopener,noreferrer")}
              >
                <Zap size={16} />
                {opportunity.external_apply_url ? "Apply" : "Quick Apply"}
              </button>
              <button
                className="profile-apply-button"
                onClick={() => setNotice("Apply with Profile isn't available yet — it's coming soon.")}
              >
                Apply with Profile
              </button>
              {isOwner && (
                <>
                  <button className="profile-apply-button" onClick={() => navigate(`/opportunities/${id}/edit`)}>
                    Edit
                  </button>
                  <button className="profile-apply-button" onClick={handleDelete}>
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              )}
            </div>
          </article>
        )}
      </div>
    </MainLayout>
  );
}

export default OpportunityDetail;



