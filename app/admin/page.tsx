"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FolderGit2, MessageSquareMore, Users, Layers, 
  Edit, Trash2, Eye, FileText 
} from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  
  // حالات الإحصائيات
  const [stats, setStats] = useState({
    totalProjects: 0,
    newEnquiries: 0,
    activeClients: 22, // رقم ثابت مؤقتاً زي التصميم
    totalServices: 0,
  });

  // حالات الجداول
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  
  // حالة الطلب المحدد (عشان نعرض تفاصيله تحت على اليمين)
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. جلب عدد المشاريع وأحدث 5 مشاريع
        const { data: projects, count: projectsCount } = await supabase
          .from("projects")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        // 2. جلب عدد الطلبات الجديدة وأحدث 3 طلبات
        const { data: leads, count: leadsCount } = await supabase
          .from("leads")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        // 3. جلب عدد الخدمات
        const { count: servicesCount } = await supabase
          .from("services")
          .select("*", { count: "exact" });

        // تحديث الإحصائيات
        setStats({
          totalProjects: projectsCount || 0,
          newEnquiries: leads?.filter(l => l.status === 'New').length || 0,
          activeClients: 22,
          totalServices: servicesCount || 0,
        });

        // تحديث الجداول
        if (projects) setRecentProjects(projects.slice(0, 5));
        if (leads) {
          setRecentLeads(leads.slice(0, 3));
          if (leads.length > 0) setSelectedLead(leads[0]); // اختيار أول طلب تلقائياً
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-200">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse font-medium">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir="ltr">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Expo Match - Admin Dashboard</h1>
      </div>

      {/* 1. Stats Cards (4 الكروت العلوية) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Total Projects</h3>
            <FolderGit2 className="text-cyan-500" size={24} />
          </div>
          <p className="text-4xl font-extrabold text-white relative z-10">{stats.totalProjects}<span className="text-cyan-500">+</span></p>
        </div>

        {/* New Enquiries */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">New Enquiries</h3>
            <MessageSquareMore className="text-cyan-500" size={24} />
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-4xl font-extrabold text-white">{stats.newEnquiries}</p>
            <span className="text-slate-400 text-sm">pending</span>
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Active Clients</h3>
            <Users className="text-cyan-500" size={24} />
          </div>
          <p className="text-4xl font-extrabold text-white">{stats.activeClients}</p>
        </div>

        {/* Services Managed */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Services Managed</h3>
            <Layers className="text-cyan-500" size={24} />
          </div>
          <p className="text-4xl font-extrabold text-white relative z-10">{stats.totalServices}</p>
        </div>
      </div>

      {/* 2. Main Grid (الجداول) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Portfolio Overview */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Portfolio Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-sm border-b border-slate-800">
                  <th className="pb-3 font-medium">Project Name</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentProjects.length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-slate-500">No projects found. Add some!</td></tr>
                ) : (
                  recentProjects.map((project) => (
                    <tr key={project.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 text-slate-200 font-medium pr-4">{project.title}</td>
                      <td className="py-4 text-slate-400">{project.location}</td>
                      <td className="py-4 text-slate-400">{project.delivery_date || 'N/A'}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3 text-slate-400">
                          <button className="hover:text-cyan-400 transition-colors"><Edit size={16} /></button>
                          <button className="hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Enquiries & Details */}
        <div className="space-y-6">
          
          {/* Recent Enquiries Table */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Recent Enquiries</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-sm border-b border-slate-800">
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Event</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentLeads.length === 0 ? (
                    <tr><td colSpan={4} className="py-4 text-center text-slate-500">No new enquiries.</td></tr>
                  ) : (
                    recentLeads.map((lead) => (
                      <tr 
                        key={lead.id} 
                        onClick={() => setSelectedLead(lead)}
                        className={`border-b border-slate-800/50 cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'bg-slate-800/50' : 'hover:bg-slate-800/20'}`}
                      >
                        <td className="py-4 text-slate-200">{lead.client_name || 'Unknown'}</td>
                        <td className="py-4 text-slate-400">{lead.show_name}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            lead.status === 'New' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                            'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3 text-slate-400">
                            <button className="hover:text-cyan-400 transition-colors"><Eye size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enquiry Details / Reply Box */}
          <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-r from-cyan-600 to-cyan-400" />
            
            {selectedLead ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{selectedLead.show_name}</h3>
                  <p className="text-slate-400 text-xs mt-1">Dates: {selectedLead.event_dates || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-slate-300 text-sm leading-relaxed bg-[#0f172a] p-4 rounded-xl border border-slate-800/50">
                    {selectedLead.message || 'No details provided by the client.'}
                  </p>
                </div>

                <div className="pt-2">
                  <label className="block text-slate-400 mb-2 text-xs font-medium uppercase tracking-wider">Response</label>
                  <textarea 
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                    rows={3}
                    placeholder="Draft your reply here..."
                  />
                  <button className="w-full mt-3 bg-linear-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-900 py-3 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all">
                    REPLY TO BRIEF
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Select an enquiry to view details</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}