import React, { useState } from "react";
import foundryLogo from "../assets/foundry-logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loadingType, setLoadingType] = useState(false);
  const [error, setError] = useState("");

  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoadingType(email);
      setError("");

      await axios.post(`${API_URL}/api/auth/send-otp`, { email });

      // I Pass email via router state to /verify page
      navigate("/verify", { state: { email } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoadingType(false);
    }
  };

  const handleGoogleAuth = () => {
    setLoadingType("google");
    setError("");
    setTimeout(() => {
      window.location.href = `${API_URL}/api/auth/google`;
    }, 150);
  };

  const handleGithubAuth = () => {
    setLoadingType("github");
    setError("");
    setTimeout(() => {
      window.location.href = `${API_URL}/api/auth/github`;
    }, 150);
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                className="hover:text-stone-900 transition-colors"
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
                href="/pricing"
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

          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-stone-200/60 mt-3 pt-3 pb-2 flex flex-col gap-3 font-medium text-sm text-stone-700 w-full">
              <a
                href="/manifesto"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors"
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
        <section className="pt-8 pb-6 px-4 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F3EFEA] border border-stone-200/80 rounded-full text-xs text-stone-700 font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8502F]"></span>
            <span>Foundry v1.1 Public Network</span>
            <span className="text-stone-400">.</span>
            <span className="font-semibold text-stone-900">
              42,000+ Verified Builders →
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-[1.15] text-stone-900 mb-6">
            Where builders document their journey, find co-founders, and{" "}
            <span className="text-[#B8502F] underline decoration-stone-300 underline-offset-8">
              ship what's next.
            </span>
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Move beyond resume fluff. Foundry unites technical proof of work,
            live project roadmaps, and high-signal engineering opportunities
            into one collaborative ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <a
              href="./signin"
              className="w-full sm:w-auto px-6 py-3 bg-[#a75230] hover:bg-[#782B31] hover:bg[#782B31] text-white text-sm font-semibold rounded-xl shadow:sm flex items-center justify-center gap-2 transition-all"
            >
              Join Foundry Free
              <span></span>
            </a>
            <button className="w-full sm:w-auto px-6 py-3 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-sm font-medium rounded-xl shadow-xs transition-all cursor-pointer">
              Explore Active Projects
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-serif text-stone-800 font-medium">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#B8502F] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>Backed by top OSS funds</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#B8502F] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v8" />
              </svg>
              <span>Zero recruitment spam guarantee</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#B8502F] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="12" r="3" />
                <circle cx="6" cy="12" r="3" />
                <line x1="9" y1="12" x2="15" y2="12" />
              </svg>
              <span>100% verified GitHub / Web3 commit graphs</span>
            </div>
          </div>
        </section>
        <section className="px-3 sm:px-4 pb-20 max-w-5xl mx-auto">
          <div className="bg-[#EFECE6] p-2 sm:p-4 rounded-2xl border border-stone-300/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-2 pb-1 px-1 sm:px-2 text-xs text-stone-500">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </div>
                <span className="ml-2 font-mono text-[11px] text-stone-500 truncate min-w-0">
                  <span className="sm:hidden">app.foundry.network</span>
                  <span className="hidden sm:inline">
                    app.foundry.network/workspace/live-stream
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-100/80 border border-rose-200/60 text-[#C66A47] font-semibold text-[10px] rounded-full shrink-0 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C66A47] animate-pulse"></span>
                <span className="whitespace-nowrap">LIVE SYNC</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200/80 space-y-4 w-full box-border">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    AE
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                      Aether Spatial Engine
                    </h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-500 font-mono text-[10px] rounded-md">
                      v0.8.2-rc4
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-[#FAF1EB] border border-[#E8D0C3] text-[#B8502F] font-mono text-[10px] font-semibold rounded-md shrink-0 uppercase">
                  Sprint #18
                </span>
              </div>

              <p className="text-xs text-stone-500">
                Real-time WebGPU octree rendering library with zero-copy Rust
                bindings.
              </p>

              <div className="p-3.5 bg-[#FAF8F5] border border-stone-200/70 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-700 font-medium">
                    Raymarch Occlusion Buffer
                  </span>
                  <span className="font-bold text-[#B8502F]">75% Complete</span>
                </div>
                <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
                  <div className="h-full bg-[#B8502F] rounded-full w-[75%]"></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
                  <span>18/24 Sub-tasks merged</span>
                  <span>Target: Oct 28</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-stone-200/70 flex items-center justify-between gap-2">
                <div>
                  <div className="font-mono text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                    30-DAY COMMIT VELOCITY
                  </div>
                  <div className="text-xs font-bold text-[#2A7E56] font-mono mt-0.5">
                    +142% vs last cycle
                  </div>
                </div>
                <div className="h-8 w-28 sm:w-36 shrink-0">
                  <svg
                    viewBox="0 0 200 50"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0,40 Q 60,35 100,20 T 160,30 T 200,10"
                      fill="none"
                      stroke="#C66A47"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2 shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#B8502F] text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-white">
                      ER
                    </div>
                    <div className="w-6 h-6 rounded-full bg-stone-700 text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-white">
                      MH
                    </div>
                    <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 font-mono text-[9px] font-bold flex items-center justify-center border-2 border-white">
                      K2
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">
                    +45 active devs
                  </span>
                </div>

                <button className="w-full sm:w-auto px-5 py-2.5 bg-[#B8502F] hover:bg-[#A2482B] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
                  Fast Apply to Pod
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-amber-100/80 border border-amber-300 text-stone-800 font-mono font-bold text-xs flex items-center justify-center shrink-0 relative">
                      ER
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C66A47] border-2 border-white absolute bottom-0 right-0"></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="text-sm font-bold text-stone-900">
                          Elena Rostova
                        </h4>
                        <span className="w-3.5 h-3.5 rounded-full bg-[#C66A47] text-white flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 font-medium">
                        Staff Graphics Architect • Ex-RenderPod
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 bg-[#FAF8F5] rounded-xl border border-stone-200/60">
                      <p className="text-xs font-bold text-stone-900">3.8k</p>
                      <p className="text-[8px] text-stone-400 uppercase">
                        Commits
                      </p>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded-xl border border-stone-200/60">
                      <p className="text-xs font-bold text-stone-900">98.4%</p>
                      <p className="text-[8px] text-stone-400 uppercase">
                        PR Acceptance
                      </p>
                    </div>
                    <div className="p-2 bg-[#FAF8F5] rounded-xl border border-stone-200/60">
                      <p className="text-xs font-bold text-[#C66A47]">Top 1%</p>
                      <p className="text-[8px] text-stone-400 uppercase">
                        Rust OSS
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-stone-500 flex-wrap">
                    <span className="px-2 py-0.5 bg-stone-100 rounded-md">
                      #WebGPU
                    </span>
                    <span className="px-2 py-0.5 bg-stone-100 rounded-md">
                      #SIMD
                    </span>
                    <span className="px-2 py-0.5 bg-stone-100 rounded-md">
                      #Vulkan
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 uppercase tracking-widest font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C66A47]"></span>
                      <span>NETWORK ACTIVITY PULSE</span>
                    </div>
                    <span className="text-stone-400">Real-time</span>
                  </div>

                  <div className="space-y-2 font-sans text-xs">
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-200/60 space-y-0.5">
                      <p className="text-stone-800 leading-snug">
                        <strong className="text-stone-900 font-semibold">
                          Elena Rostova
                        </strong>{" "}
                        merged PR #142 into{" "}
                        <span className="font-serif italic text-stone-900">
                          Neural Mesh
                        </span>
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        2 minutes ago • Passes all 48 test suites
                      </p>
                    </div>

                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-200/60 space-y-0.5">
                      <p className="text-stone-900 font-semibold leading-snug">
                        Rust Graphics Engine{" "}
                        <span className="font-normal text-stone-600">
                          opened bounty
                        </span>
                      </p>
                      <p className="text-xs font-bold text-[#C66A47] font-mono">
                        $6,000 OS Grant • Octree Shaders
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-stone-400 border-t border-stone-100">
                  <span>
                    Active sockets:{" "}
                    <strong className="text-stone-700 font-normal">
                      3,412
                    </strong>
                  </span>
                  <button className="text-[#C66A47] hover:underline font-serif italic text-xs cursor-pointer">
                    View full raw stream →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="px-4 py-4 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white p-6  rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold text-lg">
              🪙
            </div>
            <div>
              <h3 className="text-2xl font-bold text-stone-900">$1.8M+</h3>
              <p className="text-xs text-stone-500">
                Distributed in Grants & Bounties
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-lg">
              👥
            </div>
            <div>
              <h3 className="text-2xl font-bold text-stone-900">42,000+</h3>
              <p className="text-xs text-stone-500">
                Verified Technical Builders
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <div>
              <h3 className="text-2xl font-bold text-stone-900">3.4x Faster</h3>
              <p className="text-xs text-stone-500">
                Technical Co-founder Matching
              </p>
            </div>
          </div>
        </section>
        <section className="w-full bg-[#F7F5F0] py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="mb-12 text-left">
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#B8502F] mb-2">
                ENGINEERED FOR TECHNICAL DEPTH
              </p>
              <h2 className="text-[25px] font-bold text-stone-900 tracking-tight">
                Crafted specifically for the people assembling what is next.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.015)] flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-[#FAF1EB] border border-[#E8D0C3] flex items-center justify-center mb-4">
                    <svg
                      className="w-4 h-4 text-[#B8502F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                  </div>

                  <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase font-semibold block mb-1">
                    01 / PROOF OF WORK
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mb-2 tracking-tight">
                    Journey Over Resume
                  </h3>

                  <p className="text-xs text-stone-500 leading-relaxed font-normal">
                    Document in public. Share real sprint updates, architecture
                    RFCs, and live benchmark wins that prove how you build, not
                    just where you worked.
                  </p>
                </div>

                <div className="mt-5 p-2.5 bg-[#FAF6F0] border border-[#EBE3D5] rounded-lg font-mono text-[10px] text-[#A2482B]">
                  $ foundry log --sprint 12 --benchmark-pass
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.015)] flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-[#EEF5FF] border border-[#D0E2FF] flex items-center justify-center mb-4">
                    <svg
                      className="w-4 h-4 text-[#2B6CB0]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                      />
                    </svg>
                  </div>

                  <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase font-semibold block mb-1">
                    02 / CAPITAL & ALLIANCE
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mb-2 tracking-tight">
                    High-Signal Opportunities
                  </h3>

                  <p className="text-xs text-stone-500 leading-relaxed font-normal">
                    Find co-founders, funded grants, and full-time roles with
                    radical compensation transparency, structured milestone
                    payouts, and Fast Apply.
                  </p>
                </div>

                <div className="mt-5 p-2.5 bg-[#FAF8F5] border border-stone-200/70 rounded-lg font-mono text-[10px] flex flex-col gap-1 text-stone-600">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Equity /</span>
                    <span className="font-bold text-stone-900">$180k -</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Grant</span>
                    <span className="font-bold text-stone-900">$240k +</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Range:</span>
                    <span className="font-bold text-stone-900">2.5%</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Active Technical Communities */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.015)] flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-[#F5F2ED] border border-[#E2DDD3] flex items-center justify-center mb-4">
                    <svg
                      className="w-4 h-4 text-stone-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>

                  <span className="text-[9px] font-mono tracking-widest text-stone-400 uppercase font-semibold block mb-1">
                    03 / SPECIALIZED SYNDICATES
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mb-2 tracking-tight">
                    Active Technical Communities
                  </h3>

                  <p className="text-xs text-stone-500 leading-relaxed font-normal">
                    Join focused engineering pods across Systems Programming,
                    AI/ML Infrastructure, WebGPU, and Decentralized Tech with
                    zero noise or promo spam.
                  </p>
                </div>

                <div className="mt-5 p-2 bg-[#FAF8F5] border border-stone-200/70 rounded-lg flex flex-wrap gap-1 font-mono text-[9px] text-stone-600">
                  <span className="px-1.5 py-0.5 bg-stone-200/60 rounded">
                    Systems (C/Rust)
                  </span>
                  <span className="px-1.5 py-0.5 bg-stone-200/60 rounded">
                    ML Infra
                  </span>
                  <span className="px-1.5 py-0.5 bg-stone-200/60 rounded">
                    WebGPU
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-[#F6F3EE] py-8 px-4 border-t border-b border-stone-200/60">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-mono text-[#8C333A] uppercase tracking-wider mb-1 font-bold">
              Live Ship Stream
            </p>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif text-stone-900">
                  Trending Community Project
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Open sprints seeking collaborators, reviewers, and grant
                  support right now.
                </p>
              </div>
              <a
                href="#all"
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 hidden sm:block"
              >
                View all 480+ indexed projects →
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs text-stone-500 mb-2">
                    <span className="font-mono text-[10px] bg-stone-100 px-2 py-0.5 rounded">
                      Sprint v0.5.2
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      ⭐ 1.2k
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm mb-1">
                    Aether Spatial Engine
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed mb-4">
                    WebGPU active raymarching and voxel acceleration structure
                    with zero-cost Rust abstractions.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-mono rounded">
                      Rust
                    </span>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-mono rounded">
                      WebGPU
                    </span>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-mono rounded">
                      WASM
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-100 text-xs">
                  <span className="text-stone-400 text-[11px]">
                    48 Contributors
                  </span>
                  <button className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] rounded-md transition-colors">
                    Inspect Code
                  </button>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs text-stone-500 mb-2">
                    <span className="font-mono text-[10px] bg-stone-100 px-2 py-0.5 rounded">
                      Alpha Milestone 3
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      ⭐ 840
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm mb-1">
                    Kira Micro-Kernel
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed mb-4">
                    Zero-allocation capability-based microkernel written in
                    modern C++20 for high-reliability embedded nodes.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-mono rounded">
                      C++20
                    </span>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-mono rounded">
                      Bare Metal
                    </span>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-mono rounded">
                      RISC-V
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-100 text-xs">
                  <span className="text-stone-400 text-[11px]">
                    12 Contributors
                  </span>
                  <button className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] rounded-md transition-colors">
                    Inspect Code
                  </button>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs text-stone-500 mb-2">
                    <span className="font-mono text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                      Bounty Available
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      ⭐ 2.4k
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm mb-1">
                    HyperGraph AI
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed mb-4">
                    Decentralized tensor pipeline for distributed edge model
                    inference over heterogeneous consumer chips.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-mono rounded">
                      Python
                    </span>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-mono rounded">
                      CUDA
                    </span>
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-mono rounded">
                      Distributed
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-stone-100 text-xs">
                  <span className="text-stone-400 text-[11px]">
                    86 Contributors
                  </span>
                  <button className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] rounded-md transition-colors">
                    Inspect Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="px-4 py-8 max-w-5xl mx-auto text-center">
          <p className="text-[11px] font-mono text-[#B8502F] uppercase tracking-wider mb-1 font-bold">
            Craft First
          </p>
          <h2 className="text-3xl font-serif text-stone-900 mb-2">
            Built by craftsmen, for craftsmen.
          </h2>
          <p className="text-xs text-stone-500 mb-12">
            See how senior engineers and founders cut through noise and find
            true technical alignment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="text-amber-500 text-sm">★★★★★</div>
              <p className="text-xs text-stone-600 italic leading-relaxed">
                "Foundry completely replaced LinkedIn for me. Finding someone
                through verified PR benchmarks rather than self-endorsed
                buzzwords saved our startup 3 months of co-founder screening."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center font-semibold text-xs">
                  MV
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">
                    Marcus Vance
                  </h4>
                  <p className="text-[10px] text-stone-400">
                    Co-Founder & CTO @ VectraMesh
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="text-amber-500 text-sm">★★★★★</div>
              <p className="text-xs text-stone-600 italic leading-relaxed">
                "Within four days of posting our low-latency kernel challenge on
                Foundry, two world-class systems contributors submitted working
                PRs and joined as core maintainers."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-amber-800 text-white flex items-center justify-center font-semibold text-xs">
                  LC
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">
                    Dr. Lynn Cho
                  </h4>
                  <p className="text-[10px] text-stone-400">
                    Principal Systems Lead @ HyperGraph
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="text-amber-500 text-sm">★★★★★</div>
              <p className="text-xs text-stone-600 italic leading-relaxed">
                "The Fast Apply mechanism is an engineering marvel. It reads my
                GitHub repositories directly and matches me with funded teams
                that actually use my exact compiler stack."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center font-semibold text-xs">
                  AL
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">
                    Arvid Lindqvist
                  </h4>
                  <p className="text-[10px] text-stone-400">
                    Independent Compiler Engineer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 max-w-4xl mx-auto text-center">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200/80 shadow-lg space-y-6">
            <div className="w-10 h-10 rounded-xl bg-[#FAF1EB] border border-[#E8D0C3] mx-auto flex items-center justify-center">
              <img
                src={foundryLogo}
                alt="Foundry"
                className="w-5 h-5 object-contain"
              />
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 max-w-lg mx-auto">
              Stop writing cover letters. Let your code do the talking.
            </h2>

            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              Join 42,000+ verified developers, architects, and founders
              shipping with real leverage.
            </p>

            <div className="w-full max-w-md mx-auto space-y-3">
              <form
                onSubmit={handleAccessSubmit}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="email"
                  required
                  disabled={loadingType !== null}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work or personal email..."
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8C333A]/20 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loadingType !== null}
                  className="px-5 py-3 bg-[#C66A47] hover:bg-[#782B31] disabled:opacity-70 text-white font-semibold text-xs rounded-xl transition-all shadow-sm shrink-0 cursor-pointer disabled:cursor-wait flex items-center justify-center gap-2"
                >
                  {loadingType === "email" ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5 text-white"
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
                      <span>Sending...</span>
                    </>
                  ) : (
                    "Get Instant Access"
                  )}
                </button>
              </form>

              {error && (
                <p className="text-rose-600 text-xs text-center font-mono bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs text-stone-400 pt-1">
                <span>Or onboard via</span>

                <button
                  type="button"
                  onClick={handleGithubAuth}
                  disabled={loadingType !== null}
                  className="px-3 py-1 bg-stone-100 text-stone-700 rounded-md text-[11px] font-medium hover:bg-stone-200 disabled:opacity-60 cursor-pointer disabled:cursor-wait transition-colors flex items-center gap-1.5"
                >
                  {loadingType === "github" ? (
                    <>
                      <svg
                        className="animate-spin h-3 w-3 text-stone-700"
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
                      <span>Connecting...</span>
                    </>
                  ) : (
                    "GitHub"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loadingType !== null}
                  className="px-3 py-1 bg-stone-100 text-stone-700 rounded-md text-[11px] font-medium hover:bg-stone-200 disabled:opacity-60 cursor-pointer disabled:cursor-wait transition-colors flex items-center gap-1.5"
                >
                  {loadingType === "google" ? (
                    <>
                      <svg
                        className="animate-spin h-3 w-3 text-stone-700"
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
                      <span>Connecting...</span>
                    </>
                  ) : (
                    "Google"
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Footer */}
        <footer className="bg-stone-100 border-t border-stone-200 px-6 py-12 text-xs text-stone-500">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-[#FAF1EB] p-1 rounded">
                  <img
                    src={foundryLogo}
                    alt="Foundry"
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <span className="font-semibold text-stone-900 text-sm">
                  Foundry
                </span>
              </div>
              <p className="text-stone-500 leading-relaxed max-w-xs text-[11px]">
                A builder-focused network designed for architects, engineers,
                and creators assembling the next generation of software tools.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 text-[11px] uppercase mb-3">
                Platform
              </h5>
              <ul className="space-y-2">
                <li>
                  <a href="/manifesto" className="hover:text-stone-900">
                    Manifesto
                  </a>
                </li>
                <li>
                  <a href="/explore" className="hover:text-stone-900">
                    Explore Feed
                  </a>
                </li>
                <li>
                  <a href="/projects" className="hover:text-stone-900">
                    Projects Index
                  </a>
                </li>
                <li>
                  <a href="/opportunties" className="hover:text-stone-900">
                    Opportunities
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 text-[11px] uppercase mb-3">
                Developers
              </h5>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Changelog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    CLI & SDKs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    System Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-stone-800 text-[11px] uppercase mb-3">
                Network
              </h5>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Fellowship
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Grant Program
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-stone-900">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-5xl mx-auto pt-6 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-stone-400 gap-2">
            <p>© 2026 Foundry Network Inc. All rights reserved.</p>
            <p>Built for builders and pragmatic craftsmen.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
