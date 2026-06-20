"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";

/*
  ╔══════════════════════════════════════════════════════════╗
  ║  الأعمدة المطلوبة في جدول services (Supabase):            ║
  ║  • display_order (int8, default 0)                       ║
  ║  • icon_url (text)                                      ║
  ║  • title, title_en, title_it, title_de, title_fr,        ║
  ║    title_es, title_pt (text)                             ║
  ║  • description, description_en, description_it,          ║
  ║    description_de, description_fr, description_es,        ║
  ║    description_pt (text)                                 ║
  ║  • image_urls (text[] أو jsonb)                          ║
  ║  • is_active (bool)                                      ║
  ║  • created_at (timestamptz)                              ║
  ╚══════════════════════════════════════════════════════════╝
*/

// قائمة اللغات المستهدفة مع رموزها (الترجمة من العربية إلى ...)
const TARGET_LANGUAGES = [
  { code: "en", suffix: "en", name: "English" },
  { code: "it", suffix: "it", name: "Italiano" },
  { code: "de", suffix: "de", name: "Deutsch" },
  { code: "fr", suffix: "fr", name: "Français" },
  { code: "es", suffix: "es", name: "Español" },
  { code: "pt", suffix: "pt", name: "Português" },
];

/* ──────────────── الأنواع ──────────────── */
interface Service {
  id: string;
  title: string;
  title_en?: string;
  title_it?: string;
  title_de?: string;
  title_fr?: string;
  title_es?: string;
  title_pt?: string;
  description: string;
  description_en?: string;
  description_it?: string;
  description_de?: string;
  description_fr?: string;
  description_es?: string;
  description_pt?: string;
  icon_url?: string;
  image_urls: string[];
  is_active: boolean;
  display_order: number;
}

/* ──────────────── الأيقونات المسبقة ──────────────── */
const PRESET_ICONS = [
  {
    id: "cube3d",
    label: "تصميم ثلاثي الأبعاد",
    label_en: "3D Design",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  },
  {
    id: "truck",
    label: "لوجستيات ونقل",
    label_en: "Logistics",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  },
  {
    id: "wrench",
    label: "تركيب وتجهيز",
    label_en: "Installation",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  },
  {
    id: "stand",
    label: "بناء الأجنحة",
    label_en: "Stand Construction",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>`,
  },
  {
    id: "paint",
    label: "تشطيبات وديكور",
    label_en: "Finishing",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  },
  {
    id: "lightbulb",
    label: "إضاءة وعروض",
    label_en: "Lighting",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
  },
  {
    id: "star",
    label: "خدمات مميزة",
    label_en: "Premium",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
  {
    id: "globe",
    label: "معارض دولية",
    label_en: "International Fairs",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  },
];

/* ──────────────── المكوّن الرئيسي ──────────────── */
export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);

  /* المودال */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* النموذج */
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_active: true,
    icon_url: "",
    image_urls: [] as string[],
  });

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconTab, setIconTab] = useState<"preset" | "upload">("preset");

  /* السحب والإفلات */
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  /* ──────── جلب الخدمات ──────── */
  const fetchServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .schema("public")
        .from("services")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data) setServices(data as Service[]);
    } catch (err) {
      console.error("فشل جلب الخدمات:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  /* ──────── الترجمة الآلية من العربية ──────── */
  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (!text || !text.trim()) return "";
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data[0].map((item: any) => item[0]).join("");
    } catch {
      return text; // في حالة الفشل نرجع النص الأصلي
    }
  };

  /* ──────── رفع ملف ──────── */
  const uploadFileToStorage = async (
    file: File,
    bucket: string,
    folder: string,
    compress = false
  ): Promise<string> => {
    let fileToUpload: File = file;
    if (compress && file.type.startsWith("image/") && !file.type.includes("svg")) {
      const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1280, useWebWorker: true };
      fileToUpload = await imageCompression(file, options);
    }
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${folder}-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, fileToUpload);
    if (error) throw new Error("فشل رفع الملف: " + error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  /* ──────── فتح/إغلاق المودال ──────── */
  const openNewServiceModal = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", is_active: true, icon_url: "", image_urls: [] });
    setMediaFiles([]);
    setIconFile(null);
    setIconTab("preset");
    setIsModalOpen(true);
  };

  const openEditServiceModal = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      title: service.title || "",
      description: service.description || "",
      is_active: service.is_active,
      icon_url: service.icon_url || "",
      image_urls: Array.isArray(service.image_urls) ? service.image_urls : [],
    });
    setMediaFiles([]);
    setIconFile(null);
    if (service.icon_url && PRESET_ICONS.some((p) => service.icon_url === `preset:${p.id}`)) {
      setIconTab("preset");
    } else if (service.icon_url) {
      setIconTab("upload");
    } else {
      setIconTab("preset");
    }
    setIsModalOpen(true);
  };

  /* ──────── حذف خدمة ──────── */
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة نهائياً؟")) return;
    try {
      const { error } = await supabase.schema("public").from("services").delete().eq("id", id);
      if (error) throw error;
      fetchServices();
    } catch (err: any) {
      alert("فشل الحذف: " + err.message);
    }
  };

  /* ──────── تبديل التفعيل السريع ──────── */
  const toggleActive = async (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    const newState = !service.is_active;
    try {
      const { error } = await supabase
        .schema("public")
        .from("services")
        .update({ is_active: newState })
        .eq("id", service.id);
      if (error) throw error;
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: newState } : s))
      );
    } catch (err: any) {
      alert("فشل تحديث الحالة: " + err.message);
    }
  };

  /* ──────── حفظ الخدمة ──────── */
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalIconUrl = formData.icon_url;
      let finalImageUrls = [...formData.image_urls];

      // رفع الأيقونة المخصصة لو وُجدت
      if (iconFile) {
        finalIconUrl = await uploadFileToStorage(iconFile, "project-media", "icon", false);
      }

      // رفع الصور الجديدة
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const url = await uploadFileToStorage(file, "project-media", "service", true);
          finalImageUrls.push(url);
        }
      }

      // ** الترجمة الآلية لجميع اللغات **
      const serviceData: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        icon_url: finalIconUrl,
        image_urls: finalImageUrls,
        is_active: formData.is_active,
      };

      // حلقة للترجمة لكل لغة مستهدفة
      for (const lang of TARGET_LANGUAGES) {
        // نترجم العنوان والوصف معاً (يمكن استخدام Promise.all لتسريع)
        const [translatedTitle, translatedDesc] = await Promise.all([
          translateText(formData.title, lang.code),
          translateText(formData.description, lang.code),
        ]);
        serviceData[`title_${lang.suffix}`] = translatedTitle;
        serviceData[`description_${lang.suffix}`] = translatedDesc;
      }

      // حفظ أو تعديل
      if (editingId) {
        const { error } = await supabase
          .schema("public")
          .from("services")
          .update(serviceData)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const maxOrder =
          services.length > 0
            ? Math.max(...services.map((s) => s.display_order || 0))
            : 0;
        serviceData.display_order = maxOrder + 1;

        const { error } = await supabase.schema("public").from("services").insert([serviceData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "حصل خطأ أثناء حفظ الخدمة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ──────── حذف صورة سابقة ──────── */
  const handleRemoveExistingImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  /* ──────── السحب والإفلات ──────── */
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };
  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };
  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    const reordered = [...services];
    const [movedItem] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, movedItem);
    setServices(reordered);
    setSavingOrder(true);
    try {
      const updates = reordered.map((service, idx) => ({
        id: service.id,
        display_order: idx + 1,
      }));
      for (const update of updates) {
        await supabase
          .schema("public")
          .from("services")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
      }
    } catch (err: any) {
      alert("فشل حفظ الترتيب: " + err.message);
      fetchServices();
    } finally {
      setSavingOrder(false);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  /* ──────── اختيار أيقونة ──────── */
  const selectPresetIcon = (presetId: string) => {
    setFormData((prev) => ({ ...prev, icon_url: `preset:${presetId}` }));
    setIconFile(null);
  };
  const clearIcon = () => {
    setFormData((prev) => ({ ...prev, icon_url: "" }));
    setIconFile(null);
  };
  const getPresetIdFromUrl = (url: string): string | null => {
    if (url && url.startsWith("preset:")) return url.replace("preset:", "");
    return null;
  };
  const renderIcon = (iconUrl: string | undefined, size = "w-8 h-8") => {
    if (!iconUrl) {
      return (
        <span className={`${size} flex items-center justify-center text-gray-500`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
            <rect x="3" y="3" width="18" height="18" rx="3" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" />
          </svg>
        </span>
      );
    }
    const presetId = getPresetIdFromUrl(iconUrl);
    if (presetId) {
      const preset = PRESET_ICONS.find((p) => p.id === presetId);
      if (preset) {
        return <span className={`${size} text-blue-400`} dangerouslySetInnerHTML={{ __html: preset.svg }} />;
      }
    }
    return <img src={iconUrl} alt="أيقونة" className={`${size} object-contain`} />;
  };

  /* ──────── شاشة تحميل ──────── */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm animate-pulse">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  /* ──────── الواجهة ──────── */
  return (
    <div className="min-h-screen bg-gray-950 text-white relative" dir="rtl">
      {/* شريط علوي */}
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              إدارة الخدمات
            </h1>
            <p className="text-gray-500 text-sm mt-1">Expo Match – 7 لغات مع ترجمة آلية فورية</p>
          </div>
          <div className="flex items-center gap-3">
            {savingOrder && (
              <span className="text-xs text-amber-400 flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                جاري حفظ الترتيب...
              </span>
            )}
            <button
              onClick={openNewServiceModal}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 flex items-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              إضافة خدمة جديدة
            </button>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {services.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">لا توجد خدمات بعد</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              ابدأ بإضافة خدماتك لتظهر بـ 7 لغات في موقع Expo Match
            </p>
            <button onClick={openNewServiceModal} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all text-sm">
              + إضافة أول خدمة
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-5 py-3 bg-gray-800/50 border-b border-gray-800 flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              اسحب الصفوف عبر ⋮⋮ لتغيير ترتيب الظهور في الموقع
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">الأيقونة</th>
                    <th className="px-4 py-3">الخدمة (AR)</th>
                    <th className="px-4 py-3">EN</th>
                    <th className="px-4 py-3">IT</th>
                    <th className="px-4 py-3">DE</th>
                    <th className="px-4 py-3">FR</th>
                    <th className="px-4 py-3">ES</th>
                    <th className="px-4 py-3">PT</th>
                    <th className="px-4 py-3 text-center">الحالة</th>
                    <th className="px-4 py-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr
                      key={service.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => openEditServiceModal(service)}
                      className={`border-b border-gray-800/70 transition-all cursor-pointer group
                        ${index === dragItem.current ? "opacity-40 bg-gray-800/50" : "hover:bg-gray-800/30"}
                        ${service.is_active ? "" : "opacity-60"}`}
                    >
                      <td className="px-2 py-3">
                        <span className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-300 transition-colors select-none text-lg leading-none">
                          ⋮⋮
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{index + 1}</td>
                      <td className="px-4 py-3"><div className="flex justify-center">{renderIcon(service.icon_url, "w-9 h-9")}</div></td>
                      <td className="px-4 py-3"><p className="text-white font-semibold text-sm truncate max-w-[140px]">{service.title}</p></td>
                      <td className="px-4 py-3"><p className="text-gray-400 text-xs truncate max-w-[100px]">{service.title_en || "—"}</p></td>
                      <td className="px-4 py-3"><p className="text-gray-400 text-xs truncate max-w-[100px]">{service.title_it || "—"}</p></td>
                      <td className="px-4 py-3"><p className="text-gray-400 text-xs truncate max-w-[100px]">{service.title_de || "—"}</p></td>
                      <td className="px-4 py-3"><p className="text-gray-400 text-xs truncate max-w-[100px]">{service.title_fr || "—"}</p></td>
                      <td className="px-4 py-3"><p className="text-gray-400 text-xs truncate max-w-[100px]">{service.title_es || "—"}</p></td>
                      <td className="px-4 py-3"><p className="text-gray-400 text-xs truncate max-w-[100px]">{service.title_pt || "—"}</p></td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => toggleActive(e, service)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border
                            ${service.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${service.is_active ? "bg-emerald-400" : "bg-red-400"}`} />
                          {service.is_active ? "متاحة" : "متوقفة"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={(e) => { e.stopPropagation(); openEditServiceModal(service); }} className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all text-sm" title="تعديل">✏️</button>
                          <button onClick={(e) => handleDelete(e, service.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm" title="حذف">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-gray-800/30 border-t border-gray-800 text-xs text-gray-500 flex justify-between items-center">
              <span>إجمالي الخدمات: <strong className="text-gray-300">{services.length}</strong></span>
              <span>الخدمات المتاحة: <strong className="text-emerald-400">{services.filter(s => s.is_active).length}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* ── المودال ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-10 px-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-400">{editingId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</h2>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all">✕</button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <span className="text-amber-400 text-lg mt-0.5">🤖</span>
              <div>
                <p className="text-amber-300 text-sm font-semibold">ترجمة آلية لـ 6 لغات أوروبية</p>
                <p className="text-amber-400/70 text-xs mt-1">سيتم ترجمة العنوان والوصف تلقائياً إلى: الإنجليزية، الإيطالية، الألمانية، الفرنسية، الإسبانية، البرتغالية.</p>
              </div>
            </div>

            <form onSubmit={handleSaveService} className="space-y-5">
              <div>
                <label className="block text-gray-300 mb-1.5 text-sm font-semibold">اسم الخدمة <span className="text-red-400">*</span> <span className="text-gray-500 font-normal">(بالعربية)</span></label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="مثال: تصميم الأجنحة ثلاثي الأبعاد" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-gray-300 mb-1.5 text-sm font-semibold">الوصف المختصر <span className="text-red-400">*</span> <span className="text-gray-500 font-normal">(بالعربية)</span></label>
                <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="وصف جذاب للخدمة..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm resize-none" />
              </div>

              {/* الأيقونة بنفس الكود السابق */}
              <div>
                <label className="block text-gray-300 mb-3 text-sm font-semibold">أيقونة الخدمة</label>
                <div className="flex gap-1 bg-gray-800 rounded-xl p-1 mb-4 w-fit">
                  <button type="button" onClick={() => setIconTab("preset")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${iconTab === "preset" ? "bg-gray-700 text-white shadow" : "text-gray-400 hover:text-white"}`}>📦 أيقونات جاهزة</button>
                  <button type="button" onClick={() => setIconTab("upload")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${iconTab === "upload" ? "bg-gray-700 text-white shadow" : "text-gray-400 hover:text-white"}`}>📤 رفع SVG</button>
                </div>
                {iconTab === "preset" && (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {PRESET_ICONS.map((preset) => {
                      const isSelected = formData.icon_url === `preset:${preset.id}`;
                      return (
                        <button key={preset.id} type="button" onClick={() => selectPresetIcon(preset.id)} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${isSelected ? "border-blue-500 bg-blue-500/10" : "border-gray-700 bg-gray-800 hover:border-gray-600"}`}>
                          <span className={`w-8 h-8 ${isSelected ? "text-blue-400" : "text-gray-400"}`} dangerouslySetInnerHTML={{ __html: preset.svg }} />
                          <span className="text-[10px] text-gray-500 leading-tight">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {iconTab === "upload" && (
                  <div className="bg-gray-800 border border-dashed border-gray-600 rounded-xl p-5 text-center">
                    <input type="file" accept=".svg,image/svg+xml" onChange={(e) => { const file = e.target.files?.[0]; if(file){ setIconFile(file); setFormData(prev => ({...prev, icon_url: URL.createObjectURL(file)})); }}} className="w-full text-gray-400 text-sm cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-sm file:font-medium file:cursor-pointer hover:file:bg-blue-500 file:transition-all" />
                    <p className="text-xs text-gray-500 mt-2">يفضّل SVG بحجم 24×24 أو 48×48</p>
                  </div>
                )}
                {formData.icon_url && <button type="button" onClick={clearIcon} className="mt-3 text-xs text-red-400 hover:text-red-300 underline">مسح الأيقونة</button>}
              </div>

              {/* الصور */}
              <div>
                <label className="block text-gray-300 mb-1.5 text-sm font-semibold">صور الخدمة <span className="text-gray-500 font-normal">(يتم ضغطها تلقائياً)</span></label>
                <input type="file" multiple accept="image/*" onChange={(e) => setMediaFiles(e.target.files ? Array.from(e.target.files) : [])} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-400 cursor-pointer text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-700 file:text-gray-300 file:text-xs file:cursor-pointer hover:file:bg-gray-600 file:transition-all" />
                {editingId && formData.image_urls.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <p className="text-xs text-gray-400 mb-3">الصور المرفوعة مسبقاً:</p>
                    <div className="flex flex-wrap gap-3">
                      {formData.image_urls.map((url, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-600 group/img">
                          <img src={url} className="w-full h-full object-cover group-hover/img:opacity-40 transition-opacity" alt="مصغر" />
                          <button type="button" onClick={() => handleRemoveExistingImage(idx)} className="absolute inset-0 m-auto w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all shadow-lg text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 bg-gray-800/60 p-4 rounded-xl border border-gray-700">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
                <span className="text-gray-300 text-sm font-medium">الخدمة متاحة للعملاء حالياً</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-800">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري الترجمة لـ 6 لغات...</>) : editingId ? "💾 حفظ التعديلات" : "✅ إضافة الخدمة"}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 bg-gray-700 hover:bg-gray-600 active:scale-[0.98] text-white py-3 rounded-xl font-semibold transition-all text-sm disabled:opacity-60">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>
    </div>
  );
}