import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("foundry-install-dismissed")) setHidden(true);
    } catch {}
    const onPrompt = (e) => {
      e.preventDefault(); // stop the default mini-bar, we show our own
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setDeferred(null));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!deferred || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try { localStorage.setItem("foundry-install-dismissed", "1"); } catch {}
  };

  const install = async () => {
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm bg-white rounded-2xl shadow-xl border border-stone-200 p-4">
      <div className="flex items-start gap-3">
        <img src="/foundry-logo.png" alt="" className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-stone-900">Get Foundry</h3>
          <p className="text-xs text-stone-600">Open Foundry faster, right from your home screen.</p>
        </div>
        <button onClick={dismiss} aria-label="Close" className="text-stone-400"><X size={16} /></button>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button onClick={install} className="flex-1 bg-[#A04622] text-white text-xs font-semibold rounded-xl py-2 flex items-center justify-center gap-1">
          <Download size={14} /> Install app
        </button>
        <button onClick={dismiss} className="text-xs font-semibold text-stone-500 px-3">Not now</button>
      </div>
    </div>
  );
}