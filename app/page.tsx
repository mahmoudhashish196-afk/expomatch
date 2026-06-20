"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Menu, X, MapPin, CheckCircle2, ArrowRight, Calendar, ShieldCheck, Ruler, ChevronLeft, ChevronRight, Tag, Activity, Lightbulb, FileEdit, Factory, Truck } from "lucide-react";

type LangType = "EN" | "AR" | "IT" | "DE" | "FR" | "ES" | "PT";

/* ── أيقونة الواتساب ── */
function WhatsAppIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

/* ── أيقونة الفيسبوك ── */
function Facebook(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

/* ── أيقونة انستجرام ── */
function Instagram(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/* ── اللوجو المبرمج (ديناميكي) ── */
const CustomLogo = ({ companyName }: { companyName?: string }) => {
  const defaultName = "EXPO MATCH";
  const nameToUse = companyName || defaultName;
  const parts = nameToUse.split(" ");
  const firstPart = parts[0];
  const secondPart = parts.slice(1).join(" ") || "";

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center shrink-0 w-8 h-8">
         <div className="absolute bg-cyan-600 rounded-sm transform rotate-45 w-1.5 h-8" />
         <div className="absolute bg-cyan-400 rounded-sm transform -rotate-45 w-1.5 h-8" />
         <div className="absolute bg-cyan-200 rounded-sm transform rotate-45 z-10 w-1.5 h-4 top-1 right-1.5" />
      </div>
      <span className="text-xl font-bold tracking-wider">
        <span className="font-black text-white">{firstPart}</span>{" "}
        <span className="font-light text-slate-300">{secondPart}</span>
      </span>
    </div>
  );
};

/* ── الأيقونات المسبقة (Preset Icons) مطابقة للوحة الإدارة ── */
const PRESET_ICONS: Record<string, string> = {
  cube3d: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  stand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>`,
  paint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  lightbulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
};

export default function HomePage() {
  const [lang, setLang] = useState<LangType>("EN");
  const [projects, setProjects] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* ── حالة نافذة المشاريع (Modal) ── */
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /* ── حالة نافذة الخدمات (Modal) ── */
  const [selectedService, setSelectedService] = useState<any>(null);
  const [currentServiceImageIndex, setCurrentServiceImageIndex] = useState(0);

  /* ── حالة تصفّح الصور في بطاقات المحفظة ── */
  const [cardImageIndices, setCardImageIndices] = useState<Record<string, number>>({});

  /* ── حالة نموذج طلب السعر ── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaChecked, setCaptchaChecked] = useState(false);

  const [formData, setFormData] = useState({
    client_name: "",
    email: "",
    phone: "",
    show_name: "",
    city_country: "",
    booth_area: "",
    start_date: null as Date | null,
    end_date: null as Date | null,
    message: "",
  });

  /* ── جلب الإعدادات والمشاريع والخدمات ── */
  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.language) {
      const browserLang = window.navigator.language.split("-")[0].toUpperCase() as LangType;
      const supportedLangs = ["EN", "AR", "IT", "DE", "FR", "ES", "PT"];
      if (supportedLangs.includes(browserLang)) {
        setLang(browserLang);
      }
    }

    async function fetchData() {
      // 1. جلب المشاريع
      const { data: projData } = await supabase
        .from("projects")
        .select("*")
        .eq("is_hidden", false)
        .order("display_order", { ascending: true })
        .limit(6);
      if (projData) {
        setProjects(projData);
        const initialIndices: Record<string, number> = {};
        projData.forEach((p: any) => {
          const images = getProjectImagesArray(p);
          if (images.length > 0) initialIndices[p.id] = 0;
        });
        setCardImageIndices(initialIndices);
      }

      // 2. جلب الخدمات
      const { data: srvData } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true });
      if (srvData) setServicesList(srvData);

      // 3. جلب الإعدادات
      const { data: setData } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      if (setData) setSettings(setData);
    }
    fetchData();

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── منع التمرير في الخلفية عند فتح أي مودال ── */
  useEffect(() => {
    document.body.style.overflow = (selectedProject || selectedService) ? "hidden" : "unset";
  }, [selectedProject, selectedService]);

  /* ── دوال مساعدة لاستخراج الصور ── */
  const getProjectImagesArray = (proj: any): string[] => {
    if (!proj) return [];
    let extraImages: string[] = [];
    if (Array.isArray(proj.images)) {
      extraImages = proj.images;
    } else if (typeof proj.images === 'string') {
      try { extraImages = JSON.parse(proj.images); } catch {}
    } else if (proj.gallery_images) {
      if (Array.isArray(proj.gallery_images)) extraImages = proj.gallery_images;
      else if (typeof proj.gallery_images === 'string') {
        try { extraImages = JSON.parse(proj.gallery_images); } catch {}
      }
    }
    return [proj.cover_image, ...extraImages].filter((v, i, a) => v && a.indexOf(v) === i);
  };

  const getServiceImages = (service: any): string[] => {
    if (!service) return [];
    if (Array.isArray(service.image_urls)) return service.image_urls.filter(Boolean);
    if (typeof service.image_urls === 'string') {
      try { return JSON.parse(service.image_urls).filter(Boolean); } catch { return []; }
    }
    return [];
  };

  /* ── أدوات الترجمة الذكية ── */
  const getTranslatedText = (item: any, field: string) => {
    if (!item) return "";
    const langKey = lang.toLowerCase();
    if (item[`${field}_${langKey}`]) return item[`${field}_${langKey}`];
    if (item.translations?.[field]?.[langKey]) return item.translations[field][langKey];
    return item[field] || "";
  };

  const getAboutText = () => {
    if (!settings) return "";
    const langKey = lang.toLowerCase();
    return settings[`about_text_${langKey}`] || settings.about_text || "";
  };

  /* ── عرض أيقونة الخدمة ── */
  const renderServiceIcon = (service: any) => {
    const iconUrl = service?.icon_url;
    if (iconUrl) {
      if (iconUrl.startsWith("preset:")) {
        const presetId = iconUrl.replace("preset:", "");
        const svgContent = PRESET_ICONS[presetId];
        if (svgContent) {
          return <span className="w-8 h-8 text-cyan-400" dangerouslySetInnerHTML={{ __html: svgContent }} />;
        }
      } else {
        return <img src={iconUrl} alt="service icon" className="w-8 h-8 object-contain" />;
      }
    }
    return (
      <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
      </svg>
    );
  };

  /* ── التنقل بين صور البطاقة والمودال ── */
  const handleCardPrevImage = (e: React.MouseEvent, projId: string, images: string[]) => {
    e.stopPropagation();
    if (images.length === 0) return;
    setCardImageIndices(prev => ({ ...prev, [projId]: (prev[projId] ?? 0) - 1 < 0 ? images.length - 1 : (prev[projId] ?? 0) - 1 }));
  };

  const handleCardNextImage = (e: React.MouseEvent, projId: string, images: string[]) => {
    e.stopPropagation();
    if (images.length === 0) return;
    setCardImageIndices(prev => ({ ...prev, [projId]: ((prev[projId] ?? 0) + 1) % images.length }));
  };

  const modalImages = selectedProject ? getProjectImagesArray(selectedProject) : [];
  const nextModalImage = (e: any) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % modalImages.length); };
  const prevModalImage = (e: any) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + modalImages.length) % modalImages.length); };

  const serviceModalImages = selectedService ? getServiceImages(selectedService) : [];
  const nextServiceImage = (e: any) => { e.stopPropagation(); setCurrentServiceImageIndex(prev => (prev + 1) % serviceModalImages.length); };
  const prevServiceImage = (e: any) => { e.stopPropagation(); setCurrentServiceImageIndex(prev => (prev - 1 + serviceModalImages.length) % serviceModalImages.length); };

  /* ── التحقق من النموذج والإرسال ── */
  const validateQuoteForm = (): string | null => {
    if (!formData.client_name.trim() || !formData.email.trim() || !formData.phone.trim() ||
        !formData.show_name.trim() || !formData.city_country.trim() || !formData.booth_area.trim() ||
        !formData.start_date || !formData.end_date) return t[lang].fillAll;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return t[lang].invalidEmail;
    if (formData.phone.replace(/\D/g, "").length < 8) return t[lang].invalidPhone;
    if (formData.start_date && formData.end_date && formData.end_date <= formData.start_date) return t[lang].dateError;
    if (!captchaChecked) return t[lang].captchaError;
    return null;
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage("");
    const err = validateQuoteForm();
    if (err) { setErrorMessage(err); setSubmitStatus("error"); setTimeout(() => setSubmitStatus("idle"), 4000); return; }
    setIsSubmitting(true); setSubmitStatus("idle");
    try {
      const { error } = await supabase.from("leads").insert([{
        client_name: formData.client_name, email: formData.email, phone: formData.phone,
        show_name: formData.show_name, city_country: formData.city_country,
        booth_area: Number(formData.booth_area),
        start_date: formData.start_date?.toISOString().split("T")[0],
        end_date: formData.end_date?.toISOString().split("T")[0],
        message: formData.message, status: "New"
      }]);
      if (error) throw error;
      setSubmitStatus("success");
      setFormData({ client_name: "", email: "", phone: "", show_name: "", city_country: "", booth_area: "", start_date: null, end_date: null, message: "" });
      setCaptchaChecked(false);
      setTimeout(() => setSubmitStatus("idle"), 6000);
    } catch (err: any) { 
      setSubmitStatus("error"); 
      setErrorMessage(`DB Error: ${err.message || err.details || JSON.stringify(err)}`);
      console.error("Supabase Error:", err);
    } finally { setIsSubmitting(false); }
  };

  /* ── قاموس الترجمة ── */
  const t: Record<LangType, any> = {
    EN: {
      dir: "ltr",
      nav: ["Services", "About Us", "Portfolio", "Process"],
      headerClaimBtn: "Claim Free 3D Design",
      heroTitle: "UNFORGETTABLE EXHIBITION STANDS ACROSS EUROPE.",
      heroSub: "Italian Craftsmanship. Pan European Reach. We Match Your Vision to a Perfect Showcase.",
      heroCta: "Get Your FREE 3D Design & Quote",
      heroMicrocopy: "No hidden fees. 100% commitment free.",
      trustText: "ITALIAN DESIGN, EUROPEAN EXECUTION.",
      trustSub: "Precision. Quality. Timely Delivery.",
      trustStatsMain: "Projects Delivered",
      trustStatsSub: "Across 15 European Countries",
      aboutUs: "About Us",
      servicesTitle: "Our Services",
      portfolioTitle: "Portfolio Highlights",
      viewAll: "View All Projects",
      projectDetails: "Project Details",
      year: "Execution Year",
      type: "Project Type",
      status: "Status",
      serviceDetails: "Service Details",
      processTitle: "How We Work",
      processSteps: [
        { icon: <Lightbulb className="w-6 h-6" />, title: "Discovery & Free 3D Concept", desc: "We receive your brief and deliver a preliminary free 3D design to visualize your stand." },
        { icon: <FileEdit className="w-6 h-6" />, title: "Refinement & Agreement", desc: "We fine tune the design, agree on the final layout, and sign the contract." },
        { icon: <Factory className="w-6 h-6" />, title: "In House Fabrication", desc: "Our skilled craftsmen build and assemble your stand in our own workshop and warehouse." },
        { icon: <Truck className="w-6 h-6" />, title: "On Site Setup & Support", desc: "We transport and install your stand swiftly at the exhibition venue, providing full on site support." }
      ],
      formTitleNew: "Unlock Your Free Custom 3D Concept Today",
      formMotivationText: "Fill in your exhibition details below. Our team will analyze your requirements and deliver a bespoke 3D visualization and an accurate quote—completely free of charge.",
      statsTitle: "128+",
      statsSub: "Projects Delivered Across 15 European Countries",
      fName: "Full Name *", fEmail: "Email Address *", fPhone: "Phone Number *",
      fShow: "Show Name *", fCity: "City / Country *", fSize: "Stand Size (sqm) *",
      fStartDate: "Start Date *", fEndDate: "End Date *", fMsg: "Additional Details (optional)",
      captcha: "I'm not a robot", submitBtnNew: "GET MY FREE DESIGN",
      successMsg: "Your request has been received! Our team will prepare your free 3D concept shortly.",
      fillAll: "Please fill in all required fields.", invalidEmail: "Please enter a valid email address.",
      invalidPhone: "Please enter a valid phone number.", dateError: "End date must be after start date.",
      captchaError: "Please confirm you are not a robot.", error: "An error occurred. Please try again.",
      completedStatus: "Completed", inProgressStatus: "In Progress",
      footerRights: `© ${new Date().getFullYear()} EXPO MATCH. All rights reserved.`
    },
    AR: {
      dir: "rtl",
      nav: ["الخدمات", "ماذا عنا", "أعمالنا", "آلية العمل"],
      headerClaimBtn: "احصل على تصميم 3D مجاني",
      heroTitle: "أجنحة معارض لا تُنسى في جميع أنحاء أوروبا.",
      heroSub: "براعة إيطالية. انتشار أوروبي. نطابق رؤيتك مع العرض المثالي.",
      heroCta: "احصل على تصميمك ثلاثي الأبعاد وعرض السعر مجاناً",
      heroMicrocopy: "بدون رسوم خفية. 100% بدون التزامات.",
      trustText: "تصميم إيطالي، تنفيذ أوروبي.",
      trustSub: "دقة. جودة. تسليم في الموعد.",
      trustStatsMain: "مشروع تم تسليمه",
      trustStatsSub: "في 15 دولة أوروبية",
      aboutUs: "ماذا عنا",
      servicesTitle: "خدماتنا",
      portfolioTitle: "أبرز أعمالنا",
      viewAll: "عرض كل المشاريع",
      projectDetails: "تفاصيل المشروع",
      year: "سنة التنفيذ",
      type: "نوع المشروع",
      status: "الحالة",
      serviceDetails: "تفاصيل الخدمة",
      processTitle: "كيف نعمل",
      processSteps: [
        { icon: <Lightbulb className="w-6 h-6" />, title: "الاستلام والتصميم ثلاثي الأبعاد المجاني", desc: "نستلم طلبك ونقدم تصميماً أولياً مجاناً ثلاثي الأبعاد لتتصور جناحك." },
        { icon: <FileEdit className="w-6 h-6" />, title: "التحسين والاتفاق", desc: "نعدل التصميم ونتفق على الشكل النهائي ونوقع العقد." },
        { icon: <Factory className="w-6 h-6" />, title: "التصنيع الداخلي", desc: "يقوم حرفيونا ببناء وتجميع جناحك في ورشنا ومستودعاتنا الخاصة." },
        { icon: <Truck className="w-6 h-6" />, title: "التركيب في الموقع والدعم", desc: "نقوم بنقل وتركيب جناحك بسرعة في أرض المعرض مع دعم كامل في الموقع." }
      ],
      formTitleNew: "اطلق العنان لتصميمك ثلاثي الأبعاد المخصص اليوم",
      formMotivationText: "املأ تفاصيل معرضك أدناه. سيقوم فريقنا بتحليل متطلباتك وتقديم تصور ثلاثي الأبعاد وعرض سعر دقيق - مجاناً تماماً.",
      statsTitle: "+128",
      statsSub: "مشروع تم تسليمه في 15 دولة أوروبية",
      fName: "الاسم بالكامل *", fEmail: "البريد الإلكتروني *", fPhone: "رقم الهاتف *",
      fShow: "اسم المعرض *", fCity: "المدينة / الدولة *", fSize: "مساحة الجناح (متر مربع) *",
      fStartDate: "تاريخ البداية *", fEndDate: "تاريخ النهاية *", fMsg: "تفاصيل إضافية (اختياري)",
      captcha: "أنا لست روبوت", submitBtnNew: "احصل على تصميمي المجاني",
      successMsg: "تم استلام طلبك! سيقوم فريقنا بإعداد تصورك ثلاثي الأبعاد المجاني قريباً.",
      fillAll: "يرجى ملء جميع الحقول المطلوبة.", invalidEmail: "يرجى إدخال بريد إلكتروني صالح.",
      invalidPhone: "يرجى إدخال رقم هاتف صالح.", dateError: "يجب أن يكون تاريخ النهاية بعد تاريخ البداية.",
      captchaError: "يرجى التأكيد أنك لست روبوت.", error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      completedStatus: "مكتمل", inProgressStatus: "قيد التنفيذ",
      footerRights: `© ${new Date().getFullYear()} EXPO MATCH. جميع الحقوق محفوظة.`
    },
    IT: {
      dir: "ltr",
      nav: ["Servizi", "Chi Siamo", "Portfolio", "Processo"],
      headerClaimBtn: "Richiedi Design 3D Gratuito",
      heroTitle: "STAND FIERISTICI INDIMENTICABILI IN TUTTA EUROPA.",
      heroSub: "Artigianato Italiano. Copertura Europea. Trasformiamo la tua visione in realtà.",
      heroCta: "Ottieni il tuo Design 3D e Preventivo GRATUITI",
      heroMicrocopy: "Nessun costo nascosto. 100% senza impegno.",
      trustText: "DESIGN ITALIANO, ESECUZIONE EUROPEA.",
      trustSub: "Precisione. Qualità. Consegna puntuale.",
      trustStatsMain: "Progetti Consegnati",
      trustStatsSub: "In 15 Paesi Europei",
      aboutUs: "Chi Siamo",
      servicesTitle: "I Nostri Servizi",
      portfolioTitle: "I Nostri Progetti",
      viewAll: "Vedi Tutti i Progetti",
      projectDetails: "Dettagli del Progetto",
      year: "Anno di Esecuzione",
      type: "Tipo di Progetto",
      status: "Stato",
      serviceDetails: "Dettagli del Servizio",
      processTitle: "Come Lavoriamo",
      processSteps: [
        { icon: <Lightbulb className="w-6 h-6" />, title: "Scoperta e Concept 3D Gratuito", desc: "Riceviamo la tua richiesta e forniamo un design 3D preliminare gratuito per visualizzare il tuo stand." },
        { icon: <FileEdit className="w-6 h-6" />, title: "Perfezionamento e Accordo", desc: "Rifiniamo il design, concordiamo il layout finale e firmiamo il contratto." },
        { icon: <Factory className="w-6 h-6" />, title: "Fabbricazione Interna", desc: "I nostri artigiani costruiscono e assemblano il tuo stand nel nostro laboratorio e magazzino." },
        { icon: <Truck className="w-6 h-6" />, title: "Installazione e Supporto in Sede", desc: "Trasportiamo e montiamo rapidamente il tuo stand in fiera, offrendo pieno supporto in loco." }
      ],
      formTitleNew: "Sblocca il tuo Concept 3D Personalizzato Gratuito Oggi",
      formMotivationText: "Inserisci i dettagli della tua fiera qui sotto. Il nostro team analizzerà le tue esigenze e ti fornirà una visualizzazione 3D su misura e un preventivo accurato, completamente gratuiti.",
      statsTitle: "128+",
      statsSub: "Progetti consegnati in 15 paesi europei",
      fName: "Nome Completo *", fEmail: "Indirizzo Email *", fPhone: "Numero di Telefono *",
      fShow: "Nome Fiera *", fCity: "Città / Paese *", fSize: "Dimensioni Stand (mq) *",
      fStartDate: "Data Inizio *", fEndDate: "Data Fine *", fMsg: "Dettagli aggiuntivi (opzionale)",
      captcha: "Non sono un robot", submitBtnNew: "OTTIENI IL MIO DESIGN GRATUITO",
      successMsg: "Richiesta ricevuta! Il nostro team preparerà il tuo concept 3D gratuito a breve.",
      fillAll: "Compila tutti i campi obbligatori.", invalidEmail: "Inserisci un'email valida.",
      invalidPhone: "Inserisci un numero di telefono valido.", dateError: "La data di fine deve essere successiva alla data di inizio.",
      captchaError: "Conferma di non essere un robot.", error: "Si è verificato un errore. Riprova.",
      completedStatus: "Completato", inProgressStatus: "In Corso",
      footerRights: `© ${new Date().getFullYear()} EXPO MATCH. Tutti i diritti riservati.`
    },
    DE: {
      dir: "ltr",
      nav: ["Dienstleistungen", "Über Uns", "Portfolio", "Prozess"],
      headerClaimBtn: "Kostenloses 3D-Design anfordern",
      heroTitle: "UNVERGESSLICHE MESSESTÄNDE IN GANZ EUROPA.",
      heroSub: "Italienische Handwerkskunst. Europaweite Reichweite.",
      heroCta: "Kostenloses 3D-Design & Angebot erhalten",
      heroMicrocopy: "Keine versteckten Gebühren. 100% unverbindlich.",
      trustText: "ITALIENISCHES DESIGN, EUROPÄISCHE AUSFÜHRUNG.",
      trustSub: "Präzision. Qualität. Pünktliche Lieferung.",
      trustStatsMain: "Ausgelieferte Projekte",
      trustStatsSub: "In 15 europäischen Ländern",
      aboutUs: "Über Uns",
      servicesTitle: "Unsere Dienstleistungen",
      portfolioTitle: "Portfolio-Highlights",
      viewAll: "Alle Projekte ansehen",
      projectDetails: "Projektdetails",
      year: "Ausführungsjahr",
      type: "Projekttyp",
      status: "Status",
      serviceDetails: "Service-Details",
      processTitle: "Unser Arbeitsablauf",
      processSteps: [
        { icon: <Lightbulb className="w-6 h-6" />, title: "Erkundung & kostenloses 3D-Konzept", desc: "Wir erhalten Ihr Briefing und liefern ein vorläufiges kostenloses 3D-Design zur Visualisierung Ihres Standes." },
        { icon: <FileEdit className="w-6 h-6" />, title: "Verfeinerung & Vereinbarung", desc: "Wir stimmen das finale Layout ab und unterzeichnen den Vertrag." },
        { icon: <Factory className="w-6 h-6" />, title: "Eigenfertigung", desc: "Unsere Fachkräfte bauen und montieren Ihren Stand in unserer eigenen Werkstatt und unserem Lager." },
        { icon: <Truck className="w-6 h-6" />, title: "Aufbau & Support vor Ort", desc: "Wir transportieren und installieren Ihren Stand schnell auf dem Messegelände und bieten umfassende Unterstützung vor Ort." }
      ],
      formTitleNew: "Erhalten Sie noch heute Ihr kostenloses individuelles 3D-Konzept",
      formMotivationText: "Geben Sie unten Ihre Messedaten ein. Unser Team analysiert Ihre Anforderungen und erstellt eine maßgeschneiderte 3D-Visualisierung sowie ein genaues Angebot – völlig kostenlos.",
      statsTitle: "128+",
      statsSub: "Ausgelieferte Projekte in 15 europäischen Ländern",
      fName: "Vollständiger Name *", fEmail: "E-Mail-Adresse *", fPhone: "Telefonnummer *",
      fShow: "Name der Messe *", fCity: "Stadt / Land *", fSize: "Standgröße (qm) *",
      fStartDate: "Startdatum *", fEndDate: "Enddatum *", fMsg: "Zusätzliche Details (optional)",
      captcha: "Ich bin kein Roboter", submitBtnNew: "KOSTENLOSES DESIGN ANFORDERN",
      successMsg: "Anfrage erhalten! Unser Team wird Ihr kostenloses 3D-Konzept in Kürze erstellen.",
      fillAll: "Bitte füllen Sie alle Pflichtfelder aus.", invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      invalidPhone: "Bitte geben Sie eine gültige Telefonnummer ein.", dateError: "Das Enddatum muss nach dem Startdatum liegen.",
      captchaError: "Bitte bestätigen Sie, dass Sie kein Roboter sind.", error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      completedStatus: "Abgeschlossen", inProgressStatus: "In Bearbeitung",
      footerRights: `© ${new Date().getFullYear()} EXPO MATCH. Alle Rechte vorbehalten.`
    },
    FR: {
      dir: "ltr",
      nav: ["Services", "À Propos", "Portfolio", "Processus"],
      headerClaimBtn: "Design 3D Gratuit",
      heroTitle: "DES STANDS D'EXPOSITION INOUBLIABLES À TRAVERS L'EUROPE.",
      heroSub: "Savoir-faire Italien. Portée Européenne.",
      heroCta: "Obtenez votre Design 3D et Devis GRATUITS",
      heroMicrocopy: "Sans frais cachés. 100% sans engagement.",
      trustText: "DESIGN ITALIEN, EXÉCUTION EUROPÉENNE.",
      trustSub: "Précision. Qualité. Livraison ponctuelle.",
      trustStatsMain: "Projets Livrés",
      trustStatsSub: "Dans 15 pays européens",
      aboutUs: "À Propos",
      servicesTitle: "Nos Services",
      portfolioTitle: "Points Forts du Portfolio",
      viewAll: "Voir Tous les Projets",
      projectDetails: "Détails du Projet",
      year: "Année d'exécution",
      type: "Type de Projet",
      status: "Statut",
      serviceDetails: "Détails du Service",
      processTitle: "Notre Processus",
      processSteps: [
        { icon: <Lightbulb className="w-6 h-6" />, title: "Découverte & Concept 3D Gratuit", desc: "Nous recevons votre brief et livrons un design 3D préliminaire gratuit pour visualiser votre stand." },
        { icon: <FileEdit className="w-6 h-6" />, title: "Perfectionnement & Accord", desc: "Nous peaufinons le design, convenons du layout final et signons le contrat." },
        { icon: <Factory className="w-6 h-6" />, title: "Fabrication Interne", desc: "Nos artisans construisent et assemblent votre stand dans notre propre atelier et entrepôt." },
        { icon: <Truck className="w-6 h-6" />, title: "Installation & Support sur Site", desc: "Nous transportons et installons rapidement votre stand sur le lieu du salon, avec un support complet sur place." }
      ],
      formTitleNew: "Débloquez votre Concept 3D Personnalisé Gratuit Aujourd'hui",
      formMotivationText: "Remplissez les détails de votre salon ci-dessous. Notre équipe analysera vos besoins et vous fournira une visualisation 3D sur mesure ainsi qu'un devis précis, entièrement gratuits.",
      statsTitle: "128+",
      statsSub: "Projets livrés dans 15 pays européens",
      fName: "Nom Complet *", fEmail: "Adresse E-mail *", fPhone: "Numéro de Téléphone *",
      fShow: "Nom du Salon *", fCity: "Ville / Pays *", fSize: "Taille du Stand (m²) *",
      fStartDate: "Date de début *", fEndDate: "Date de fin *", fMsg: "Détails supplémentaires (facultatif)",
      captcha: "Je ne suis pas un robot", submitBtnNew: "OBTENIR MON DESIGN GRATUIT",
      successMsg: "Demande reçue ! Notre équipe préparera votre concept 3D gratuit sous peu.",
      fillAll: "Veuillez remplir tous les champs obligatoires.", invalidEmail: "Veuillez entrer une adresse e-mail valide.",
      invalidPhone: "Veuillez entrer un numéro de téléphone valide.", dateError: "La date de fin doit être postérieure à la date de début.",
      captchaError: "Veuillez confirmer que vous n'êtes pas un robot.", error: "Une erreur est survenue. Veuillez réessayer.",
      completedStatus: "Terminé", inProgressStatus: "En cours",
      footerRights: `© ${new Date().getFullYear()} EXPO MATCH. Tous droits réservés.`
    },
    ES: {
      dir: "ltr",
      nav: ["Servicios", "Sobre Nosotros", "Portafolio", "Proceso"],
      headerClaimBtn: "Diseño 3D Gratis",
      heroTitle: "STANDS DE EXPOSICIÓN INOLVIDABLES EN TODA EUROPA.",
      heroSub: "Artesanía Italiana. Alcance Europeo.",
      heroCta: "Obtén tu Diseño 3D y Presupuesto GRATIS",
      heroMicrocopy: "Sin costes ocultos. 100% sin compromiso.",
      trustText: "DISEÑO ITALIANO, EJECUCIÓN EUROPEA.",
      trustSub: "Precisión. Calidad. Entrega a tiempo.",
      trustStatsMain: "Proyectos Entregados",
      trustStatsSub: "En 15 países europeos",
      aboutUs: "Sobre Nosotros",
      servicesTitle: "Nuestros Servicios",
      portfolioTitle: "Proyectos Destacados",
      viewAll: "Ver Todos los Proyectos",
      projectDetails: "Detalles del Proyecto",
      year: "Año de ejecución",
      type: "Tipo de Proyecto",
      status: "Estado",
      serviceDetails: "Detalles del Servicio",
      processTitle: "Nuestro Proceso",
      processSteps: [
        { icon: <Lightbulb className="w-6 h-6" />, title: "Descubrimiento y Concepto 3D Gratuito", desc: "Recibimos tu brief y entregamos un diseño 3D preliminar gratuito para visualizar tu stand." },
        { icon: <FileEdit className="w-6 h-6" />, title: "Refinamiento y Acuerdo", desc: "Perfeccionamos el diseño, acordamos el layout final y firmamos el contrato." },
        { icon: <Factory className="w-6 h-6" />, title: "Fabricación Propia", desc: "Nuestros artesanos construyen y ensamblan tu stand en nuestro propio taller y almacén." },
        { icon: <Truck className="w-6 h-6" />, title: "Montaje y Soporte en Sitio", desc: "Transportamos e instalamos tu stand rápidamente en el recinto ferial, ofreciendo soporte completo en el lugar." }
      ],
      formTitleNew: "Desbloquea tu Concepto 3D Personalizado Gratis Hoy",
      formMotivationText: "Rellena los detalles de tu exposición a continuación. Nuestro equipo analizará tus requisitos y te entregará una visualización 3D a medida y un presupuesto preciso, completamente gratis.",
      statsTitle: "128+",
      statsSub: "Proyectos entregados en 15 países europeos",
      fName: "Nombre Completo *", fEmail: "Correo Electrónico *", fPhone: "Número de Teléfono *",
      fShow: "Nombre del Evento *", fCity: "Ciudad / País *", fSize: "Tamaño del Stand (m²) *",
      fStartDate: "Fecha de inicio *", fEndDate: "Fecha de fin *", fMsg: "Detalles adicionales (opcional)",
      captcha: "No soy un robot", submitBtnNew: "OBTENER MI DISEÑO GRATIS",
      successMsg: "¡Solicitud recibida! Nuestro equipo preparará tu concepto 3D gratuito en breve.",
      fillAll: "Por favor, complete todos los campos obligatorios.", invalidEmail: "Por favor, introduzca un correo electrónico válido.",
      invalidPhone: "Por favor, introduzca un número de teléfono válido.", dateError: "La fecha de fin debe ser posterior a la fecha de inicio.",
      captchaError: "Por favor, confirme que no es un robot.", error: "Ocurrió un error. Inténtalo de nuevo.",
      completedStatus: "Completado", inProgressStatus: "En Progreso",
      footerRights: `© ${new Date().getFullYear()} EXPO MATCH. Todos los derechos reservados.`
    },
    PT: {
      dir: "ltr",
      nav: ["Serviços", "Sobre Nós", "Portfólio", "Processo"],
      headerClaimBtn: "Design 3D Grátis",
      heroTitle: "STANDS DE EXPOSIÇÃO INESQUECÍVEIS EM TODA A EUROPA.",
      heroSub: "Artesanato Italiano. Alcance Europeu.",
      heroCta: "Obtenha o seu Design 3D e Orçamento GRÁTIS",
      heroMicrocopy: "Sem custos ocultos. 100% sem compromisso.",
      trustText: "DESIGN ITALIANO, EXECUÇÃO EUROPEIA.",
      trustSub: "Precisão. Qualidade. Entrega pontual.",
      trustStatsMain: "Projetos Entregues",
      trustStatsSub: "Em 15 países europeus",
      aboutUs: "Sobre Nós",
      servicesTitle: "Nossos Serviços",
      portfolioTitle: "Destaques do Portfólio",
      viewAll: "Ver Todos os Projetos",
      projectDetails: "Detalhes do Projeto",
      year: "Ano de execução",
      type: "Tipo de Projeto",
      status: "Status",
      serviceDetails: "Detalhes do Serviço",
      processTitle: "O Nosso Processo",
      processSteps: [
        { icon: <Lightbulb className="w-6 h-6" />, title: "Descoberta e Conceito 3D Gratuito", desc: "Recebemos o seu briefing e fornecemos um design 3D preliminar gratuito para visualizar o seu stand." },
        { icon: <FileEdit className="w-6 h-6" />, title: "Aperfeiçoamento e Acordo", desc: "Ajustamos o design, acordamos o layout final e assinamos o contrato." },
        { icon: <Factory className="w-6 h-6" />, title: "Fabricação Interna", desc: "Os nossos artesãos constroem e montam o seu stand na nossa oficina e armazém." },
        { icon: <Truck className="w-6 h-6" />, title: "Montagem e Suporte no Local", desc: "Transportamos e instalamos o seu stand rapidamente no local da feira, com suporte completo no local." }
      ],
      formTitleNew: "Desbloqueie o seu Conceito 3D Personalizado Gratuito Hoje",
      formMotivationText: "Preencha os detalhes da sua exposição abaixo. Nossa equipe analisará seus requisitos e entregará uma visualização 3D sob medida e um orçamento preciso, totalmente grátis.",
      statsTitle: "128+",
      statsSub: "Projetos entregues em 15 países europeus",
      fName: "Nome Completo *", fEmail: "E-mail *", fPhone: "Telefone *",
      fShow: "Nome do Evento *", fCity: "Cidade / País *", fSize: "Tamanho do Stand (m²) *",
      fStartDate: "Data de início *", fEndDate: "Data de fim *", fMsg: "Detalhes adicionais (opcional)",
      captcha: "Não sou um robô", submitBtnNew: "OBTER MEU DESIGN GRÁTIS",
      successMsg: "Solicitação recebida! Nossa equipe preparará seu conceito 3D gratuito em breve.",
      fillAll: "Por favor, preencha todos os campos obrigatórios.", invalidEmail: "Por favor, insira um e-mail válido.",
      invalidPhone: "Por favor, insira um número de telefone válido.", dateError: "A data de fim deve ser posterior à data de início.",
      captchaError: "Por favor, confirme que não é um robô.", error: "Ocorreu um erro. Tente novamente.",
      completedStatus: "Concluído", inProgressStatus: "Em Andamento",
      footerRights: `© ${new Date().getFullYear()} EXPO MATCH. Todos os direitos reservados.`
    },
  };

  const curr = t[lang];
  const aboutText = getAboutText();

  return (
    <div className="bg-[#080c16] text-[#f8fafc] font-sans selection:bg-cyan-500/30" dir={curr.dir}>
      <style dangerouslySetInnerHTML={{__html: `
        .PhoneInput { display: flex; align-items: center; width: 100%; background: #0b1120; border: 1px solid #1e293b; border-radius: 0.75rem; padding: 0 1rem; transition: border-color 0.3s; }
        .PhoneInput:focus-within { border-color: #06b6d4; }
        .PhoneInputCountry { margin-right: 0.75rem; }
        .PhoneInputInput { flex: 1; background: transparent; border: none; color: white; padding: 0.875rem 0; outline: none; font-size: 0.875rem; }
        .PhoneInputCountrySelect { background: #0b1120; color: white; }
        .react-datepicker { background-color: #0b1120 !important; border: 1px solid #1e293b !important; border-radius: 0.75rem !important; font-family: inherit !important; }
        .react-datepicker__header { background-color: #080c16 !important; border-bottom: 1px solid #1e293b !important; }
        .react-datepicker__current-month, .react-datepicker__day-name { color: #f8fafc !important; }
        .react-datepicker__day { color: #cbd5e1 !important; border-radius: 0.5rem !important; }
        .react-datepicker__day:hover { background-color: #06b6d4 !important; color: #080c16 !important; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #06b6d4 !important; color: #080c16 !important; font-weight: bold !important; }
        .react-datepicker__day--disabled { color: #475569 !important; }
        .react-datepicker__navigation-icon::before { border-color: #cbd5e1 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}} />

      {/* زر الواتساب العائم */}
      {settings?.whatsapp_number && (
        <a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
           className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20b958] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-transform hover:scale-110 flex items-center justify-center">
          <WhatsAppIcon className="w-8 h-8" />
        </a>
      )}

      {/* ── 1. Header ── */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${isScrolled ? "bg-[#080c16]/90 backdrop-blur-xl border-slate-800 py-4 shadow-lg" : "bg-transparent border-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <CustomLogo companyName={settings?.company_name} />
          <nav className="hidden lg:flex gap-8 font-semibold text-sm">
            <a href="#services" className="text-slate-300 hover:text-cyan-400 transition-colors">{curr.nav[0]}</a>
            <a href="#about" className="text-slate-300 hover:text-cyan-400 transition-colors">{curr.nav[1]}</a>
            <a href="#portfolio" className="text-slate-300 hover:text-cyan-400 transition-colors">{curr.nav[2]}</a>
            <a href="#process" className="text-slate-300 hover:text-cyan-400 transition-colors">{curr.nav[3]}</a>
          </nav>
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold font-mono bg-slate-900/50 p-1 rounded-lg border border-slate-800">
              {["EN", "IT", "DE", "FR", "ES", "PT", "AR"].map((l) => (
                <button key={l} onClick={() => setLang(l as LangType)} className={`px-2 py-1 rounded-md transition-colors ${lang === l ? "bg-cyan-500 text-slate-900" : "text-slate-400 hover:text-white"}`}>{l}</button>
              ))}
            </div>
            <a href="#quote" className="hidden md:flex bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-900 px-6 py-2.5 rounded-full font-bold transition-all text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              {curr.headerClaimBtn}
            </a>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-slate-300">{isMobileMenuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#0b1120] border-b border-slate-800 shadow-xl lg:hidden p-4 flex flex-col gap-4">
            <a href="#services" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-medium">{curr.nav[0]}</a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-medium">{curr.nav[1]}</a>
            <a href="#portfolio" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-medium">{curr.nav[2]}</a>
            <a href="#process" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-medium">{curr.nav[3]}</a>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
              {["EN", "IT", "DE", "FR", "ES", "PT", "AR"].map((l) => (
                <button key={l} onClick={() => {setLang(l as LangType); setIsMobileMenuOpen(false);}} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-md border transition-all ${lang === l ? "bg-cyan-500 border-cyan-500 text-slate-900" : "border-slate-700 text-slate-400 hover:text-white"}`}>
                  {l}{lang === l && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── 2. Hero ── */}
      <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000" alt="Exhibition Hall" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080c16] via-[#080c16]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c16] via-transparent to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6">{curr.heroTitle}</h1>
            <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">{curr.heroSub}</p>
            <a href="#quote" className="inline-flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-10 py-5 rounded-full font-bold text-xl transition-all hover:scale-105 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
              {curr.heroCta}
            </a>
            <p className="text-slate-500 text-sm mt-4 max-w-xl">{curr.heroMicrocopy}</p>
          </div>
        </div>
      </section>

      {/* ── 3. Trust Bar ── */}
      <section className="bg-[#0b1120] border-y border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-12 text-center md:text-left">
          <div className="flex items-center gap-4">
            <MapPin className="text-cyan-500 w-10 h-10" />
            <div>
              <h4 className="text-white font-bold tracking-widest text-sm uppercase">{curr.trustText}</h4>
              <p className="text-slate-400 text-xs mt-1">{curr.trustSub}</p>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-slate-800"></div>
          <div>
            <h4 className="text-white font-extrabold text-2xl"><span className="text-cyan-500">{curr.statsTitle}</span> {curr.trustStatsMain}</h4>
            <p className="text-slate-400 text-xs mt-1">{curr.trustStatsSub}</p>
          </div>
        </div>
      </section>

      {/* ── 4. Services ── */}
      <section id="services" className="py-24 bg-[#080c16]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-16">{curr.servicesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicesList.map((srv) => (
              <div 
                key={srv.id} 
                onClick={() => { setSelectedService(srv); setCurrentServiceImageIndex(0); }}
                className="bg-[#0b1120] border border-slate-800 rounded-2xl p-10 hover:border-cyan-500/50 transition-all group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform overflow-hidden">
                  {renderServiceIcon(srv)}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{getTranslatedText(srv, "title")}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{getTranslatedText(srv, "description")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── مودال الخدمة ── */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedService(null)} />
          <div className="relative w-full max-w-4xl bg-[#0b1120] rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] lg:max-h-[85vh] animate-in fade-in zoom-in duration-300">
            <button 
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-red-500 p-2 rounded-full text-white transition-colors"
              onClick={() => setSelectedService(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full md:w-1/2 relative bg-black flex items-center justify-center p-8 min-h-[300px]">
              {serviceModalImages.length > 0 ? (
                <>
                  <img 
                    src={serviceModalImages[currentServiceImageIndex]} 
                    alt={getTranslatedText(selectedService, "title")} 
                    className="w-full h-full object-contain max-h-[60vh]"
                  />
                  {serviceModalImages.length > 1 && (
                    <>
                      <button onClick={prevServiceImage} className="absolute left-4 z-10 bg-black/50 hover:bg-cyan-500 p-2 rounded-full text-white transition-all">
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button onClick={nextServiceImage} className="absolute right-4 z-10 bg-black/50 hover:bg-cyan-500 p-2 rounded-full text-white transition-all">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                        {serviceModalImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentServiceImageIndex(idx); }}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentServiceImageIndex ? 'bg-cyan-400 scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-cyan-400 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    {renderServiceIcon(selectedService)}
                  </div>
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2 p-8 sm:p-10 overflow-y-auto bg-[#080c16] custom-scrollbar border-l border-slate-800/50">
              <div className="uppercase tracking-widest text-xs font-bold text-cyan-500 mb-3">{curr.serviceDetails}</div>
              <h2 className="text-3xl font-extrabold text-white mb-4">{getTranslatedText(selectedService, "title")}</h2>
              <p className="text-slate-400 leading-relaxed whitespace-pre-line">
                {getTranslatedText(selectedService, "description")}
              </p>
              <div className="mt-10">
                <button 
                  onClick={() => {
                    setSelectedService(null);
                    document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full bg-slate-800 hover:bg-cyan-500 text-white hover:text-slate-900 py-3 rounded-xl font-bold transition-all text-sm"
                >
                  {curr.headerClaimBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. About Us ── */}
      {aboutText && (
        <section id="about" className="py-24 bg-[#0b1120] border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="lg:w-1/2 w-full relative">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-700 shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=1200" alt="Exhibition Architecture" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#080c16]/80 to-transparent"></div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
              </div>
              <div className="lg:w-1/2 w-full">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">{curr.aboutUs}</h2>
                <div className="w-20 h-1.5 bg-cyan-500 mb-8 rounded-full"></div>
                <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-line">{aboutText}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Portfolio ── */}
      <section id="portfolio" className="py-24 bg-[#05080c] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">{curr.portfolioTitle}</h2>
            <a href="#portfolio" className="hidden md:flex text-cyan-500 hover:text-cyan-400 font-bold text-sm items-center gap-2">{curr.viewAll} <ArrowRight size={16} /></a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const allImages = getProjectImagesArray(proj);
              const currentIdx = cardImageIndices[proj.id] ?? 0;
              const hasMultiple = allImages.length > 1;
              const displayImage = allImages[currentIdx] || proj.cover_image;

              return (
                <div key={proj.id}
                  onClick={() => { setSelectedProject(proj); setCurrentImageIndex(0); }}
                  className="group relative h-[300px] rounded-2xl overflow-hidden border border-slate-800 cursor-pointer block"
                >
                  <img src={displayImage} alt={proj.client_name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c16] via-[#080c16]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {hasMultiple && (
                    <>
                      <button onClick={(e) => handleCardPrevImage(e, proj.id, allImages)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-cyan-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleCardNextImage(e, proj.id, allImages)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-cyan-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        {allImages.map((_, idx) => (
                          <button key={idx} onClick={(e) => { e.stopPropagation(); setCardImageIndices(prev => ({ ...prev, [proj.id]: idx })); }}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIdx ? 'bg-cyan-400 scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-0 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-xl font-bold text-white mb-1">{getTranslatedText(proj, "client_name")}</h3>
                    <p className="text-cyan-400 text-sm mb-1">{getTranslatedText(proj, "show_name")}</p>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      {proj.execution_year && <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-500/20">{proj.execution_year}</span>}
                      {proj.category && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">{proj.category}</span>}
                    </div>
                  </div>
                  <div className="absolute top-6 right-6 opacity-0 -translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-full backdrop-blur-md">
                      <ArrowRight className="w-5 h-5 -rotate-45" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── نافذة تفاصيل المشروع (Modal) ── */}
      {selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
          <div className="relative w-full max-w-6xl bg-[#0b1120] rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] lg:max-h-[85vh] animate-in fade-in zoom-in duration-300">
            <button className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-red-500 p-2 rounded-full text-white transition-colors" onClick={() => setSelectedProject(null)}>
              <X className="w-5 h-5" />
            </button>

            <div className="w-full md:w-2/3 relative bg-black flex flex-col">
              <div className="relative flex-1 flex items-center justify-center group/slider min-h-[300px]">
                {modalImages.length > 1 && (
                  <>
                    <button onClick={prevModalImage} className="absolute left-4 z-10 bg-black/50 hover:bg-cyan-500 p-2 rounded-full text-white opacity-0 group-hover/slider:opacity-100 transition-all">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={nextModalImage} className="absolute right-4 z-10 bg-black/50 hover:bg-cyan-500 p-2 rounded-full text-white opacity-0 group-hover/slider:opacity-100 transition-all">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                <img src={modalImages[currentImageIndex]} alt={selectedProject.client_name} className="w-full h-full object-contain max-h-[50vh] md:max-h-[70vh]" />
              </div>
              {modalImages.length > 1 && (
                <div className="flex items-center gap-3 p-4 bg-[#080c16] overflow-x-auto custom-scrollbar border-t border-slate-800">
                  {modalImages.map((img, idx) => (
                    <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-cyan-500 opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                      <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full md:w-1/3 p-8 sm:p-10 overflow-y-auto bg-[#080c16] custom-scrollbar border-l border-slate-800/50">
              <div className="uppercase tracking-widest text-xs font-bold text-cyan-500 mb-3">{curr.projectDetails}</div>
              <h2 className="text-3xl font-extrabold text-white mb-2">{getTranslatedText(selectedProject, "client_name")}</h2>
              <h3 className="text-lg text-slate-400 mb-8">{getTranslatedText(selectedProject, "show_name")}</h3>
              <div className="space-y-6">
                {selectedProject.execution_year && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400"><Calendar className="w-5 h-5" /></div>
                    <div><div className="text-sm font-semibold text-white">{curr.year}</div><div className="text-sm text-slate-400 mt-1">{selectedProject.execution_year}</div></div>
                  </div>
                )}
                {selectedProject.category && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400"><Tag className="w-5 h-5" /></div>
                    <div><div className="text-sm font-semibold text-white">{curr.type}</div><div className="text-sm text-slate-400 mt-1 capitalize">{selectedProject.category}</div></div>
                  </div>
                )}
                {selectedProject.booth_area && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400"><Ruler className="w-5 h-5" /></div>
                    <div><div className="text-sm font-semibold text-white">{curr.fSize.replace(' *', '')}</div><div className="text-sm text-slate-400 mt-1">{selectedProject.booth_area}</div></div>
                  </div>
                )}
                {selectedProject.status && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400"><Activity className="w-5 h-5" /></div>
                    <div><div className="text-sm font-semibold text-white">{curr.status}</div>
                      <div className="text-sm text-slate-400 mt-1 capitalize">
                        {selectedProject.status === "Completed" ? curr.completedStatus :
                         selectedProject.status === "In Progress" ? curr.inProgressStatus : selectedProject.status}
                      </div>
                    </div>
                  </div>
                )}
                {getTranslatedText(selectedProject, "description") && (
                  <div className="pt-6 mt-6 border-t border-slate-800">
                    <p className="text-sm leading-relaxed text-slate-400 whitespace-pre-line">{getTranslatedText(selectedProject, "description")}</p>
                  </div>
                )}
              </div>
              <div className="mt-10">
                <button onClick={() => { setSelectedProject(null); document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' }); }}
                   className="w-full bg-slate-800 hover:bg-cyan-500 text-white hover:text-slate-900 py-3 rounded-xl font-bold transition-all text-sm">
                  {curr.headerClaimBtn || curr.quote}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Process (آلية العمل) ── */}
      <section id="process" className="py-24 bg-[#080c16]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-16">{curr.processTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {curr.processSteps.map((step: any, idx: number) => (
              <div key={idx} className="relative flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all">
                  {step.icon}
                </div>
                <h4 className="text-white font-bold mb-2">{step.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                {idx < curr.processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Request a Quote ── */}
      <section id="quote" className="py-24 bg-[#080c16]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4">{curr.formTitleNew}</h2>
          <p className="text-cyan-400/80 text-sm md:text-base text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            {curr.formMotivationText}
          </p>
          {errorMessage && submitStatus === "error" && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">{errorMessage}</div>
          )}
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            {submitStatus === "success" && (
              <div className="absolute inset-0 bg-[#0b1120] rounded-3xl flex flex-col items-center justify-center p-8 text-center z-10 border border-cyan-500/30">
                <CheckCircle2 className="w-16 h-16 text-cyan-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">{curr.successMsg}</h3>
              </div>
            )}
            <form onSubmit={handleQuoteSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className="block text-slate-400 mb-1.5 text-sm font-medium">{curr.fName}</label><input type="text" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} className="w-full bg-[#080c16] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm" placeholder="Mario Rossi" /></div>
                <div><label className="block text-slate-400 mb-1.5 text-sm font-medium">{curr.fEmail}</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-[#080c16] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm" placeholder="mario@example.com" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className="block text-slate-400 mb-1.5 text-sm font-medium">{curr.fPhone}</label><PhoneInput international defaultCountry="IT" value={formData.phone} onChange={(val: string | undefined) => setFormData({...formData, phone: val || ""})} /></div>
                <div><label className="block text-slate-400 mb-1.5 text-sm font-medium">{curr.fShow}</label><input type="text" value={formData.show_name} onChange={(e) => setFormData({...formData, show_name: e.target.value})} className="w-full bg-[#080c16] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm" placeholder="Salone del Mobile" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className="block text-slate-400 mb-1.5 text-sm font-medium">{curr.fCity}</label><input type="text" value={formData.city_country} onChange={(e) => setFormData({...formData, city_country: e.target.value})} className="w-full bg-[#080c16] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm" placeholder="Milano, Italia" /></div>
                <div><label className="block text-slate-400 mb-1.5 text-sm font-medium">{curr.fSize}</label><div className="relative"><input type="number" min="1" step="1" value={formData.booth_area} onChange={(e) => setFormData({...formData, booth_area: e.target.value})} className="w-full bg-[#080c16] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm pr-12" placeholder="24" /><Ruler className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" /></div></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className="block text-slate-400 mb-1.5 text-sm font-medium">{curr.fStartDate}</label><div className="relative"><DatePicker selected={formData.start_date} onChange={(date: any) => setFormData({...formData, start_date: date})} dateFormat="dd/MM/yyyy" minDate={new Date()} placeholderText="DD/MM/YYYY" className="w-full bg-[#080c16] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm" /><Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" /></div></div>
                <div><label className="block text-slate-400 mb-1.5 text-sm font-medium">{curr.fEndDate}</label><div className="relative"><DatePicker selected={formData.end_date} onChange={(date: any) => setFormData({...formData, end_date: date})} dateFormat="dd/MM/yyyy" minDate={formData.start_date || new Date()} placeholderText="DD/MM/YYYY" className="w-full bg-[#080c16] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm" /><Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" /></div></div>
              </div>
              <div><label className="block text-slate-400 mb-1.5 text-sm font-medium">{curr.fMsg}</label><textarea rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full bg-[#080c16] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm resize-none" placeholder="Descrivi il tuo progetto..." /></div>
              <div className="flex items-center justify-between bg-[#080c16] border border-slate-700 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setCaptchaChecked(!captchaChecked)} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${captchaChecked ? "bg-cyan-500 border-cyan-500 text-slate-900" : "border-slate-500 text-transparent hover:border-cyan-400"}`}><CheckCircle2 className="w-4 h-4" /></button>
                  <span className="text-slate-300 text-sm select-none">{curr.captcha}</span>
                </div>
                <ShieldCheck className="text-cyan-500 w-8 h-8" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 text-base">
                {isSubmitting ? <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {isSubmitting ? "..." : curr.submitBtnNew}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#05080c] border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <CustomLogo companyName={settings?.company_name} />
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-slate-400">
            <span>{settings?.address || "Milano, Italy"}</span>
            <a href={`mailto:${settings?.email || "email@expomatch.org"}`} className="hover:text-cyan-400 transition-colors">{settings?.email || "email@expomatch.org"}</a>
            <div className="flex items-center gap-4 border-l border-slate-800 pl-0 md:pl-8">
              {settings?.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors"><Facebook className="w-5 h-5" /></a>}
              {settings?.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors"><Instagram className="w-5 h-5" /></a>}
            </div>
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-2 border border-slate-800 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" /> {curr.footerRights}
          </div>
        </div>
      </footer>
    </div>
  );
}
