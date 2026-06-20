"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ──────────────── قائمة اللغات ──────────────── */
const TARGET_LANGUAGES = [
  { code: "en", suffix: "en", name: "English" },
  { code: "it", suffix: "it", name: "Italiano" },
  { code: "de", suffix: "de", name: "Deutsch" },
  { code: "fr", suffix: "fr", name: "Français" },
  { code: "es", suffix: "es", name: "Español" },
  { code: "pt", suffix: "pt", name: "Português" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  /* حالة الإعدادات الرئيسية */
  const [formData, setFormData] = useState({
    id: "",
    company_name: "",
    phone_number: "",
    whatsapp_number: "",
    email: "",
    address: "",
    facebook_url: "",
    instagram_url: "",
    about_text: "",
    site_title: "", // تم التغيير إلى site_title
    meta_description: "",
  });

  /* حالة تغيير كلمة المرور */
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  /* حالة تغيير البريد الإلكتروني */
  const [newEmail, setNewEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  /* ──────── جلب الإعدادات ──────── */
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .schema("public")
          .from("site_settings")
          .select("*")
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setFormData({
            id: data.id,
            company_name: data.company_name || "",
            phone_number: data.phone_number || "",
            whatsapp_number: data.whatsapp_number || "",
            email: data.email || "",
            address: data.address || "",
            facebook_url: data.facebook_url || "",
            instagram_url: data.instagram_url || "",
            about_text: data.about_text || "",
            site_title: data.site_title || "", // تم التغيير إلى site_title
            meta_description: data.meta_description || "",
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  /* ──────── الترجمة الآلية ──────── */
  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (!text || !text.trim()) return "";
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data[0].map((item: any) => item[0]).join("");
    } catch {
      return text;
    }
  };

  /* ──────── حفظ الإعدادات + الترجمة ──────── */
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");

    try {
      // 1. ترجمة النصوص المطلوبة لجميع اللغات
      const settingsData: Record<string, any> = {
        company_name: formData.company_name,
        phone_number: formData.phone_number,
        whatsapp_number: formData.whatsapp_number,
        email: formData.email,
        address: formData.address,
        facebook_url: formData.facebook_url,
        instagram_url: formData.instagram_url,
        about_text: formData.about_text,
        site_title: formData.site_title, // تم التغيير إلى site_title
        meta_description: formData.meta_description,
        updated_at: new Date().toISOString(),
      };

      // ترجمة about_text و site_title و meta_description لكل لغة
      for (const lang of TARGET_LANGUAGES) {
        const [aboutTrans, siteTitleTrans, metaDescTrans] = await Promise.all([
          translateText(formData.about_text, lang.code),
          translateText(formData.site_title, lang.code), // تم التغيير إلى site_title
          translateText(formData.meta_description, lang.code),
        ]);
        settingsData[`about_text_${lang.suffix}`] = aboutTrans;
        settingsData[`site_title_${lang.suffix}`] = siteTitleTrans; // تم التغيير إلى site_title
        settingsData[`meta_description_${lang.suffix}`] = metaDescTrans;
      }

      // 2. حفظ أو تحديث
      if (formData.id) {
        const { error } = await supabase
          .schema("public")
          .from("site_settings")
          .update(settingsData)
          .eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error, data } = await supabase
          .schema("public")
          .from("site_settings")
          .insert([settingsData])
          .select()
          .single();
        if (error) throw error;
        if (data) setFormData((prev) => ({ ...prev, id: data.id }));
      }

      setSaveMessage("✅ تم حفظ الإعدادات وترجمتها بنجاح!");
      setTimeout(() => setSaveMessage(""), 4000);
    } catch (err: any) {
      console.error(err);
      alert("حصل خطأ أثناء الحفظ: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ──────── تغيير كلمة المرور ──────── */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("❌ كلمتا المرور غير متطابقتين");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage("❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage("");
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) throw error;
      setPasswordMessage("✅ تم تغيير كلمة المرور بنجاح");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordMessage("❌ فشل تغيير كلمة المرور: " + err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /* ──────── تغيير البريد الإلكتروني ──────── */
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      setEmailMessage("❌ بريد إلكتروني غير صالح");
      return;
    }

    setIsUpdatingEmail(true);
    setEmailMessage("");
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });
      if (error) throw error;
      setEmailMessage("📧 تم إرسال رابط تأكيد إلى بريدك الجديد. سيتم التغيير بعد التأكيد.");
      setNewEmail("");
    } catch (err: any) {
      setEmailMessage("❌ فشل تغيير البريد: " + err.message);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  /* ──────── شاشة التحميل ──────── */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm animate-pulse">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  /* ──────── الواجهة ──────── */
  return (
    <div className="min-h-screen bg-gray-950 text-white relative" dir="rtl">
      {/* شريط علوي */}
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            إعدادات Expo Match
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            تحكم كامل في بيانات الموقع، SEO، والترجمة الآلية لـ 7 لغات
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* ── نموذج الإعدادات الرئيسية ── */}
        <form onSubmit={handleSaveSettings} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-2">
            <span>⚙️</span> معلومات الشركة والتواصل
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* اسم الشركة */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-300 mb-1.5 text-sm font-semibold">اسم الشركة / البراند</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                placeholder="Expo Match"
              />
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-gray-300 mb-1.5 text-sm font-semibold">رقم الهاتف العام</label>
              <input
                type="text"
                dir="ltr"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                placeholder="+39 123 456 789"
              />
            </div>

            {/* واتساب */}
            <div>
              <label className="block text-gray-300 mb-1.5 text-sm font-semibold">رقم الواتساب (للتواصل السريع)</label>
              <input
                type="text"
                dir="ltr"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                placeholder="+39 123 456 789"
              />
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-gray-300 mb-1.5 text-sm font-semibold">البريد الإلكتروني</label>
              <input
                type="email"
                dir="ltr"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                placeholder="info@expomatch.com"
              />
            </div>

            {/* العنوان */}
            <div>
              <label className="block text-gray-300 mb-1.5 text-sm font-semibold">العنوان ومقر الشركة</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                placeholder="Via Roma 123, Milano, Italia"
              />
            </div>

            {/* فيسبوك */}
            <div>
              <label className="block text-gray-300 mb-1.5 text-sm font-semibold">رابط صفحة الفيسبوك</label>
              <input
                type="url"
                dir="ltr"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                placeholder="https://facebook.com/..."
              />
            </div>

            {/* انستجرام */}
            <div>
              <label className="block text-gray-300 mb-1.5 text-sm font-semibold">رابط حساب انستجرام</label>
              <input
                type="url"
                dir="ltr"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          {/* النبذة + SEO */}
          <div className="mt-8 space-y-5">
            <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <span>📝</span> النبذة وتحسين محركات البحث (SEO)
            </h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-sm">
              <span className="text-amber-400 text-lg">🤖</span>
              <div>
                <p className="text-amber-300 font-semibold">ترجمة آلية لـ 6 لغات أوروبية</p>
                <p className="text-amber-400/70 text-xs mt-1">
                  سيتم ترجمة النبذة، عنوان الـ SEO، ووصف الـ SEO تلقائياً إلى الإنجليزية، الإيطالية، الألمانية، الفرنسية، الإسبانية، والبرتغالية.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-1.5 text-sm font-semibold">
                نبذة عن الشركة <span className="text-red-400">*</span> <span className="text-gray-500 font-normal">(بالعربية)</span>
              </label>
              <textarea
                rows={4}
                value={formData.about_text}
                onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm resize-none"
                placeholder="أكبر شركة مقاولات معارض في أوروبا..."
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1.5 text-sm font-semibold">
                Site Title (عنوان الصفحة الرئيسية في المتصفح)
              </label>
              <input
                type="text"
                value={formData.site_title}
                onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                placeholder="Expo Match – خدمات المعارض والمقاولات في إيطاليا"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1.5 text-sm font-semibold">
                Meta Description (وصف مختصر لمحركات البحث)
              </label>
              <textarea
                rows={2}
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm resize-none"
                placeholder="شركة رائدة في تصميم وبناء الأجنحة، اللوجستيات، والتركيبات..."
              />
            </div>
          </div>

          {/* زر حفظ الإعدادات */}
          <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between flex-wrap gap-4">
            <div className="text-emerald-400 font-bold text-sm">
              {saveMessage && <span className="animate-pulse">{saveMessage}</span>}
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الترجمة والحفظ...
                </>
              ) : (
                "💾 حفظ جميع الإعدادات"
              )}
            </button>
          </div>
        </form>

        {/* ── إدارة الحساب (البريد وكلمة المرور) ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-2">
            <span>🔐</span> إدارة الحساب
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* تغيير كلمة المرور */}
            <form onSubmit={handleChangePassword} className="space-y-4 bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-white font-semibold text-sm mb-3">تغيير كلمة المرور</h3>
              <input
                type="password"
                placeholder="كلمة المرور الجديدة"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
              >
                {isUpdatingPassword ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </button>
              {passwordMessage && (
                <p className={`text-xs mt-2 ${passwordMessage.includes("✅") ? "text-emerald-400" : "text-red-400"}`}>
                  {passwordMessage}
                </p>
              )}
            </form>

            {/* تغيير البريد الإلكتروني */}
            <form onSubmit={handleChangeEmail} className="space-y-4 bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <h3 className="text-white font-semibold text-sm mb-3">تغيير البريد الإلكتروني</h3>
              <input
                type="email"
                placeholder="البريد الإلكتروني الجديد"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="submit"
                disabled={isUpdatingEmail}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
              >
                {isUpdatingEmail ? "جاري الإرسال..." : "تحديث البريد الإلكتروني"}
              </button>
              {emailMessage && (
                <p className={`text-xs mt-2 ${emailMessage.includes("📧") ? "text-amber-400" : "text-red-400"}`}>
                  {emailMessage}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">سيتم إرسال رابط تأكيد إلى بريدك الجديد.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}