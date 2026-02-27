'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, Plus, LogOut, Eye, EyeOff } from 'lucide-react';
import type { Blog } from '@/lib/types/blog';

export default function AdminDashboardPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    try {
      const res = await fetch('/api/blogs?all=true');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F6F5F3]">Blog Dashboard</h1>
            <p className="text-[#9AA0A6] text-sm mt-1">{blogs.length} blog{blogs.length !== 1 ? 's' : ''} total</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push('/admin/blogs/new')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#C79E3D] hover:bg-[#F59E0B] text-[#0B0F14] font-medium rounded-sm transition-colors text-sm flex-1 sm:flex-none justify-center"
            >
              <Plus size={18} />
              New Blog
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-transparent border border-[#F6F5F3]/20 text-[#F6F5F3] rounded-sm hover:bg-[#F6F5F3]/10 transition-colors text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Blog List */}
        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-[#2B2F33] rounded-lg border border-[#F6F5F3]/5">
            <p className="text-[#9AA0A6] mb-4">No blogs yet</p>
            <button
              onClick={() => router.push('/admin/blogs/new')}
              className="px-6 py-2.5 bg-[#C79E3D] hover:bg-[#F59E0B] text-[#0B0F14] font-medium rounded-sm transition-colors text-sm"
            >
              Create your first blog
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-[#2B2F33] rounded-lg border border-[#F6F5F3]/5 p-3 sm:p-4 hover:border-[#C79E3D]/30 transition-colors"
              >
                {/* Thumbnail + Info Row on mobile */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm overflow-hidden bg-[#2E2B23] flex-shrink-0">
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-medium text-[#F6F5F3] text-sm sm:text-base truncate">{blog.title_en}</h3>
                      {blog.is_published ? (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
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

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => router.push(`/admin/blogs/${blog.id}/edit`)}
                    className="p-2 text-[#9AA0A6] hover:text-[#C79E3D] transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    disabled={deleting === blog.id}
                    className="p-2 text-[#9AA0A6] hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
