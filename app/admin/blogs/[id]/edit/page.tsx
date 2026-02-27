'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BlogForm from '@/components/admin/BlogForm';
import type { Blog } from '@/lib/types/blog';

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blogs/${id}`);
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        if (!res.ok) {
          router.push('/admin/dashboard');
          return;
        }
        const data = await res.json();
        setBlog(data);
      } catch {
        router.push('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#9AA0A6]">Loading...</p>
      </div>
    );
  }

  if (!blog) return null;

  return <BlogForm blog={blog} />;
}
