import logo from "../assets/icons/foundrylogo.png";
import googleIcon from "../assets/icons/google.png";
import githubIcon from "../assets/icons/github.png";
import linkedinIcon from "../assets/icons/linkedin.png";
import xIcon from "../assets/icons/x.png";
import foundryLogo from '../assets/foundry-logo.png';

function SignIn() {
  return (
    <main className="signin-page min-h-screen flex bg-[#f8f6f3] items-center justify-center font-serif text-[#1C1917]">
      <div className="signin-container w-full max-w-md bg-white rounded-xl shadow-sm border border-stone-200/60 p-8 text-center">
        <div className='flex items-center justify-center gap-2 mb-6'>
            <img src={foundryLogo} alt="Foundry Logo" className='w-6 h-6 object-contain'/>
            <span className="font-semibold text-lg tracking-tight">Foundry</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 mb-2">
            Build the future. Join Foundry
        </h1>
        <p className="signin-description text-xs text-stone-500 max-w-xs mx-auto mb-6 leading-relaxed">
          The Social Platform for people who build things. Connect, Share your journey, and discover opportunities
        </p>
        <div className="social-buttons space-y-2.5 mb-6">
          {[
            { name: "Google",   icon:googleIcon },
            { name: "Github",   icon:githubIcon },
            { name: "LinkedIn", icon:linkedinIcon },
            { name: "X",        icon:xIcon },
          ].map((social)=> (
            <button 
            key={social.name}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FAF1EB] hover:bg-[#EAE6DF] text-stone-800 text-sm rounded-lg border border-stone-200/50 transition-colors"
            >
            <img src={social.icon} alt=""  className="w-4 h-4 object-contain"/>
            <span>Continue with {social.name}</span>
          </button>
          ))}
        </div>

        <div className="divider flex relative items-center justify-center mb-6">
          <div className='w-full border-t border-stone-200'></div>
          <span className="absolute bg-white px-3 text-[14px] text-stone-400">
            or continue with email
          </span>
        </div>

        <form className="signin-form space-y-4 text-left" >
          <div className="">
              <label htmlFor="email" className="block text-sm text-stone-600 mb-1 font-sans">
                Email address
              </label>
              <input id="email" type="email" placeholder="alex@example.com" className="w-full px-3 py-2 bg-[#F4F1EB] border border-stone-200/70 rounded-lg text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 font-sans" 
              />
          </div>

          <button 
          type="submit"
          className="w-full py-2.5 bg-[#D87A56] hover:bg-[#C66A47] text-white text-sm rounded-lg font-medium transition-colors shadow-sm mt-2"
          >
            Sign In / Create Account
          </button>
        </form>

        
        <p className="terms text-[11px] text-stone-500 mt-6 leading-normal font-sans">
          By continuing, you agree to Foundry's{" "}
          <a href="#" className="underline hover:text-stone-800">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-stone-800">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}

export default SignIn;
