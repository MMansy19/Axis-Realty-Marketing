import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

// GET /api/blogs — public list of published blogs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all'); // admin wants all including drafts

  let query;

  if (all === 'true') {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    query = supabaseAdmin
      .from('blogs')
      .select('*, blog_images(*)')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
  } else {
    query = supabase
      .from('blogs')
      .select('*, blog_images(*)')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Sort images by display_order within each blog
  const blogs = (data || []).map((blog: Record<string, unknown>) => ({
    ...blog,
    blog_images: ((blog.blog_images as { display_order: number }[] | undefined) || []).sort(
      (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
    ),
  }));

  return NextResponse.json(blogs);
}

// POST /api/blogs — create a blog (admin only)
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title_en, title_ar, slug, video_url, video_public_id, is_published, display_order, images } = body;

    if (!title_en || !title_ar || !slug) {
      return NextResponse.json({ error: 'title_en, title_ar, and slug are required' }, { status: 400 });
    }

    // Insert blog
    const { data: blog, error: blogError } = await supabaseAdmin
      .from('blogs')
      .insert({
        title_en,
        title_ar,
        slug,
        video_url: video_url || null,
        video_public_id: video_public_id || null,
        is_published: is_published ?? true,
        display_order: display_order ?? 0,
      })
      .select()
      .single();

    if (blogError) {
      return NextResponse.json({ error: blogError.message }, { status: 500 });
    }

    // Insert images if any
    if (images && images.length > 0) {
      const imageRows = images.map((img: { url: string; file_id: string; thumbnail_url?: string; display_order?: number }, idx: number) => ({
        blog_id: blog.id,
        url: img.url,
        file_id: img.file_id,
        thumbnail_url: img.thumbnail_url || null,
        display_order: img.display_order ?? idx,
      }));

      const { error: imgError } = await supabaseAdmin
        .from('blog_images')
        .insert(imageRows);

      if (imgError) {
        // Blog was created but images failed — still return but warn
        return NextResponse.json({ ...blog, blog_images: [], _warning: imgError.message }, { status: 201 });
      }
    }

    // Fetch complete blog with images
    const { data: completeBlog } = await supabaseAdmin
      .from('blogs')
      .select('*, blog_images(*)')
      .eq('id', blog.id)
      .single();

    return NextResponse.json(completeBlog, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
