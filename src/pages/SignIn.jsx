import logo from "../assets/icons/foundrylogo.png";
import googleIcon from "../assets/icons/google.png";
import githubIcon from "../assets/icons/github.png";
import linkedinIcon from "../assets/icons/linkedin.png";
import xIcon from "../assets/icons/x.png";

function SignIn() {
  return (
    <main className="signin-page">
      <div className="signin-container">
        <img src={logo} alt="Foundry" className="signin-logo" />
        <h1>Build the future. Join Foundry</h1>
        <p className="signin-description">
          Connect with builders, share what you're building, and discover what's
          next.
        </p>
        <div className="social-buttons">
          <button type="button">
            <img src={googleIcon} alt="" />
            <span>Continue with Google</span>
          </button>
          <button type="button">
            <img src={githubIcon} alt="" />
            <span>Continue with Github</span>
          </button>
          <button type="button">
            <img src={linkedinIcon} alt="" />
            <span>Continue with LinkedIn</span>
          </button>
          <button type="button">
            <img src={xIcon} alt="" />
            <span>Continue with X</span>
          </button>
        </div>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        <form className="signin-form">
          <label htmlFor="email">Email address</label>

          <input id="email" type="email" placeholder="you@example.com" />

          <button type="submit">Sign In / Create Account</button>
        </form>

        
        <p className="terms">
          By continuing, you agree to Foundry's Terms of Service and Privacy
          Policy.
        </p>
      </div>
    </main>
  );
}

export default SignIn;
