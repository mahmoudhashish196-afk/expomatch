"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import { Edit, Trash2, EyeOff, Eye, GripVertical, Image as ImageIcon, Plus } from "lucide-react";

// واجهة المشروع بناءً على التحديثات الجديدة
interface Project {
  id: string;
  client_name: string;
  show_name: string;
  execution_year: string;
  status: string;
  category: string;
  description: string;
  cover_image: string;
  gallery_images: string[];
  is_hidden: boolean;
  display_order: number;
  translations: any; 
  created_at: string;
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالات الـ Modal والرفع
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // حالات الصور
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // بيانات الفورم (العربي)
  const [formData, setFormData] = useState({
    client_name: "",
    show_name: "",
    execution_year: new Date().getFullYear().toString(),
    status: "Completed",
    category: "Standard",
    custom_category: "",
    description: "",
    cover_image: "",
    gallery_images: [] as string[],
  });

  // جلب المشاريع مترتبة بـ display_order
  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  // 💡 المترجم الآلي (يستقبل نص عربي ويرجع JSON بـ 6 لغات أوروبية)
  const translateToMultiple = async (textAr: string) => {
    if (!textAr) return {};
    const targetLangs = ['en', 'it', 'de', 'fr', 'es', 'pt']; // أضفنا pt
    let results: any = {};
    
    for (const lang of targetLangs) {
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${lang}&dt=t&q=${encodeURIComponent(textAr)}`);
        const data = await res.json();
        results[lang] = data[0].map((item: any) => item[0]).join('');
      } catch (err) {
        console.error(`Translation error for ${lang}:`, err);
        results[lang] = textAr; 
      }
    }
    return results;
  };

  // دالة الرفع والضغط
  const uploadImage = async (file: File) => {
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true };
    const compressedFile = await imageCompression(file, options);
    const fileExt = file.name.split('.').pop();
    const fileName = `expo-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error } = await supabase.storage.from('project-media').upload(fileName, compressedFile);
    if (error) throw error;
    
    const { data } = supabase.storage.from('project-media').getPublicUrl(fileName);
    return data.publicUrl;
  };

  // حفظ المشروع
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalCover = formData.cover_image;
      let finalGallery = [...formData.gallery_images];

      // 1. رفع صورة الغلاف
      if (coverFile) {
        finalCover = await uploadImage(coverFile);
      }

      // 2. رفع صور المعرض
      if (galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          const url = await uploadImage(file);
          finalGallery.push(url);
        }
      }

      // 3. تحديد النوع النهائي
      const finalCategory = formData.category === "Other" ? formData.custom_category : formData.category;

      // 4. الترجمة الآلية
      const clientNameTranslations = await translateToMultiple(formData.client_name);
      const showNameTranslations = await translateToMultiple(formData.show_name);
      const descriptionTranslations = await translateToMultiple(formData.description);
      const categoryTranslations = await translateToMultiple(finalCategory);

      const projectData = {
        client_name: formData.client_name,
        show_name: formData.show_name,
        execution_year: formData.execution_year,
        status: formData.status,
        category: finalCategory,
        description: formData.description,
        cover_image: finalCover,
        gallery_images: finalGallery,
        translations: {
          client_name: clientNameTranslations,
          show_name: showNameTranslations,
          description: descriptionTranslations,
          category: categoryTranslations
        }
      };

      if (editingId) {
        const { error } = await supabase.from("projects").update(projectData).eq("id", editingId);
        if (error) throw error;
      } else {
        const nextOrder = projects.length > 0 ? Math.max(...projects.map(p => p.display_order || 0)) + 1 : 0;
        const { error } = await supabase.from("projects").insert([{ ...projectData, display_order: nextOrder, is_hidden: false }]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      console.error(err);
      alert("خطأ أثناء الحفظ: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // دوال التحكم السريعة (حذف، إخفاء)
  const toggleVisibility = async (id: string, currentHidden: boolean) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, is_hidden: !currentHidden } : p));
    await supabase.from("projects").update({ is_hidden: !currentHidden }).eq("id", id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    await supabase.from("projects").delete().eq("id", id);
  };

  // 🚀 ميزة السحب والإفلات (Drag & Drop)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("dragIndex", index.toString());
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = Number(e.dataTransfer.getData("dragIndex"));
    if (dragIndex === dropIndex) return;

    const newProjects = [...projects];
    const [draggedItem] = newProjects.splice(dragIndex, 1);
    newProjects.splice(dropIndex, 0, draggedItem);

    // تحديث الواجهة فوراً
    const updatedProjects = newProjects.map((p, idx) => ({ ...p, display_order: idx }));
    setProjects(updatedProjects);

    // تحديث الداتا بيز في الخلفية
    for (let i = 0; i < updatedProjects.length; i++) {
      await supabase.from("projects").update({ display_order: i }).eq("id", updatedProjects[i].id);
    }
  };

  // فتح النوافذ
  const openNewModal = () => {
    setEditingId(null);
    setFormData({ 
      client_name: "", show_name: "", execution_year: new Date().getFullYear().toString(), 
      status: "Completed", category: "Standard", custom_category: "", description: "", 
      cover_image: "", gallery_images: [] 
    });
    setCoverFile(null);
    setGalleryFiles([]);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingId(project.id);
    const isCustomCat = !["Standard", "Party", "Event"].includes(project.category);
    setFormData({
      client_name: project.client_name,
      show_name: project.show_name,
      execution_year: project.execution_year,
      status: project.status,
      category: isCustomCat ? "Other" : project.category,
      custom_category: isCustomCat ? project.category : "",
      description: project.description || "",
      cover_image: project.cover_image || "",
      gallery_images: project.gallery_images || [],
    });
    setCoverFile(null);
    setGalleryFiles([]);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-200">
        <span className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mr-3" />
        Loading Portfolio...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto" dir="ltr">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Portfolio Management</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Drag and drop to reorder. Automated translation to 6 languages is active 🤖.
          </p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-linear-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-900 px-6 py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add New Project
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#0b1120] text-slate-400 text-sm border-b border-slate-800">
              <th className="py-4 px-4 w-10"></th>
              <th className="py-4 px-4 font-medium">Project / Client</th>
              <th className="py-4 px-4 font-medium">Exhibition (Show)</th>
              <th className="py-4 px-4 font-medium">Year</th>
              <th className="py-4 px-4 font-medium">Visibility</th>
              <th className="py-4 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-800/50">
            {projects.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-slate-500">No projects added yet.</td></tr>
            ) : (
              projects.map((project, index) => (
                <tr 
                  key={project.id} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`hover:bg-slate-800/20 transition-colors ${project.is_hidden ? 'opacity-50 grayscale' : ''}`}
                >
                  <td className="py-4 px-4 cursor-grab active:cursor-grabbing text-slate-500 hover:text-cyan-400">
                    <GripVertical size={20} />
                  </td>
                  <td className="py-4 px-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                      {project.cover_image ? (
                        <img src={project.cover_image} className="w-full h-full object-cover" alt="cover" />
                      ) : (
                        <ImageIcon className="w-full h-full p-3 text-slate-500" />
                      )}
                    </div>
                    <div>
                        <span className="text-white font-bold block">{project.client_name}</span>
                        <span className="text-xs text-cyan-500 mt-0.5 block">{project.category}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-300">{project.show_name}</td>
                  <td className="py-4 px-4 text-slate-400">{project.execution_year}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${project.is_hidden ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {project.is_hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => toggleVisibility(project.id, project.is_hidden)} className="p-2 text-slate-400 hover:text-amber-400 transition-all" title="Toggle Visibility">
                        {project.is_hidden ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button onClick={() => openEditModal(project)} className="p-2 text-slate-400 hover:text-cyan-400 transition-all" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-all" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🌟 Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0b1120]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-2">
              {editingId ? "Edit Project" : "Add New Project"}
            </h2>
            <p className="text-sm text-cyan-400 mb-6">💡 يرجى إدخال البيانات باللغة العربية، سيتم ترجمتها لـ 6 لغات أوروبية تلقائياً.</p>
            
            <form onSubmit={handleSaveProject} className="space-y-5" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-400 mb-1 text-sm">اسم المشروع / العميل</label>
                  <input required type="text" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" placeholder="مثال: إيروليز" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-sm">المعرض والمدينة</label>
                  <input required type="text" value={formData.show_name} onChange={(e) => setFormData({...formData, show_name: e.target.value})} className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" placeholder="مثال: معرض ميسي فرانكفورت - ألمانيا" />
                </div>
              </div>

              {/* النوع */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-400 mb-1 text-sm">نوع المشروع</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500">
                    <option value="Standard">Standard</option>
                    <option value="Party">Party</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other (أخرى)</option>
                  </select>
                </div>
                {formData.category === "Other" && (
                  <div>
                    <label className="block text-slate-400 mb-1 text-sm">حدد نوع آخر</label>
                    <input type="text" value={formData.custom_category} onChange={(e) => setFormData({...formData, custom_category: e.target.value})} className="w-full bg-[#0b1120] border border-cyan-500 rounded-xl px-4 py-3 text-white focus:outline-none" placeholder="اكتب النوع..." required={formData.category === "Other"} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-400 mb-1 text-sm">سنة التنفيذ</label>
                  <input required type="text" dir="ltr" value={formData.execution_year} onChange={(e) => setFormData({...formData, execution_year: e.target.value})} className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 text-left" placeholder="2024" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 text-sm">الحالة</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" dir="ltr">
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>

              {/* الوصف (اختياري) */}
              <div>
                <label className="block text-slate-400 mb-1 text-sm">الوصف (اختياري)</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" rows={3} placeholder="اكتب وصف قصير عن المشروع..." />
              </div>

              {/* Cover Image Upload */}
              <div className="border border-slate-700 p-4 rounded-xl bg-slate-800/30">
                <label className="block text-cyan-400 mb-2 text-sm font-bold">صورة الغلاف (Cover Image) - مطلوبة</label>
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)} className="w-full text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer" />
                {formData.cover_image && !coverFile && (
                  <img src={formData.cover_image} alt="cover" className="mt-3 h-20 rounded-lg border border-slate-600" />
                )}
              </div>

              {/* Gallery Images Upload */}
              <div className="border border-slate-700 p-4 rounded-xl bg-slate-800/30">
                <label className="block text-slate-300 mb-2 text-sm font-bold">صور إضافية للمشروع (Gallery) - اختياري</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setGalleryFiles(e.target.files ? Array.from(e.target.files) : [])} className="w-full text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-300 hover:file:bg-slate-600 cursor-pointer" />
                
                {formData.gallery_images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.gallery_images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="gallery" className="h-16 w-16 object-cover rounded-lg border border-slate-600" />
                        <button type="button" onClick={() => setFormData(prev => ({...prev, gallery_images: prev.gallery_images.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition-opacity text-xs font-bold">حذف</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-800" dir="ltr">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-linear-to-r from-cyan-500 to-cyan-400 text-slate-900 py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                  {isSubmitting ? <><span className="animate-spin w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full" /> Translating & Saving...</> : "Save Project"}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-6 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}