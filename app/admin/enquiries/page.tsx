"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, Trash2, Mail, MessageCircle, Calendar, Map, Activity } from "lucide-react";

// واجهة البيانات (Interface) تشمل جميع الحقول المرسلة من النموذج
interface Lead {
  id: string;
  client_name: string;
  email: string;
  phone: string;
  show_name: string;
  city_country?: string;     // أضفنا
  booth_area: string;
  start_date?: string;       // أضفنا (تاريخ البداية)
  end_date?: string;         // أضفنا (تاريخ النهاية)
  event_dates?: string;      // للإبقاء على التوافق مع البيانات القديمة
  message: string;
  status: 'New' | 'Contacted' | 'Quoted' | 'Won' | 'Lost';
  created_at: string;
}

export default function EnquiriesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالة النافذة المنبثقة
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // جلب البيانات
  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setLeads(data);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  // دالة تغيير حالة الطلب (Status)
  const handleStatusChange = async (id: string, newStatus: Lead['status']) => {
    setIsUpdatingStatus(true);
    // تحديث الواجهة فوراً (Optimistic UI)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    if (activeLead && activeLead.id === id) {
      setActiveLead({ ...activeLead, status: newStatus });
    }

    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.error("Error updating status:", err);
      fetchLeads();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // دالة الحذف
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this enquiry? This cannot be undone.")) return;
    
    const previousLeads = [...leads];
    setLeads(prev => prev.filter(l => l.id !== id));
    
    try {
      await supabase.from("leads").delete().eq("id", id);
      if (activeLead?.id === id) closeModal();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete the enquiry.");
      setLeads(previousLeads); 
    }
  };

  // النافذة المنبثقة
  const openModal = (lead: Lead) => {
    setActiveLead(lead);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setActiveLead(null);
    document.body.style.overflow = "auto";
  };

  // دالة مساعدة لتحديد لون الحالة (Badge Color)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'; // 🔴
      case 'Contacted': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'; // 🟠
      case 'Quoted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'; // 🔵
      case 'Won': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; // 🟢
      case 'Lost': return 'bg-slate-700/50 text-slate-400 border-slate-600'; // ⚫
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // دالة مساعدة لعرض التاريخ (إذا كانت البيانات الجديدة موجودة نستخدمها، وإلا نرجع للحدث الموحد)
  const getEventDatesDisplay = (lead: Lead) => {
    if (lead.start_date && lead.end_date) {
      return `${lead.start_date} → ${lead.end_date}`;
    }
    return lead.event_dates || "—";
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-200">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse font-medium">Loading Enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto" dir="ltr">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Enquiries & Leads</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Manage client requests, track sales pipeline, and respond to exhibition briefs.
          </p>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-sm font-bold text-white">{leads.filter(l => l.status === 'New').length} New Leads</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#0b1120] text-slate-400 text-sm border-b border-slate-800">
                <th className="py-4 px-6 font-medium">Client Name</th>
                <th className="py-4 px-6 font-medium">Exhibition / Show</th>
                <th className="py-4 px-6 font-medium">City</th>
                <th className="py-4 px-6 font-medium">Req. Area</th>
                <th className="py-4 px-6 font-medium">Event Dates</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/50">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No enquiries found yet. The pipeline is waiting!
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="py-4 px-6 text-white font-medium">
                      {lead.client_name}
                      <span className="block text-xs text-slate-500 font-mono mt-1">{new Date(lead.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{lead.show_name}</td>
                    <td className="py-4 px-6 text-slate-400">{lead.city_country || "—"}</td>
                    <td className="py-4 px-6 text-slate-300">{lead.booth_area} m²</td>
                    <td className="py-4 px-6 text-slate-400">{getEventDatesDisplay(lead)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button 
                          onClick={() => openModal(lead)}
                          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Delete Lead"
                        >
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
      </div>

      {/* 🌟 Modal (النافذة المنبثقة للتفاصيل) */}
      {activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1120]/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-[#0f172a] relative z-10">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Lead Details
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Submitted: {new Date(activeLead.created_at).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={closeModal} 
                className="text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Sales Status Controller */}
              <div className="bg-[#0b1120] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Activity size={18} className="text-cyan-500"/>
                  <span className="font-semibold text-sm">Pipeline Status:</span>
                </div>
                <select
                  value={activeLead.status}
                  onChange={(e) => handleStatusChange(activeLead.id, e.target.value as Lead['status'])}
                  disabled={isUpdatingStatus}
                  className={`bg-slate-900 border px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider outline-none transition-colors cursor-pointer ${getStatusBadge(activeLead.status)}`}
                >
                  <option value="New">🔴 New</option>
                  <option value="Contacted">🟠 Contacted</option>
                  <option value="Quoted">🔵 Quoted</option>
                  <option value="Won">🟢 Won (Closed)</option>
                  <option value="Lost">⚫ Lost</option>
                </select>
              </div>

              {/* Client Info Grid – الآن يشمل كل البيانات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">Client Name</span>
                  <span className="text-lg font-bold text-white">{activeLead.client_name}</span>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">Exhibition Name</span>
                  <span className="text-lg font-bold text-cyan-400">{activeLead.show_name}</span>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">City / Country</span>
                  <span className="text-lg font-bold text-white">{activeLead.city_country || "—"}</span>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">Required Area</span>
                  <span className="text-lg font-bold text-white">{activeLead.booth_area} m²</span>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">Email Address</span>
                  <span className="text-lg font-bold text-white">{activeLead.email}</span>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">Phone Number</span>
                  <span className="text-lg font-bold text-white">{activeLead.phone}</span>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">Start Date</span>
                  <span className="text-lg font-bold text-white">{activeLead.start_date || "—"}</span>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">End Date</span>
                  <span className="text-lg font-bold text-white">{activeLead.end_date || "—"}</span>
                </div>
              </div>

              {/* Full Message */}
              <div>
                <span className="text-slate-400 text-sm font-semibold mb-2 block">Client Brief / Message:</span>
                <div className="bg-[#0b1120] p-5 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {activeLead.message || "No additional brief provided."}
                </div>
              </div>

            </div>

            {/* Modal Footer (Actions) */}
            <div className="p-6 border-t border-slate-800 bg-[#0f172a] flex flex-wrap justify-end gap-3 relative z-10">
              <a 
                href={`mailto:${activeLead.email}`}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 border border-slate-600"
              >
                <Mail size={16} /> Email Client
              </a>
              <a 
                href={`https://wa.me/${activeLead.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}