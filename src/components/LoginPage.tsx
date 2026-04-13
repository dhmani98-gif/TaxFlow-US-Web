import React from 'react';
import { TrendingUp, Mail, Lock, ArrowRight, Loader2, CheckCircle2, UserPlus } from 'lucide-react';
import { signInWithGoogle, resetPassword, signUp, login as firebaseLogin } from '../firebase';

interface LoginPageProps {
  onBack: () => void;
}

export default function LoginPage({ onBack }: LoginPageProps) {
  const [loading, setLoading] = React.useState(false);
  const [view, setView] = React.useState<'login' | 'forgot' | 'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [resetSent, setResetSent] = React.useState(false);
  const [signupSent, setSignupSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await firebaseLogin(email, password);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password login is not enabled in Firebase. Please check your console.");
      } else {
        setError(`Login Error: ${err.message}`);
      }
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(email, password);
      setSignupSent(true);
    } catch (err: any) {
      console.error("Sign up error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid business email address.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password registration is not enabled in Firebase. Please check your console.");
      } else {
        setError(`Registration Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many requests. Please try again later.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetStates = () => {
    setResetSent(false);
    setSignupSent(false);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-carbon flex flex-col items-center justify-center p-8 font-sans relative">
      <button 
        onClick={() => {
          if (view === 'login') {
            onBack();
          } else {
            setView('login');
            resetStates();
          }
        }}
        className="absolute top-8 left-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm"
      >
        <ArrowRight className="rotate-180" size={18} />
        {view === 'login' ? 'Back to Home' : 'Back to Login'}
      </button>

      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-electric rounded-xl flex items-center justify-center shadow-lg shadow-electric/20">
              <TrendingUp className="text-carbon" size={28} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">TAXFLOW</h1>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {view === 'login' && 'Welcome back to TaxFlow US.'}
            {view === 'forgot' && 'Reset your password'}
            {view === 'signup' && 'Create your account'}
          </h2>
          <p className="text-slate-400 mt-2">
            {view === 'login' && 'Enter your credentials to access your dashboard.'}
            {view === 'forgot' && 'Enter your business email and we\'ll send you a reset link.'}
            {view === 'signup' && 'Join TaxFlow US and automate your tax accounting today.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        {view === 'login' && (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Business Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-all"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                  <button 
                    type="button"
                    onClick={() => { setView('forgot'); resetStates(); }}
                    className="text-xs font-bold text-electric hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-electric text-carbon py-4 rounded-xl font-black text-lg hover:brightness-110 transition-all shadow-xl shadow-electric/20 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Dashboard'}
              {!loading && <ArrowRight size={20} />}
            </button>

            {/* Demo Account Section */}
            <div className="bg-electric/10 border border-electric/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-electric uppercase tracking-wider text-center">Demo Account - Click to Auto-fill</p>
              <button
                type="button"
                onClick={() => {
                  setEmail('test@taxflow.demo');
                  setPassword('Demo123456');
                }}
                className="w-full bg-carbon border border-electric/30 rounded-lg py-2 px-3 text-left hover:border-electric transition-all"
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white font-mono">test@taxflow.demo</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-slate-400">Password:</span>
                  <span className="text-white font-mono">Demo123456</span>
                </div>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-carbon px-2 text-slate-500 font-bold">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={signInWithGoogle}
              className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Sign in with Google
            </button>
          </form>
        )}

        {view === 'signup' && (
          <div className="mt-8">
            {signupSent ? (
              <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Verify your email</h3>
                  <p className="text-slate-400">We've sent an activation link to <br/><span className="text-white font-bold">{email}</span>. Please click the link to activate your account.</p>
                </div>
                <button 
                  onClick={() => { setView('login'); resetStates(); }}
                  className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSignUp}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Business Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-all"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-electric text-carbon py-4 rounded-xl font-black text-lg hover:brightness-110 transition-all shadow-xl shadow-electric/20 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                  {!loading && <UserPlus size={20} />}
                </button>
              </form>
            )}
          </div>
        )}

        {view === 'forgot' && (
          <div className="mt-8">
            {resetSent ? (
              <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Check your email</h3>
                  <p className="text-slate-400">We've sent a password reset link to <br/><span className="text-white font-bold">{email}</span></p>
                </div>
                <button 
                  onClick={() => { setView('login'); resetStates(); }}
                  className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleReset}>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Business Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-[#111] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-all"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-electric text-carbon py-4 rounded-xl font-black text-lg hover:brightness-110 transition-all shadow-xl shadow-electric/20 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-sm text-slate-500">
          {view === 'signup' ? (
            <>Already have an account? <button onClick={() => { setView('login'); resetStates(); }} className="text-electric font-bold hover:underline">Login</button></>
          ) : (
            <>Don't have an account? <button onClick={() => { setView('signup'); resetStates(); }} className="text-electric font-bold hover:underline">Sign Up</button></>
          )}
        </p>
      </div>
    </div>
  );
}
