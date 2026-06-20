"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Head from "next/head";

// 1. استدعاء الأيقونات الجديدة (المطابقة للتصميم)
import { 
  LayoutGrid, // للـ Dashboard
  FileText,   // للـ Portfolio
  MessageSquare, // للـ Enquiries
  PencilRuler, // للـ Services
  Settings,   // للـ Settings
  LogOut, 
  User 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // حالات تسجيل الدخول
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [captchaStatus, setCaptchaStatus] = useState<"idle" | "verifying" | "verified">("idle");

  const COMPANY_NAME = "EXPO MATCH";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCaptcha = () => {
    if (captchaStatus === "verified") return;
    setCaptchaStatus("verifying");
    setTimeout(() => {
      setCaptchaStatus("verified");
    }, 1500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (captchaStatus !== "verified") {
      setLoginError("⚠️ يرجى تأكيد أنك لست روبوت أولاً.");
      return;
    }

    setIsLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError("❌ البريد الإلكتروني أو كلمة المرور غير صحيحة!");
      setCaptchaStatus("idle");
      setIsLoggingIn(false);
    } else {
      setIsLoggingIn(false);
      router.push("/admin"); 
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b1120] text-white">
        <div className="flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xl animate-pulse text-cyan-400 font-bold">Loading System...</p>
        </div>
      </div>
    );
  }

  // المكون الخاص بلوجو Expo Match (متصمم كود)
  const CustomLogo = ({ size = "normal" }) => {
    const isLarge = size === "large";
    return (
      <div className="flex items-center gap-3">
        {/* رسمة حرف الـ X بالـ CSS - شكل احترافي جداً */}
        <div className={`relative flex items-center justify-center shrink-0 ${isLarge ? 'w-12 h-12' : 'w-9 h-9'}`}>
           <div className={`absolute bg-cyan-600 rounded-sm transform rotate-45 ${isLarge ? 'w-2.5 h-12' : 'w-1.5 h-9'}`} />
           <div className={`absolute bg-cyan-400 rounded-sm transform -rotate-45 ${isLarge ? 'w-2.5 h-12' : 'w-1.5 h-9'}`} />
           <div className={`absolute bg-cyan-200 rounded-sm transform rotate-45 z-10 ${isLarge ? 'w-2.5 h-6 top-1.5 right-2.5' : 'w-1.5 h-4 top-1.5 right-2'}`} />
        </div>
        {/* الكلمة - نص عريض جداً ونص رفيع */}
        <h1 className={`${isLarge ? 'text-3xl' : 'text-2xl'} text-white tracking-wider`}>
          <span className="font-black text-slate-100">EXPO</span> <span className="font-light text-white">MATCH</span>
        </h1>
      </div>
    );
  };

  // شاشة تسجيل الدخول
  if (!session) {
    return (
      <>
        <Head>
          <title>Login - {COMPANY_NAME}</title>
        </Head>
        <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-4 relative overflow-hidden" dir="ltr">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-900 via-[#0b1120] to-[#0b1120]" />
          <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.05)] max-w-lg w-full relative z-10">
            
            {/* اللوجو في صفحة اللوجين */}
            <div className="flex flex-col items-center text-center mb-8">
              <CustomLogo size="large" />
              <p className="text-slate-400 text-sm mt-3 font-mono">ADMIN DASHBOARD LOGIN</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-slate-400 mb-1 text-sm">Admin Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="admin@expomatch.com" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 text-sm">Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono" placeholder="••••••••" />
              </div>
              <div onClick={handleCaptcha} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${captchaStatus === "verified" ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]" : "bg-[#0b1120] border-slate-700 hover:border-slate-500"}`}>
                <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
                  {captchaStatus === "verifying" && <span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />}
                  {captchaStatus === "verified" && <span className="text-cyan-400 font-bold text-xl">✓</span>}
                </div>
                <span className={`font-semibold text-sm ${captchaStatus === "verified" ? "text-cyan-400" : "text-slate-300"}`}>I am not a robot</span>
              </div>
              {loginError && <div className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg border border-red-400/20">{loginError}</div>}
              <button type="submit" disabled={isLoggingIn || captchaStatus === "verifying"} className="w-full bg-linear-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 text-slate-900 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)] mt-2">
                {isLoggingIn ? "Authenticating..." : "Login to Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // 2. تحديث قائمة الروابط
  const navLinks = [
    { name: "Dashboard", subName: "", href: "/admin", icon: <LayoutGrid strokeWidth={1.5} size={22} /> },
    { name: "Portfolio", subName: "Projects", href: "/admin/portfolio", icon: <FileText strokeWidth={1.5} size={22} /> },
    { name: "Enquiries", subName: "Leads", href: "/admin/enquiries", icon: <MessageSquare strokeWidth={1.5} size={22} /> },
    { name: "Services", subName: "", href: "/admin/services", icon: <PencilRuler strokeWidth={1.5} size={22} /> },
    { name: "Settings", subName: "", href: "/admin/settings", icon: <Settings strokeWidth={1.5} size={22} /> },
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard - {COMPANY_NAME}</title>
      </Head>

      <div className="flex h-screen bg-[#0b1120] text-slate-200 font-sans overflow-hidden" dir="ltr">
        
        {/* Sidebar */}
        <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col shrink-0 pt-6">
          
          {/* Logo Area (اللوجو الاحترافي بالكود) */}
          <div className="px-6 mb-8">
             <CustomLogo size="normal" />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <button
                  key={link.name}
                  onClick={() => router.push(link.href)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? "bg-slate-800/80 text-cyan-400 border border-slate-700/50 shadow-sm" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <span className={isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400 transition-colors"}>
                    {link.icon}
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-[15px]">{link.name}</span>
                    {/* العنوان الفرعي */}
                    {link.subName && (
                      <span className={`text-[11px] mt-0.5 ${isActive ? "text-cyan-600" : "text-slate-500"}`}>
                        {link.subName}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Admin Profile & Logout */}
          <div className="p-4 border-t border-slate-800 m-4 rounded-2xl bg-slate-800/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[url('https://i.pinimg.com/736x/c0/27/be/c027bec07c2dc08b9df60921dfd539bd.jpg')] bg-cover bg-center border-2 border-slate-700 shrink-0" />
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-white truncate">Admin Profile</p>
                <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                supabase.auth.signOut();
                router.push("/admin"); 
              }} 
              className="w-full flex items-center justify-center gap-2 bg-transparent border border-slate-700 hover:bg-slate-700 hover:text-white text-slate-300 py-2.5 rounded-xl transition-all text-sm font-medium"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>

      </div>
    </>
  );
}