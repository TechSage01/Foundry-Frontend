import React ,{ useState } from "react";
import foundryLogo from "../assets/foundry-logo.png";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

const ManifestoPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 const handleGithubAuth = () => {
    setLoading(true);
    setError("");
    try {
      // Small timeout ensures UI updates loading state before browser redirect triggers
      setTimeout(() => {
        window.location.href = `${API_URL}/api/auth/github`;
      }, 150);
    } catch (err) {
      setLoading(false);
      setError("Failed to initialize authentication. Please try again.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] font-sans selection:bg-[#D87A56]/20">
        <nav className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/60 px-4 sm:px-6 py-3.5 max-w-7xl mx-auto">
          {/* Header Top Row */}
          <div className="flex items-center justify-between w-full">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2">
              <div className="bg-[#FAF1EB] p-1.5 rounded-lg border border-stone-200/50">
                <img
                  src={foundryLogo}
                  alt="Foundry"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="font-semibold text-lg tracking-tight text-stone-900">
                Foundry
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-7 text-xs font-medium text-stone-600">
              <a
                href="/manifesto"
                className="font-bold text-[#C66A47] hover:text-stone-900 transition-colors"
              >
                Manifesto
              </a>
              <a
                href="/explore"
                className="hover:text-stone-900 transition-colors"
              >
                Explore
              </a>
              <a
                href="/projects"
                className="hover:text-stone-900 transition-colors"
              >
                Projects
              </a>
              <a
                href="/opportunities"
                className="hover:text-stone-900 transition-colors"
              >
                Opportunities
              </a>
              <a
                href="#pricing"
                className="hover:text-stone-900 transition-colors"
              >
                Pricing & Ecosystem
              </a>
            </div>

            {/* Action Buttons & Hamburger Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/signin"
                className="text-xs font-medium text-stone-700 hover:text-stone-900 px-2 sm:px-3 py-2 hidden sm:inline-block"
              >
                Sign In
              </a>
              <a
                href="/signin"
                className="px-3 sm:px-4 py-2 bg-[#C66A47] hover:bg-[#782B31] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                Join Foundry
              </a>

              {/* Mobile Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-stone-700 hover:bg-stone-200/50 transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown (Placed directly under the top row) */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-stone-200/60 mt-3 pt-3 pb-2 flex flex-col gap-3 font-medium text-sm text-stone-700 w-full">
              <a
                href="/manifesto"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-bold text-[#C66A47] px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors"
              >
                Manifesto
              </a>
              <a
                href="/explore"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors"
              >
                Explore
              </a>
              <a
                href="/projects"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors"
              >
                Projects
              </a>
              <a
                href="/opportunities"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors"
              >
                Opportunities
              </a>
              <a
                href="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors"
              >
                Pricing & Ecosystem
              </a>
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between sm:hidden">
                <a
                  href="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-semibold text-stone-700 hover:text-stone-900"
                >
                  Sign In
                </a>
              </div>
            </div>
          )}
        </nav>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-24 space-y-16">
          {/* HEADER SECTION */}
          <header className="space-y-6">
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-stone-500 uppercase">
              <span className="px-2 py-0.5 bg-[#FAF1EB] border border-[#E8D0C3] text-[#C66A47] font-semibold rounded-md">
                FOUNDRY MANIFESTO 2026
              </span>
              <span>•</span>
              <span>AUTHOR: @FOUNDRY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
              Software was meant to be crafted,{" "}
              <span className="text-[#C66A47] italic font-serif font-normal">
                not managed.
              </span>
            </h1>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              A manifesto for architects, engineers, and pragmatic creators who
              believe authentic proof of work speaks louder than credentialism,
              corporate titles, and algorithmic resume filters.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-200/70 text-xs text-stone-500 font-mono">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#C66A47] text-white flex items-center justify-center font-bold text-[10px]">
                  FC
                </div>
                <div>
                  <span className="font-semibold text-stone-800 font-sans block">
                    Foundry Governance Council
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Public Protocol Peer-Reviewed Document
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-stone-400">
                <span>8 min read</span>
                <span>4,812 Signatures</span>
              </div>
            </div>
          </header>

          {/* SECTION 00 */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4">
            <div className="md:col-span-5 space-y-3">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">
                PART 00 // STATUS QUO
              </span>
              <h2 className="text-lg font-bold text-stone-900 leading-snug">
                The theater of institutional vetting has collapsed.
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                The software ecosystem has traded software craft for speculative
                titles, generic certificates, credential stacking, and corporate
                interview puzzles designed to validate compliance, not
                production skill.
              </p>
            </div>

            <div className="md:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/80 shadow-sm space-y-4">
              <p className="text-xs text-stone-700 leading-relaxed">
                We built Foundry under a simple, undeniable truth:{" "}
                <strong className="text-stone-900">
                  software written either compiles and handles production
                  traffic, or it doesn't.
                </strong>{" "}
                No amount of corporate titling changes the memory footprint of
                an unoptimized loop, and no degree or certificate restores a
                deadlocked spin lock under load.
              </p>
              <p className="text-xs text-stone-600 leading-relaxed">
                The end goal of core execution science is not to demonstrate
                vertical rank, but to perform resilient system outcomes. Those
                who maintain high-throughput RPCs, large-degree dependency
                graphs, and critical fault-tolerant code should execute in plain
                daylight.
              </p>

              <div className="p-3 bg-[#FAF8F5] border border-stone-200/60 rounded-xl flex items-center justify-between text-[11px] font-mono">
                <span className="text-stone-500">
                  Core Vetting Constraint: Code &gt; Credentials
                </span>
                <span className="text-[#C66A47] font-semibold">
                  Peer Vetted
                </span>
              </div>
            </div>
          </section>

          {/* MANIFESTO PILLARS */}
          <section className="space-y-14">
            {/* Pillar 01 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-2">
                <span className="text-4xl font-extrabold text-[#C66A47]/40 font-mono block">
                  01
                </span>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  PROVENANCE
                </span>
              </div>
              <div className="md:col-span-10 space-y-4">
                <h3 className="text-xl font-bold text-stone-900">
                  The Resume is Dead. Code is Living.
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  A PDF resume is an unverified, self-serving fantasy curated to
                  deceive automated ATS filters. It tells us nothing about how
                  an engineer reasons through edge cases, structures database
                  migrations, or preserves backward compatibility under stress.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 bg-white border border-stone-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-stone-400 uppercase block">
                      Legacy Candidate Assessment
                    </span>
                    <p className="text-xs font-bold text-stone-800">
                      Keywords & Pedigree
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Superficial resume parsing and 5-stage whiteboard trivia
                      that ignores real engineering capacity.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-stone-200/80 rounded-xl space-y-1 border-l-2 border-l-[#C66A47]">
                    <span className="text-[10px] font-mono text-[#C66A47] uppercase block">
                      Foundry Standard
                    </span>
                    <p className="text-xs font-bold text-stone-800">
                      Verifiable Artifacts
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Live production commits, peer-reviewed pull requests, and
                      functional system architectures open to inspection.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  Real capability is demonstrated in how you solve complexity
                  inside your repository—not the brand marks on your header.
                  Skill and domain value do not fade behind corporate NDAs when
                  it can be demonstrated via atomic, public, and verifiable
                  profiles.
                </p>
              </div>
            </div>

            {/* Quote Block */}
            <div className="bg-[#FAF1EB] border border-[#E8D0C3] rounded-2xl p-6 sm:p-8 space-y-3">
              <span className="text-3xl text-[#C66A47] font-serif leading-none font-bold block">
                “
              </span>
              <blockquote className="text-base sm:text-lg font-serif italic text-stone-800 leading-snug">
                "Show me your test cases and architectural rollback strategies,
                and I will tell you who you are as an engineer. Titles are
                rented; mastered systems are permanent."
              </blockquote>
              <div className="flex items-center gap-2 pt-2 text-xs font-mono text-stone-600">
                <span className="w-2 h-2 rounded-full bg-[#C66A47]"></span>
                <span className="font-semibold text-stone-900">
                  Linus Vetting Rule
                </span>
                <span className="text-stone-400">• Core Operational Ethos</span>
              </div>
            </div>

            {/* Pillar 02 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-2">
                <span className="text-4xl font-extrabold text-[#C66A47]/40 font-mono block">
                  02
                </span>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  VELOCITY
                </span>
              </div>
              <div className="md:col-span-10 space-y-4">
                <h3 className="text-xl font-bold text-stone-900">
                  Public Building is Compound Interest.
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Every solved bug, RFC published open, step-by-step root cause
                  analysis writeup, and every public build commit compounds in
                  value. Closed development isolates intelligence; open builds
                  establish permanent reference for the collective floor of the
                  entire developer network.
                </p>

                <div className="p-4 bg-white border border-stone-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      The Open Documentation Multiplier
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Public architectural specs accelerate peer review speed by
                      up to 4x relative to siloing.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-500 shrink-0">
                    <span className="px-2 py-1 bg-stone-100 rounded-md">
                      100% TRANSPARENT
                    </span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                      VERIFIED WORK
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-2">
                <span className="text-4xl font-extrabold text-[#C66A47]/40 font-mono block">
                  03
                </span>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  SOVEREIGNTY
                </span>
              </div>
              <div className="md:col-span-10 space-y-4">
                <h3 className="text-xl font-bold text-stone-900">
                  Syndicates of Craft, Not Endless Feeds.
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  The traditional professional network has degenerated into an
                  engagement-optimized casino of generic AI left-takes, vanity
                  posts, and recruiter spam. Foundry replaces social
                  performative theater with proof of work: real work pods,
                  focused engineering groups, and high-signal peer groups.
                </p>

                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                  <span className="px-3 py-1.5 bg-white border border-stone-200/80 rounded-lg text-stone-700">
                    Zero Recruiter AI Spam
                  </span>
                  <span className="px-3 py-1.5 bg-white border border-stone-200/80 rounded-lg text-stone-700">
                    Peer Verified Code Review
                  </span>
                  <span className="px-3 py-1.5 bg-white border border-stone-200/80 rounded-lg text-stone-700">
                    High Resolution Signal-to-Noise
                  </span>
                </div>
              </div>
            </div>

            {/* Pillar 04 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-2">
                <span className="text-4xl font-extrabold text-[#C66A47]/40 font-mono block">
                  04
                </span>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  EQUITY
                </span>
              </div>
              <div className="md:col-span-10 space-y-4">
                <h3 className="text-xl font-bold text-stone-900">
                  Radical Compensation Transparency & True Ownership.
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Information asymmetry benefits restrictive administration.
                  Every opportunity posted across the Foundry ecosystem mandates
                  clear base allocations, visible fractional equity caps, and
                  immediate payout validation in verifiable metrics.
                  Slogan-driven promises have zero barter here.
                </p>
              </div>
            </div>
          </section>

          {/* COVENANT CARD */}
          <section className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
              <div className="w-6 h-6 rounded bg-[#FAF1EB] border border-[#E8D0C3] flex items-center justify-center text-[#C66A47] text-xs font-bold font-mono">
                🛡
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  The Foundry Network Covenant
                </h3>
                <p className="text-[11px] text-stone-400 font-mono">
                  An explicit peer-to-peer code of conduct for software builders
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#FAF8F5] border border-stone-200/70 rounded-xl">
              <p className="text-xs sm:text-sm text-stone-800 font-serif italic leading-relaxed text-center">
                "We pledge to never incentive candidate data through cold
                recruiter spam, never rank vanity over velocity, and always
                protect open-source provenance and sovereign builder ownership."
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block text-center">
                INITIAL BUILDER SIGNATORIES • FOUNDING NETWORK MEMBERS
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { handle: "@alexander_r", title: "Core Protocol" },
                  { handle: "@elena_v", title: "Graphics Eng" },
                  { handle: "@devin_rust", title: "Systems Architect" },
                  { handle: "@marcus_k", title: "Kernel Dev" },
                  { handle: "@sara_m", title: "Distributed Sys" },
                  { handle: "@sora_jp", title: "Compiler Dev" },
                  { handle: "@yuki_webgpu", title: "WebGL Lead" },
                  { handle: "@patrik_h", title: "Security Res" },
                  { handle: "@ben_network", title: "P2P Infra" },
                  { handle: "@chen_x", title: "Database Arch" },
                  { handle: "@jordan_z", title: "Tooling Lead" },
                  { handle: "@priya_v", title: "Formal Verif" },
                ].map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-[#FAF8F5] border border-stone-200/60 rounded-lg flex items-center gap-2"
                  >
                    <div className="w-5 h-5 rounded-full bg-stone-800 text-white font-mono text-[9px] flex items-center justify-center shrink-0">
                      {sig.handle[1].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold text-stone-800 truncate block">
                        {sig.handle}
                      </span>
                      <span className="text-[8px] text-stone-400 truncate block">
                        {sig.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CALL TO ACTION */}
          <section className="bg-[#FAF1EB] border border-[#E8D0C3] rounded-2xl p-6 sm:p-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 border border-[#E8D0C3] text-[#C66A47] text-[10px] font-mono font-semibold rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C66A47]"></span>
              Signed by 4,812 verified builders across 64 countries
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Add your cryptographic mark to the Builder Covenant.
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Signing guarantees your GitHub commit history acts as proof of
                record on the network. No spam, no advertising, simple immutable
                builder identity.
              </p>
            </div>
                 {error && (
              <p className="text-rose-600 text-xs text-center mt-2">{error}</p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
<div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
        <button
          type="button"
          onClick={handleGithubAuth}
          disabled={loading}
          className={`w-full sm:w-auto px-6 py-3 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-200 ${
            loading
              ? "bg-[#C66A47]/80 cursor-wait opacity-90"
              : "bg-[#C66A47] hover:bg-[#A85536] cursor-pointer"
          }`}
        >
          {loading ? (
            <>
              {/* Spinner Icon */}
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Connecting to Foundry...</span>
            </>
          ) : (
            <>
              {/* GitHub Icon */}
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Sign with GitHub OAuth</span>
            </>
          )}
        </button>

        <button className="text-xs font-mono text-stone-500 hover:text-stone-800 transition-colors py-2 px-3">
          Share the Manifesto ↗
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs font-mono text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
          {error}
        </p>
      )}
    </div>
            <div className="pt-6 border-t border-[#E8D0C3]/70">
              <span className="text-[9px] font-mono text-stone-400 uppercase tracking-wider block mb-3">
                LATEST VERIFIED SIGNATURES
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                {[
                  {
                    name: "Devon S.",
                    time: "4m ago",
                    detail: "Rust Core Contributor",
                  },
                  {
                    name: "Siddharth N.",
                    time: "12m ago",
                    detail: "WebGPU Lead",
                  },
                  {
                    name: "Maria A.",
                    time: "18m ago",
                    detail: "Compiler Architect",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-2 bg-white/70 rounded-lg border border-[#E8D0C3]/50 text-[10px] font-mono"
                  >
                    <div className="flex justify-between font-bold text-stone-800">
                      <span>{item.name}</span>
                      <span className="text-stone-400 font-normal">
                        {item.time}
                      </span>
                    </div>
                    <span className="text-stone-500 block truncate">
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-stone-200/80 bg-[#FAF8F5] pt-12 pb-8 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-[#FAF1EB] p-1 rounded border border-stone-200/50">
                    <span className="text-xs font-bold text-[#C66A47] font-mono">
                      F
                    </span>
                  </div>
                  <span className="font-bold text-sm text-stone-900">
                    Foundry
                  </span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed max-w-xs">
                  A sovereign builder network designed for architects,
                  engineers, and creators building the next generation of
                  software craft.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <h4 className="font-mono text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                  Manifesto
                </h4>
                <ul className="space-y-2 text-stone-600">
                  <li>
                    <a href="#provenance" className="hover:text-stone-900">
                      Provenance
                    </a>
                  </li>
                  <li>
                    <a href="#velocity" className="hover:text-stone-900">
                      Open Velocity
                    </a>
                  </li>
                  <li>
                    <a href="#sovereignty" className="hover:text-stone-900">
                      Sovereignty
                    </a>
                  </li>
                  <li>
                    <a href="#transparency" className="hover:text-stone-900">
                      Transparency
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5 text-xs">
                <h4 className="font-mono text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                  Ecosystem
                </h4>
                <ul className="space-y-2 text-stone-600">
                  <li>
                    <a href="#pods" className="hover:text-stone-900">
                      Developer Pods
                    </a>
                  </li>
                  <li>
                    <a href="#grants" className="hover:text-stone-900">
                      OS Grants
                    </a>
                  </li>
                  <li>
                    <a href="#bounties" className="hover:text-stone-900">
                      Bounties
                    </a>
                  </li>
                  <li>
                    <a href="#nodes" className="hover:text-stone-900">
                      Live Stream
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5 text-xs">
                <h4 className="font-mono text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                  Governance
                </h4>
                <ul className="space-y-2 text-stone-600">
                  <li>
                    <a href="#covenant" className="hover:text-stone-900">
                      The Covenant
                    </a>
                  </li>
                  <li>
                    <a href="#privacy" className="hover:text-stone-900">
                      Bug Bounty
                    </a>
                  </li>
                  <li>
                    <a href="#terms" className="hover:text-stone-900">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#support" className="hover:text-stone-900">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-stone-400 gap-2">
              <span>© 2026 Foundry Network. All rights reserved.</span>
              <span>Proof of Work Over Credentials.</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ManifestoPage;
