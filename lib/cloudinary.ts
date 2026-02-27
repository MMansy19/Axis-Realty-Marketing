import { v2 as cloudinary } from 'cloudinary';

let _configured = false;

function getCloudinary() {
  if (!_configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });
    _configured = true;
  }
  return cloudinary;
}

export async function uploadVideo(
  buffer: Buffer,
  folder: string = 'blogs'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = getCloudinary().uploader.upload_stream(
      {
        resource_type: 'video',
        folder,
      },
      (error: unknown, result: { secure_url: string; public_id: string } | undefined) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteVideo(publicId: string) {
  await getCloudinary().uploader.destroy(publicId, { resource_type: 'video' });
}

export { cloudinary };
