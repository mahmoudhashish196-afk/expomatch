import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { supabase } from "@/lib/supabase";

// الخطوط الإنجليزية الحديثة (مناسبة جداً للتصميمات التقنية والفخمة)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🌟 تحويل الـ SEO ليكون ديناميكي (Server-Side)
export async function generateMetadata(): Promise<Metadata> {
  // سحب الإعدادات من قاعدة البيانات قبل رندر الصفحة
  const { data: settings } = await supabase
    .from("site_settings")
    .select("site_title, meta_description")
    .single();

  // استخدام البيانات من الداتا بيز، ولو مفيش نستخدم كلام افتراضي (Fallback)
  const dynamicTitle = settings?.site_title || "EXPO MATCH | Unforgettable Exhibition Stands Across Europe";
  const dynamicDescription = settings?.meta_description || "Italian Craftsmanship. Pan-European Reach. We offer custom 3D stand design, turnkey fabrication, and logistics. We Match Your Vision to a Perfect Showcase.";

  return {
    title: dynamicTitle,
    description: dynamicDescription,
    keywords: "exhibition stands europe, custom 3d stand design, turnkey booth fabrication, milano exhibition, messe frankfurt, expo match, exhibition contractor, stand builders italy, bespoke exhibition booths",
    authors: [{ name: "Expo Match" }],
    icons: {
      icon: "/favicon.ico",
    },
    alternates: {
      canonical: "https://expomatch.com",
    },
    openGraph: {
      title: dynamicTitle,
      description: dynamicDescription,
      url: "https://expomatch.com",
      siteName: "EXPO MATCH",
      images: [
        {
          url: "/og-image.jpg", 
          width: 1200,
          height: 630,
          alt: "Expo Match Exhibition Stands",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dynamicTitle,
      description: dynamicDescription,
      images: ["/og-image.jpg"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* تمت إضافة ألوان الهوية البصرية (الكحلي الغامق والنص الفاتح) 
        كأساس للـ body لضمان عدم حدوث وميض أبيض عند التحميل 
      */}
      <body className="min-h-full flex flex-col font-sans bg-[#080c16] text-[#f8fafc]">
        {children}
      </body>
    </html>
  );
}