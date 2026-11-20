import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, MoreHorizontal, Settings, User } from "lucide-react";
import api from "../../services/api";
import { logoutApi } from "../../services/auth";
import { AvatarFallback, getUserAvatar, getUserName } from "../../utils/Avatar";

/* Account at the bottom of the left menu, like X: avatar, name, @username,
   and a menu with profile / settings / log out (with a confirmation). */
export default function AccountChip({ compact = false, dark = false }) {
  // light is the default; pass `dark` only inside the dark layout
  const t = dark
    ? {
        menu: "bg-black border border-[#2f3336] shadow-[0_0_14px_rgba(255,255,255,0.15)]",
        item: "text-[#e7e9ea] hover:bg-white/5",
        chip: "hover:bg-white/10",
        name: "text-[#e7e9ea]",
        sub: "text-[#71767b]",
        dots: "text-[#e7e9ea]",
        avatar: "bg-[#16181c]",
        overlay: "bg-[#5b708366]",
        card: "bg-black border border-[#2f3336]",
        title: "text-[#e7e9ea]",
        text: "text-[#71767b]",
        primary: "bg-[#e7e9ea] hover:bg-white text-black",
        secondary: "border border-[#536471] text-[#e7e9ea] hover:bg-white/10",
      }
    : {
        menu: "bg-white border border-stone-200 shadow-xl",
        item: "text-stone-900 hover:bg-stone-50",
        chip: "hover:bg-stone-200/60",
        name: "text-stone-900",
        sub: "text-stone-500",
        dots: "text-stone-700",
        avatar: "bg-stone-100",
        overlay: "bg-black/40",
        card: "bg-white shadow-2xl",
        title: "text-stone-900",
        text: "text-stone-500",
        primary: "bg-stone-900 hover:bg-black text-white",
        secondary: "border border-stone-300 text-stone-800 hover:bg-stone-50",
      };
  const navigate = useNavigate();
  const ref = useRef(null);
  const [me, setMe] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((res) => setMe(res.data?.data || res.data?.user || res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onExpired = () => navigate("/signin", { replace: true });
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [navigate]);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const name = (me && (getUserName(me) || me.full_name || me.name)) || me?.username || "Account";
  const avatar = (me && getUserAvatar(me)) || AvatarFallback(name);
  const first = String(name).split(" ")[0];

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    await logoutApi();
    navigate("/signin", { replace: true });
  };

  return (
    <div ref={ref} className="relative w-full">
      {open && (
        <div className={`absolute bottom-full left-0 mb-2 w-[260px] rounded-2xl py-2 z-50 ${t.menu}`}>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] font-bold cursor-pointer ${t.item}`}
          >
            <User size={18} /> View profile
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/settings/notifications");
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] font-bold cursor-pointer ${t.item}`}
          >
            <Settings size={18} /> Notification settings
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setConfirm(true);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] font-bold cursor-pointer ${t.item}`}
          >
            <LogOut size={18} /> Log out @{me?.username || "account"}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className={`w-full flex items-center justify-center xl:justify-between gap-3 p-3 rounded-full transition-colors cursor-pointer ${t.chip}`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <img
            src={avatar}
            alt={name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = AvatarFallback(name);
            }}
            className={`w-10 h-10 rounded-full object-cover shrink-0 ${t.avatar}`}
          />
          {!compact && (
            <span className="hidden xl:block min-w-0 text-left leading-tight">
              <span className={`block text-[15px] font-bold truncate ${t.name}`}>{name}</span>
              <span className={`block text-[15px] truncate ${t.sub}`}>@{me?.username || ""}</span>
            </span>
          )}
        </span>
        {!compact && <MoreHorizontal size={18} className={`hidden xl:block shrink-0 ${t.dots}`} />}
      </button>

      {confirm &&
        createPortal(
          <div
            className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 ${t.overlay}`}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !busy) setConfirm(false);
            }}
          >
            <div role="dialog" aria-modal="true" className={`w-full max-w-[340px] rounded-2xl p-8 text-center ${t.card}`}>
              <h2 className={`text-xl font-extrabold ${t.title}`}>Log out of Foundry?</h2>
              <p className={`text-[15px] mt-2 ${t.text}`}>
                {first}, you will need to sign in again to get back in.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={logout}
                  disabled={busy}
                  className={`w-full h-11 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${t.primary}`}
                >
                  {busy && <Loader2 size={15} className="animate-spin" />}
                  Log out
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(false)}
                  disabled={busy}
                  className={`w-full h-11 rounded-full font-bold text-[15px] cursor-pointer ${t.secondary}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}