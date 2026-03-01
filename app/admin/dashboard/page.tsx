'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trash2, Edit, Plus, LogOut, Eye, EyeOff, Download, Users, FileText } from 'lucide-react';
import type { Blog } from '@/lib/types/blog';
import type { Lead } from '@/lib/types/lead';

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[#9AA0A6]">Loading...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'blogs';

  useEffect(() => {
    if (activeTab === 'blogs') {
      fetchBlogs();
    } else {
      fetchLeads();
    }
  }, [activeTab]);

  async function fetchBlogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/blogs?all=true');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
      if (!Array.isArray(data) && data?.error) {
        console.error('API error:', data.error);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch('/api/leads');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this blog? This will also delete all images and video.')) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert('Failed to delete blog');
      }
    } catch {
      alert('Failed to delete blog');
    } finally {
      setDeleting(null);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  function exportLeadsCSV() {
    if (leads.length === 0) return;
    const headers = ['Full Name', 'Company', 'Phone', 'Email', 'Project Type', 'Message', 'Date'];
    const rows = leads.map((l) => [
      l.full_name,
      l.company_name || '',
      l.phone,
      l.email,
      l.project_type || '',
      (l.message || '').replace(/"/g, '""'),
      new Date(l.created_at).toLocaleDateString('en-US'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axis-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#9AA0A6]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F4F2]">
              {activeTab === 'blogs' ? 'Blog Dashboard' : 'Leads Dashboard'}
            </h1>
            <p className="text-[#9AA0A6] text-sm mt-1">
              {activeTab === 'blogs'
                ? `${blogs.length} blog${blogs.length !== 1 ? 's' : ''} total`
                : `${leads.length} lead${leads.length !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Tabs */}
            <div className="flex items-center bg-[#1A1D21] rounded-sm">
              <button
                onClick={() => router.push('/admin/dashboard?tab=blogs')}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'blogs' ? 'text-[#C79E3D] bg-[#C79E3D]/10' : 'text-[#9AA0A6] hover:text-[#F5F4F2]'
                }`}
              >
                <FileText size={14} /> Blogs
              </button>
              <button
                onClick={() => router.push('/admin/dashboard?tab=leads')}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'leads' ? 'text-[#C79E3D] bg-[#C79E3D]/10' : 'text-[#9AA0A6] hover:text-[#F5F4F2]'
                }`}
              >
                <Users size={14} /> Leads
              </button>
            </div>

            {activeTab === 'blogs' && (
              <button
                onClick={() => router.push('/admin/blogs/new')}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#C79E3D] text-[#0B0F14] font-medium rounded-sm transition-colors text-sm hover:bg-[#C79E3D]/90"
              >
                <Plus size={18} />
                New Blog
              </button>
            )}
            {activeTab === 'leads' && leads.length > 0 && (
              <button
                onClick={exportLeadsCSV}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#C79E3D] text-[#0B0F14] font-medium rounded-sm transition-colors text-sm hover:bg-[#C79E3D]/90"
              >
                <Download size={18} />
                Export CSV
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-transparent border border-[#F5F4F2]/20 text-[#F5F4F2] rounded-sm hover:bg-[#F5F4F2]/10 transition-colors text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Blog Tab */}
        {activeTab === 'blogs' && (
          <>
            {blogs.length === 0 ? (
              <div className="text-center py-20 bg-[#1A1D21] rounded-lg border border-[#F5F4F2]/5">
                <p className="text-[#9AA0A6] mb-4">No blogs yet</p>
                <button
                  onClick={() => router.push('/admin/blogs/new')}
                  className="px-6 py-2.5 bg-[#C79E3D] text-[#0B0F14] font-medium rounded-sm transition-colors text-sm hover:bg-[#C79E3D]/90"
                >
                  Create your first blog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-[#1A1D21] rounded-lg border border-[#F5F4F2]/5 p-3 sm:p-4 hover:border-[#C79E3D]/30 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm overflow-hidden bg-[var(--brand-olive)] flex-shrink-0">
                        {blog.blog_images && blog.blog_images.length > 0 ? (
                          <img
                            src={blog.blog_images[0].thumbnail_url || blog.blog_images[0].url}
                            alt={blog.title_en}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#9AA0A6] text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-medium text-[#F5F4F2] text-sm sm:text-base truncate">{blog.title_en}</h3>
                          {blog.is_published ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                              <Eye size={12} /> Published
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                              <EyeOff size={12} /> Draft
                            </span>
                          )}
                        </div>
                        <p className="text-[#9AA0A6] text-xs sm:text-sm truncate">{blog.title_ar}</p>
                        <p className="text-[#9AA0A6] text-xs mt-1 hidden sm:block">
                          {blog.blog_images?.length || 0} image{(blog.blog_images?.length || 0) !== 1 ? 's' : ''}
                          {blog.video_url ? ' · 1 video' : ''}
                          {' · '}slug: /{blog.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => router.push(`/admin/blogs/${blog.id}/edit`)}
                        className="p-2.5 text-[#9AA0A6] hover:text-[#C79E3D] transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={deleting === blog.id}
                        className="p-2.5 text-[#9AA0A6] hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <>
            {leads.length === 0 ? (
              <div className="text-center py-20 bg-[#1A1D21] rounded-lg border border-[#F5F4F2]/5">
                <Users size={40} className="mx-auto text-[#9AA0A6] mb-4" />
                <p className="text-[#9AA0A6]">No leads yet</p>
                <p className="text-[#9AA0A6]/60 text-sm mt-1">Leads from the contact form will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F5F4F2]/10">
                      <th className="text-start text-[#9AA0A6] text-xs uppercase tracking-wider font-medium py-3 px-4">Name</th>
                      <th className="text-start text-[#9AA0A6] text-xs uppercase tracking-wider font-medium py-3 px-4 hidden md:table-cell">Company</th>
                      <th className="text-start text-[#9AA0A6] text-xs uppercase tracking-wider font-medium py-3 px-4">Phone</th>
                      <th className="text-start text-[#9AA0A6] text-xs uppercase tracking-wider font-medium py-3 px-4 hidden sm:table-cell">Email</th>
                      <th className="text-start text-[#9AA0A6] text-xs uppercase tracking-wider font-medium py-3 px-4 hidden lg:table-cell">Project Type</th>
                      <th className="text-start text-[#9AA0A6] text-xs uppercase tracking-wider font-medium py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-[#F5F4F2]/5 hover:bg-[#1A1D21] transition-colors">
                        <td className="py-3 px-4 text-[#F5F4F2]">{lead.full_name}</td>
                        <td className="py-3 px-4 text-[#9AA0A6] hidden md:table-cell">{lead.company_name || '—'}</td>
                        <td className="py-3 px-4">
                          <a href={`tel:${lead.phone}`} className="text-[#C79E3D] hover:underline">
                            {lead.phone}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-[#9AA0A6] hidden sm:table-cell">{lead.email}</td>
                        <td className="py-3 px-4 text-[#9AA0A6] hidden lg:table-cell capitalize">{lead.project_type || '—'}</td>
                        <td className="py-3 px-4 text-[#9AA0A6] text-xs">{new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
