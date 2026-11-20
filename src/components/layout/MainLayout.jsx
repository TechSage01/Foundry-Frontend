import { cloneElement, isValidElement, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home as House,
  Search,
  Mail,
  Bell,
  BriefcaseBusiness,
  Users,
  User,
  Settings,
  Feather,
  Plus,
  CircleEllipsis,
  X,
} from "lucide-react";
import Header from "./Header";
import SearchBox from "./SearchBox";
import AccountChip from "./AccountChip";
import foundryLogo from "../../assets/foundry-logo.png";

/* Responsive shell
   - 1280px and up : labelled left menu | feed | right sidebar
   - 1024 - 1279   : icon menu          | feed | right sidebar
   - 511  - 1023   : icon menu          | feed
   - 510 and below : top bar + bottom tab bar + floating "post" button */

// icons follow X: outline when idle, bold + filled when active
const NAV = [
  { to: "/home", label: "Home", icon: House, fill: true },
  { to: "/discover", label: "Discover", icon: Search },
  { to: "/messages", label: "Messages", icon: Mail },
  { to: "/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
  { to: "/communities", label: "Communities", icon: Users, fill: true },
  { to: "/notifications", label: "Notifications", icon: Bell, fill: true },
  { to: "/profile", label: "Profile", icon: User, fill: true },
];

const NavIcon = ({ item, active, size = 26 }) => {
  const Icon = item.icon;
  return (
    <Icon
      size={size}
      strokeWidth={active ? 2.5 : 1.8}
      fill={active && item.fill ? "currentColor" : "none"}
    />
  );
};

// the five tabs on a phone; everything else lives under "More"
const TABS = [NAV[0], NAV[1], NAV[2], NAV[5]];
const MORE = [NAV[3], NAV[4], NAV[6], { to: "/settings/notifications", label: "Settings", icon: Settings }];

const focusComposer = (navigate, pathname) => {
  const go = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const el = document.querySelector("[data-composer-input]");
    el?.focus?.();
  };
  if (pathname !== "/home") {
    navigate("/home");
    setTimeout(go, 350);
  } else {
    go();
  }
};

function LightLayout({ children, rightSidebar }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917]">
      <Header />

      <div className="max-w-[1280px] mx-auto flex pt-16 max-[510px]:pb-16">
        {/* left menu */}
        <aside className="hidden min-[511px]:block shrink-0 w-[76px] xl:w-[260px]">
          <nav className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col items-center xl:items-stretch gap-1 px-1.5 xl:px-3 py-2 overflow-y-auto">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} title={item.label} className="group flex xl:block justify-center">
                {({ isActive }) => (
                  <span
                    className={`inline-flex items-center gap-5 rounded-full p-3 xl:pr-6 transition-colors group-hover:bg-stone-200/60 ${
                      isActive ? "text-stone-950 font-bold" : "text-stone-800 font-normal"
                    }`}
                  >
                    <NavIcon item={item} active={isActive} />
                    <span className="hidden xl:inline text-[15px] leading-none">{item.label}</span>
                  </span>
                )}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={() => navigate("/settings/notifications")}
              title="Settings"
              className="group flex xl:block justify-center cursor-pointer"
            >
              <span className="inline-flex items-center gap-5 rounded-full px-3 py-3 xl:pr-6 text-stone-800 transition-colors group-hover:bg-stone-200/60">
              <CircleEllipsis size={28} strokeWidth={1.8} />
              <span className="hidden xl:inline text-[17px] leading-none">More</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => focusComposer(navigate, pathname)}
              title="Post"
              className="mt-4 flex items-center justify-center rounded-full bg-[#A04622] hover:bg-[#85381a] text-white font-bold w-[52px] h-[52px] xl:w-[90%] xl:h-[56px] cursor-pointer transition-colors"
            >
              <Feather size={26} className="xl:hidden" />
              <span className="hidden xl:inline text-[17px]">Post</span>
            </button>

            <div className="mt-2 w-full shrink-0">
              <AccountChip />
            </div>
          </nav>
        </aside>

        {/* page content */}
        <main className="flex-1 min-w-0 min-[511px]:border-x min-[511px]:border-stone-200/70">
          {children}
        </main>

        {/* right sidebar (only on pages that provide one, only when there is room) */}
        {rightSidebar && (
          <aside className="hidden lg:block shrink-0 w-[340px] xl:w-[350px] px-4 py-4">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
              {rightSidebar}
            </div>
          </aside>
        )}
      </div>

      {/* phone: floating post button */}
      <button
        type="button"
        onClick={() => focusComposer(navigate, pathname)}
        aria-label="Write a post"
        className="min-[511px]:hidden fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full bg-[#A04622] text-white shadow-lg flex items-center justify-center active:scale-95 transition"
      >
        <Feather size={24} />
      </button>

      {/* phone: bottom tab bar */}
      <nav className="min-[511px]:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-white/95 backdrop-blur border-t border-stone-200 flex items-center justify-around px-2">
        {TABS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={({ isActive }) =>
              `flex-1 h-full flex items-center justify-center ${
                isActive ? "text-stone-950" : "text-stone-500"
              }`
            }
          >
            {({ isActive }) => <NavIcon item={item} active={isActive} size={26} />}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More"
          className="flex-1 h-full flex items-center justify-center text-stone-500 cursor-pointer"
        >
          <CircleEllipsis size={26} strokeWidth={1.8} />
        </button>
      </nav>

      {/* phone: "More" sheet */}
      {moreOpen && (
        <div
          className="min-[511px]:hidden fixed inset-0 z-50 bg-black/40 flex items-end"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-4 pb-6 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2 pb-2">
              <h2 className="text-sm font-bold text-stone-900">More</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            {MORE.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className="flex items-center gap-5 px-3 py-3 rounded-xl text-lg text-stone-800 hover:bg-stone-50"
              >
                <Icon size={24} strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* X-style dark shell, used on the Home feed */
function DarkLayout({ children, rightSidebar }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const right = isValidElement(rightSidebar) ? cloneElement(rightSidebar, { dark: true }) : rightSidebar;

  return (
    <div className="min-h-screen bg-black text-[#e7e9ea]">
      <div className="max-w-[1265px] mx-auto flex justify-center">
        {/* left menu */}
        <header className="hidden min-[511px]:flex shrink-0 w-[88px] xl:w-[275px] justify-end">
          <div className="sticky top-0 h-screen w-[88px] xl:w-[275px] flex flex-col items-center xl:items-stretch px-1.5 xl:px-3 py-1 overflow-y-auto [scrollbar-width:none]">
            <NavLink to="/home" aria-label="Foundry home" className="w-[52px] h-[52px] flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
              <img src={foundryLogo} alt="Foundry" className="w-8 h-8 object-contain" />
            </NavLink>

            <nav className="flex flex-col items-center xl:items-stretch gap-0.5 mt-1">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} title={item.label} className="group flex xl:block justify-center">
                  {({ isActive }) => (
                    <span
                      className={`inline-flex items-center gap-5 rounded-full p-3 xl:pr-7 transition-colors group-hover:bg-white/10 ${
                        isActive ? "text-white font-bold" : "text-[#e7e9ea] font-normal"
                      }`}
                    >
                      <NavIcon item={item} active={isActive} />
                      <span className="hidden xl:inline text-[15px] leading-none">{item.label}</span>
                    </span>
                  )}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => navigate("/settings/notifications")}
                title="More"
                className="group flex xl:block justify-center cursor-pointer"
              >
                <span className="inline-flex items-center gap-5 rounded-full p-3 xl:pr-7 text-[#e7e9ea] transition-colors group-hover:bg-white/10">
                  <CircleEllipsis size={26} strokeWidth={1.8} />
                  <span className="hidden xl:inline text-[15px] leading-none">More</span>
                </span>
              </button>
            </nav>

            <button
              type="button"
              onClick={() => focusComposer(navigate, pathname)}
              title="Post"
              className="mt-4 flex items-center justify-center rounded-full bg-[#eff3f4] hover:bg-white text-black font-bold w-[52px] h-[52px] xl:w-[90%] cursor-pointer transition-colors"
            >
              <Feather size={22} className="xl:hidden" />
              <span className="hidden xl:inline text-[15px]">Post</span>
            </button>

            <div className="mt-3 mb-3 w-full">
              <AccountChip dark />
            </div>
          </div>
        </header>

        {/* feed */}
        <main className="w-full min-[511px]:max-w-[600px] min-w-0 min-[511px]:border-x border-[#2f3336] min-h-screen max-[510px]:pt-12 max-[510px]:pb-14">
          {children}
        </main>

        {/* right column */}
        {rightSidebar && (
          <aside className="hidden lg:block shrink-0 w-[350px] ml-6 xl:ml-8">
            <div className="sticky top-0 h-screen flex flex-col">
              {/* search sits outside the scrolling part so its result list is never clipped */}
              <div className="relative z-30 shrink-0 bg-black py-1.5">
                <SearchBox />
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pb-6 mt-2 [scrollbar-width:none]">
                {right}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* phone: top bar */}
      <div className="min-[511px]:hidden fixed top-0 inset-x-0 z-40 h-12 bg-black/90 backdrop-blur flex items-center justify-between px-4 border-b border-[#2f3336]">
        <button type="button" onClick={() => setMoreOpen(true)} aria-label="Menu" className="w-8 h-8 rounded-full overflow-hidden cursor-pointer">
          <AccountAvatarMini />
        </button>
        <img src={foundryLogo} alt="Foundry" className="w-7 h-7 object-contain" />
        <span className="w-8" />
      </div>

      {/* phone: floating post button */}
      <button
        type="button"
        onClick={() => focusComposer(navigate, pathname)}
        aria-label="Write a post"
        className="min-[511px]:hidden fixed right-4 bottom-[72px] z-40 w-14 h-14 rounded-full bg-[#1d9bf0] text-white shadow-lg flex items-center justify-center active:scale-95 transition"
      >
        <Plus size={26} strokeWidth={2.2} />
      </button>

      {/* phone: bottom tab bar */}
      <nav className="min-[511px]:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-black/95 backdrop-blur border-t border-[#2f3336] flex items-center justify-around px-2">
        {TABS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={({ isActive }) =>
              `flex-1 h-full flex items-center justify-center ${isActive ? "text-white" : "text-[#71767b]"}`
            }
          >
            {({ isActive }) => <NavIcon item={item} active={isActive} size={26} />}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More"
          className="flex-1 h-full flex items-center justify-center text-[#71767b] cursor-pointer"
        >
          <CircleEllipsis size={26} strokeWidth={1.8} />
        </button>
      </nav>

      {/* phone: menu sheet */}
      {moreOpen && (
        <div className="min-[511px]:hidden fixed inset-0 z-50 bg-[#5b708366] flex items-end" onClick={() => setMoreOpen(false)}>
          <div className="w-full bg-black border-t border-[#2f3336] rounded-t-3xl p-4 pb-6 space-y-1" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-2 pb-2">
              <h2 className="text-lg font-extrabold">Menu</h2>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Close" className="p-1.5 rounded-full hover:bg-white/10 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            {[...MORE, NAV[6]].filter((v, i, arr) => arr.findIndex((x) => x.to === v.to) === i).map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="flex items-center gap-5 px-3 py-3 rounded-xl text-xl hover:bg-white/10">
                <Icon size={24} strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
            <div className="pt-2">
              <AccountChip compact dark />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// small avatar for the phone top bar
function AccountAvatarMini() {
  return (
    <img
      src={foundryLogo}
      alt="Account"
      className="block w-full h-full rounded-full object-contain bg-[#FAF8F5] p-1"
    />
  );
}

export default function MainLayout(props) {
  return <LightLayout {...props} />;
}