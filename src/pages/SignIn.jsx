import logo from "../assets/icons/foundrylogo.png";

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
          <button type="button">Continue with Google</button>
          <button type="button">Continue with Github</button>
          <button type="button">Continue with LinkedIn</button>
          <button type="button">Continue with X</button>
        </div>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        <form className="signin-form">
          <label htmlFor="email">Email address</label>

          <input id="email" type="email" placeholder="you@example.com" />

          <button type="submit">
            Sign In
          </button>
        </form>

        <p className="signup-text">
            Don't have an account?{' '}
            <a href="/signup">Sign up</a>
        </p>

        <p className="terms">
            By continuing, you agree to Foundry's Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}

export default SignIn;
