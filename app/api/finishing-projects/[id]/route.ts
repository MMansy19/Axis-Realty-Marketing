import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';
import { deleteImage } from '@/lib/imagekit';
import { deleteVideo } from '@/lib/cloudinary';

// GET /api/finishing-projects/[id] — get a single finishing project
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('finishing_projects')
    .select('*, finishing_media(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  data.finishing_media = (data.finishing_media || []).sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
  );

  return NextResponse.json(data);
}

// PUT /api/finishing-projects/[id] — update a finishing project (admin only)
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
    const {
      title_en, title_ar, slug, description_en, description_ar,
      location_en, location_ar, property_type, area, completion_date,
      cover_image_url, cover_image_file_id,
      is_published, display_order, media
    } = body;

    // Update project fields
    const updateData: Record<string, unknown> = {};
    if (title_en !== undefined) updateData.title_en = title_en;
    if (title_ar !== undefined) updateData.title_ar = title_ar;
    if (slug !== undefined) updateData.slug = slug;
    if (description_en !== undefined) updateData.description_en = description_en;
    if (description_ar !== undefined) updateData.description_ar = description_ar;
    if (location_en !== undefined) updateData.location_en = location_en;
    if (location_ar !== undefined) updateData.location_ar = location_ar;
    if (property_type !== undefined) updateData.property_type = property_type;
    if (area !== undefined) updateData.area = area;
    if (completion_date !== undefined) updateData.completion_date = completion_date;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
    if (cover_image_file_id !== undefined) updateData.cover_image_file_id = cover_image_file_id;
    if (is_published !== undefined) updateData.is_published = is_published;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { error: updateError } = await supabaseAdmin
      .from('finishing_projects')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If media array provided, replace all media
    if (media !== undefined) {
      // Get current media to delete removed ones from ImageKit/Cloudinary
      const { data: currentMedia } = await supabaseAdmin
        .from('finishing_media')
        .select('*')
        .eq('project_id', id);

      const newFileIds = new Set(
        media
          .filter((m: { file_id?: string }) => m.file_id)
          .map((m: { file_id: string }) => m.file_id)
      );
      const newPublicIds = new Set(
        media
          .filter((m: { public_id?: string }) => m.public_id)
          .map((m: { public_id: string }) => m.public_id)
      );

      // Delete removed images from ImageKit
      for (const m of (currentMedia || [])) {
        if (m.type === 'image' && m.file_id && !newFileIds.has(m.file_id)) {
          try {
            await deleteImage(m.file_id);
          } catch (e) {
            console.error('Failed to delete image from ImageKit:', m.file_id, e);
          }
        }
        if (m.type === 'video' && m.public_id && !newPublicIds.has(m.public_id)) {
          try {
            await deleteVideo(m.public_id);
          } catch (e) {
            console.error('Failed to delete video from Cloudinary:', m.public_id, e);
          }
        }
      }

      // Delete all current media from DB
      await supabaseAdmin
        .from('finishing_media')
        .delete()
        .eq('project_id', id);

      // Insert new media
      if (media.length > 0) {
        const mediaRows = media.map((m: {
          type: string; url: string; file_id?: string; public_id?: string;
          thumbnail_url?: string; is_before?: boolean; display_order?: number;
        }, idx: number) => ({
          project_id: id,
          type: m.type,
          url: m.url,
          file_id: m.file_id || null,
          public_id: m.public_id || null,
          thumbnail_url: m.thumbnail_url || null,
          is_before: m.is_before ?? false,
          display_order: m.display_order ?? idx,
        }));

        await supabaseAdmin
          .from('finishing_media')
          .insert(mediaRows);
      }
    }

    // Fetch updated project
    const { data: updatedProject } = await supabaseAdmin
      .from('finishing_projects')
      .select('*, finishing_media(*)')
      .eq('id', id)
      .single();

    return NextResponse.json(updatedProject);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/finishing-projects/[id] — delete a finishing project (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Get project with media to clean up external files
  const { data: project } = await supabaseAdmin
    .from('finishing_projects')
    .select('*, finishing_media(*)')
    .eq('id', id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Delete images from ImageKit and videos from Cloudinary (best effort)
  for (const m of project.finishing_media || []) {
    if (m.type === 'image' && m.file_id) {
      try {
        await deleteImage(m.file_id);
      } catch (e) {
        console.error('Failed to delete image from ImageKit:', m.file_id, e);
      }
    }
    if (m.type === 'video' && m.public_id) {
      try {
        await deleteVideo(m.public_id);
      } catch (e) {
        console.error('Failed to delete video from Cloudinary:', m.public_id, e);
      }
    }
  }

  // Delete cover image from ImageKit if exists
  if (project.cover_image_file_id) {
    try {
      await deleteImage(project.cover_image_file_id);
    } catch (e) {
      console.error('Failed to delete cover image:', project.cover_image_file_id, e);
    }
  }

  // Delete project (cascade deletes finishing_media)
  const { error } = await supabaseAdmin
    .from('finishing_projects')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
