import { Link, NavLink } from "react-router-dom";
import foundryLogo from "../../assets/foundry-logo.png";

const links = [
  { to: "/manifesto", label: "Manifesto" },
  { to: "/explore", label: "Explore" },
  { to: "/projects", label: "Projects" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/pricing", label: "Pricing & Ecosystem" },
];

export default function PublicHeader() {
  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200/60 bg-[#FAF8F5]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[100px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-12">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <div className="rounded-lg border border-stone-200/50 bg-[#FAF1EB] p-2">
            <img src={foundryLogo} alt="Foundry" className="h-5 w-5 object-contain" />
          </div>
          <span className="text-[22px] font-bold tracking-tight text-stone-900">Foundry</span>
        </Link>

        <div className="hidden items-center gap-9 text-[15px] font-medium lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "text-[#C66A47]" : "text-stone-600 transition-colors hover:text-stone-950"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link to="/signin" className="hidden px-3 py-2 text-[15px] font-medium text-stone-700 hover:text-stone-950 sm:inline-block">
            Sign In
          </Link>
          <Link to="/signin" className="rounded-lg bg-[#C66A47] px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#A8431D]">
            Join Foundry
          </Link>
        </div>
      </div>
    </nav>
  );
}
