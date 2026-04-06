import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured, isSupabaseAdminConfigured } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

// GET /api/finishing-projects — public list of published finishing projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    let query;

    if (all === 'true') {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (!isSupabaseAdminConfigured()) {
        return NextResponse.json(
          { error: 'Supabase admin not configured.' },
          { status: 503 }
        );
      }
      query = supabaseAdmin
        .from('finishing_projects')
        .select('*, finishing_media(*)')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
    } else {
      if (!isSupabaseConfigured()) {
        return NextResponse.json(
          { error: 'Supabase not configured.' },
          { status: 503 }
        );
      }
      query = supabase
        .from('finishing_projects')
        .select('*, finishing_media(*)')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const projects = (data || []).map((project: Record<string, unknown>) => ({
      ...project,
      finishing_media: ((project.finishing_media as { display_order: number }[] | undefined) || []).sort(
        (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
      ),
    }));

    return NextResponse.json(projects);
  } catch (err) {
    console.error('GET /api/finishing-projects unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/finishing-projects — create a finishing project (admin only)
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: 'Supabase admin not configured.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      title_en, title_ar, slug, description_en, description_ar,
      location_en, location_ar, property_type, area, completion_date,
      cover_image_url, cover_image_file_id,
      is_published, display_order, media
    } = body;

    if (!title_en || !title_ar || !slug) {
      return NextResponse.json({ error: 'title_en, title_ar, and slug are required' }, { status: 400 });
    }

    // Insert project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('finishing_projects')
      .insert({
        title_en,
        title_ar,
        slug,
        description_en: description_en || null,
        description_ar: description_ar || null,
        location_en: location_en || null,
        location_ar: location_ar || null,
        property_type: property_type || null,
        area: area || null,
        completion_date: completion_date || null,
        cover_image_url: cover_image_url || null,
        cover_image_file_id: cover_image_file_id || null,
        is_published: is_published ?? false,
        display_order: display_order ?? 0,
      })
      .select()
      .single();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    // Insert media if any
    if (media && media.length > 0) {
      const mediaRows = media.map((m: {
        type: string; url: string; file_id?: string; public_id?: string;
        thumbnail_url?: string; is_before?: boolean; display_order?: number;
      }, idx: number) => ({
        project_id: project.id,
        type: m.type,
        url: m.url,
        file_id: m.file_id || null,
        public_id: m.public_id || null,
        thumbnail_url: m.thumbnail_url || null,
        is_before: m.is_before ?? false,
        display_order: m.display_order ?? idx,
      }));

      const { error: mediaError } = await supabaseAdmin
        .from('finishing_media')
        .insert(mediaRows);

      if (mediaError) {
        return NextResponse.json({ ...project, finishing_media: [], _warning: mediaError.message }, { status: 201 });
      }
    }

    // Fetch complete project with media
    const { data: completeProject } = await supabaseAdmin
      .from('finishing_projects')
      .select('*, finishing_media(*)')
      .eq('id', project.id)
      .single();

    return NextResponse.json(completeProject, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
