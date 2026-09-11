import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import foundryLogo from "../assets/foundry-logo.png";
const API_URL = import.meta.env.VITE_API_URL;
const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "alex@example.com";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    const targetIndex = Math.min(pastedData.length, 5);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };
  const handleClear = () => {
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };
  const handleResendCode = async () => {
    if (timer > 0) return;
    try {
      setError("");
      await axios.post(`${API_URL}/api/auth/resend-otp`, { email });
      setTimer(60);
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    }
  };
  const handleVerify = async (e) => {
    e.preventDefault();

    // Safely join array elements
    const otpArray = Array.isArray(otp) ? otp : String(otp || "").split("");
    const code = otpArray.join("");

    if (code.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post(
        `${API_URL}/api/auth/verify-otp`,
        { email, code },
        { withCredentials: true },
      );

      if (response.status === 200 || response.status === 201) {
        navigate("/discover");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      <div className="min-h-screen bg-[#F7F5F0] text-[#1C1917] flex flex-col items-center justify-center p-4 font-sans antialiased selection:bg-[#D87A56]/20">
        <div className="w-full max-w-[480px] bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF1EB] border border-[#E8D0C3] flex items-center justify-center shrink-0">
                <img
                  src={foundryLogo}
                  alt="Foundry"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-bold text-stone-900 leading-tight">
                  Foundry
                </h2>
                <p className="text-[11px] text-stone-400 font-medium leading-tight">
                  Builder Network Auth
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF2EB] text-[#B8502F] text-[11px] rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8502F]"></span>
              <span>Step 2 of 2</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 mb-2 text-center tracking-tight">
            Verify your email
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mb-3 text-center">
            We've sent a 6-digit confirmation code to:
          </p>

          <div className="inline-flex items-center gap-2 bg-[#FAF8F5] border border-stone-200/70 px-3.5 py-1.5 rounded-full mb-8">
            <svg
              className="w-3.5 h-3.5 text-[#B8502F]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs font-semibold text-stone-800">
              {email}
            </span>
            <span className="text-stone-300">•</span>
            <button
              onClick={() => navigate("/signin")}
              className="text-xs text-[#B8502F] hover:text-[#9A4023] font-medium transition-colors"
            >
              Edit email
            </button>
          </div>

          {error && (
            <div className="w-full mb-6 p-3 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          <form
            onSubmit={handleVerify}
            className="w-full flex flex-col items-center"
          >
            <div className="flex gap-2 sm:gap-2.5 justify-center mb-3 w-full">
              {(Array.isArray(otp) ? otp : String(otp || "").split("")).map(
                (digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-serif font-medium bg-[#F5F2ED]/60 border rounded-xl focus:outline-none transition-all text-stone-900 ${
                      digit
                        ? "bg-white border-[#B8502F] shadow-sm"
                        : "border-stone-200/70 focus:border-[#B8502F] focus:bg-white"
                    }`}
                  />
                ),
              )}
            </div>

            <div className="w-full flex justify-between items-center text-[11px] text-stone-400 mb-6 px-1">
              <div className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Digits 1-6</span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-stone-500 hover:text-stone-800 transition-colors"
              >
                Clear all
              </button>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                (Array.isArray(otp) ? otp.join("") : String(otp)).length < 6
              }
              className="w-full py-3.5 bg-[#D87A56] hover:bg-[#C66A47] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
              {!loading && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-stone-500">
            <span>Didn't receive the code? </span>
            {timer > 0 ? (
              <span className="text-[#B8502F] font-semibold ml-1">
                Resend in {formatTimer(timer)}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                className="text-[#B8502F] hover:text-[#9A4023] font-semibold underline ml-1 cursor-pointer"
              >
                Resend code
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 mt-2 text-xs text-stone-500">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={timer > 0}
              className="hover:text-stone-800 disabled:opacity-50 transition-colors"
            >
              Try another method
            </button>
            <span className="text-stone-300">•</span>
            <a
              href="mailto:support@foundry.network"
              className="hover:text-stone-800 transition-colors"
            >
              Contact support
            </a>
          </div>

          <div className="w-full mt-8 p-3.5 bg-[#FAF8F5] border border-stone-200/80 rounded-2xl flex items-start gap-3 text-left">
            <div className="p-1.5 bg-[#F0ECE1] rounded-lg text-[#B8502F] mt-0.5 shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Verification codes expire in{" "}
              <strong className="text-stone-800 font-semibold">
                10 minutes
              </strong>
              . Foundry uses end-to-end encrypted identity safeguards to
              guarantee exclusive builder ownership.
            </p>
          </div>

          <div className="w-full pt-6 mt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="flex items-center gap-1 hover:text-stone-900 transition-colors"
            >
              ← Back to Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="hover:text-stone-900 transition-colors"
            >
              Change account
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-[11px] text-stone-400 font-mono">
          <svg
            className="w-3.5 h-3.5 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Connected to node us-east-foundry-09 (18ms)</span>
        </div>
      </div>
    </>
  );
};

export default VerifyOtp;
