import ImageKit from 'imagekit';

let _imagekit: InstanceType<typeof ImageKit> | null = null;

function getImageKit() {
  if (!_imagekit) {
    _imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
    });
  }
  return _imagekit;
}

export async function uploadImage(
  buffer: Buffer,
  fileName: string,
  folder: string = '/blogs'
) {
  const result = await getImageKit().upload({
    file: buffer,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  // Generate thumbnail URL using ImageKit transformations
  const thumbnailUrl = result.url.replace(
    '/blogs/',
    '/blogs/tr:w-400,h-300,fo-auto/'
  );

  return {
    url: result.url,
    fileId: result.fileId,
    thumbnailUrl,
  };
}

export async function deleteImage(fileId: string) {
  await getImageKit().deleteFile(fileId);
}
