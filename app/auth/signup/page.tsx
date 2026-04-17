"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName,
        });
      }

      router.push("/"); // Redirect after signup
    } catch (err: any) {
      setError(err.message || "Failed to create an account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/app");
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex-grow grid lg:grid-cols-2 min-h-screen">
        <section className="hidden lg:flex relative overflow-hidden flex-col justify-between p-16 bg-surface-container-low">
          <div className="relative z-10">
            <div className="text-2xl font-headline font-extrabold text-primary tracking-tight mb-12">AgriAI</div>
            <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tighter leading-tight max-w-md">
              Cultivating the future with <span className="text-primary">precision intelligence.</span>
            </h1>
            <p className="mt-6 text-on-surface-variant text-lg max-w-sm leading-relaxed">
              Join over 10,000 farmers using AI to optimize crop yields and sustainable growth.
            </p>
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm border-0">
              <div className="h-12 w-12 rounded-full signature-gradient flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined" data-icon="psychology">psychology</span>
              </div>
              <div>
                <div className="font-headline font-bold text-on-surface">Smart Advisory</div>
                <div className="text-on-surface-variant text-sm">Real-time agricultural insights</div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover opacity-20 mix-blend-multiply" alt="lush green vegetable garden rows with sunlight filtering through leaves in a modern high-end greenhouse setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX61MNs2no4NncGU1C9mLDyw2bCiB5N4Y4mzRvBuhLyigcNZV9-u8rby3MeU4EAyz0dMriJqozhW_ako8xAJ1Je2pj7dgVa2ztcieRBLmN5D-wjTibcBDxcaNbdfkfbTki1DAr9xjEGAuaWICbDgAYG3FTCSGC59kvgisoHuFfysIEmcinlfBhJNVvJcOPjo3RsihbIifwgsceoxnV4tdi5D7UiwfPrfO1B7DOHdPcj03WvfcsQTk5828YXfItzeCLxr4fwKPJ-xxb" />
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-low via-transparent to-transparent"></div>
          </div>
        </section>
        <section className="flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-surface">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <div className="text-2xl font-headline font-extrabold text-primary tracking-tight">AgriAI</div>
            </div>
            <div className="mb-10 text-center lg:text-left">
              <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight mb-2">Join our farming community</h2>
              <p className="text-on-surface-variant">Simple, sustainable, and supported growth starts here.</p>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <label className="font-headline font-semibold text-sm text-on-surface-variant ml-2">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined" data-icon="person">person</span>
                  </div>
                  <input 
                    className="block w-full h-16 pl-14 pr-5 bg-surface-container-high border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant font-medium" 
                    placeholder="John Doe" 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-headline font-semibold text-sm text-on-surface-variant ml-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined" data-icon="mail">mail</span>
                  </div>
                  <input 
                    className="block w-full h-16 pl-14 pr-5 bg-surface-container-high border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant font-medium" 
                    placeholder="john@example.com" 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-headline font-semibold text-sm text-on-surface-variant ml-2">Create Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined" data-icon="lock">lock</span>
                  </div>
                  <input 
                    className="block w-full h-16 pl-14 pr-5 bg-surface-container-high border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant font-medium" 
                    placeholder="••••••••" 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-4">
                <button 
                  disabled={loading}
                  className="w-full h-16 signature-gradient text-on-primary font-headline font-bold rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed" 
                  type="submit"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                  {!loading && (
                    <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
                  )}
                </button>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-outline-variant"></span>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-surface text-on-surface-variant font-medium">Or continue with</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  type="button"
                  className="w-full h-16 bg-surface-container-high border border-outline-variant text-on-surface font-headline font-semibold rounded-full shadow-sm hover:bg-surface-container-highest active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <img src="https://developers.google.com/identity/images/g-logo.png" className="h-6 w-6" alt="Google" />
                  Continue with Google
                </button>
              </div>
            </form>
            <div className="mt-10 text-center">
              <p className="text-on-surface-variant font-medium">
                Already have an account? 
                <Link className="text-primary font-bold hover:underline ml-1 underline-offset-4 decoration-2" href="/auth/login">Login</Link>
              </p>
            </div>
            <div className="mt-12 p-6 bg-surface-container-low rounded-xl border-0 flex items-start gap-4">
              <div className="text-primary mt-1">
                <span className="material-symbols-outlined text-3xl" data-icon="verified_user" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-on-surface">Data Privacy Policy</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">Your agricultural data is encrypted and remains your intellectual property. We prioritize your privacy above all else.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-12 px-8 bg-surface-container-low">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="font-headline font-bold text-on-surface">AgriAI</div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="text-on-surface-variant text-sm font-inter hover:text-primary transition-colors" href="#">Privacy Policy</Link>
            <Link className="text-on-surface-variant text-sm font-inter hover:text-primary transition-colors" href="#">Terms of Service</Link>
            <Link className="text-on-surface-variant text-sm font-inter hover:text-primary transition-colors" href="#">Farmer Support</Link>
            <Link className="text-on-surface-variant text-sm font-inter hover:text-primary transition-colors" href="#">Contact Us</Link>
          </div>
          <div className="text-on-surface-variant text-sm font-inter">© 2024 AgriAI Greenhouse. Nurturing digital growth.</div>
        </div>
      </footer>
    </div>
  );
}
