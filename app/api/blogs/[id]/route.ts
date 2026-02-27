import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';
import { deleteImage } from '@/lib/imagekit';
import { deleteVideo } from '@/lib/cloudinary';

// GET /api/blogs/[id] — get a single blog
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('blogs')
    .select('*, blog_images(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  // Sort images
  data.blog_images = (data.blog_images || []).sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
  );

  return NextResponse.json(data);
}

// PUT /api/blogs/[id] — update a blog (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { title_en, title_ar, slug, video_url, video_public_id, is_published, display_order, images } = body;

    // Update blog fields
    const updateData: Record<string, unknown> = {};
    if (title_en !== undefined) updateData.title_en = title_en;
    if (title_ar !== undefined) updateData.title_ar = title_ar;
    if (slug !== undefined) updateData.slug = slug;
    if (video_url !== undefined) updateData.video_url = video_url;
    if (video_public_id !== undefined) updateData.video_public_id = video_public_id;
    if (is_published !== undefined) updateData.is_published = is_published;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { error: updateError } = await supabaseAdmin
      .from('blogs')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If images array provided, replace all images
    if (images !== undefined) {
      // Get current images to delete removed ones from ImageKit
      const { data: currentImages } = await supabaseAdmin
        .from('blog_images')
        .select('*')
        .eq('blog_id', id);

      const newFileIds = new Set(images.map((img: { file_id: string }) => img.file_id));
      const imagesToDelete = (currentImages || []).filter(
        (img: { file_id: string }) => !newFileIds.has(img.file_id)
      );

      // Delete removed images from ImageKit (best effort)
      for (const img of imagesToDelete) {
        try {
          await deleteImage(img.file_id);
        } catch (e) {
          console.error('Failed to delete image from ImageKit:', img.file_id, e);
        }
      }

      // Delete all current images from DB
      await supabaseAdmin
        .from('blog_images')
        .delete()
        .eq('blog_id', id);

      // Insert new images
      if (images.length > 0) {
        const imageRows = images.map((img: { url: string; file_id: string; thumbnail_url?: string; display_order?: number }, idx: number) => ({
          blog_id: id,
          url: img.url,
          file_id: img.file_id,
          thumbnail_url: img.thumbnail_url || null,
          display_order: img.display_order ?? idx,
        }));

        await supabaseAdmin
          .from('blog_images')
          .insert(imageRows);
      }
    }

    // Fetch updated blog
    const { data: updatedBlog } = await supabaseAdmin
      .from('blogs')
      .select('*, blog_images(*)')
      .eq('id', id)
      .single();

    return NextResponse.json(updatedBlog);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/blogs/[id] — delete a blog (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Get blog with images to clean up external files
  const { data: blog } = await supabaseAdmin
    .from('blogs')
    .select('*, blog_images(*)')
    .eq('id', id)
    .single();

  if (!blog) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  // Delete images from ImageKit (best effort)
  for (const img of blog.blog_images || []) {
    try {
      await deleteImage(img.file_id);
    } catch (e) {
      console.error('Failed to delete image from ImageKit:', img.file_id, e);
    }
  }

  // Delete video from Cloudinary (best effort)
  if (blog.video_public_id) {
    try {
      await deleteVideo(blog.video_public_id);
    } catch (e) {
      console.error('Failed to delete video from Cloudinary:', blog.video_public_id, e);
    }
  }

  // Delete blog (cascade deletes blog_images)
  const { error } = await supabaseAdmin
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
