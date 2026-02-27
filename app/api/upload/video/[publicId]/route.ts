import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { deleteVideo } from '@/lib/cloudinary';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { publicId } = await params;

  try {
    // publicId might have slashes encoded as dashes in URL, decode if needed
    await deleteVideo(decodeURIComponent(publicId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Video delete error:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}
