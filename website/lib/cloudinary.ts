import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - The file buffer
 * @param filename - Original filename (used for public_id)
 * @param folder - Cloudinary folder path
 * @returns Upload result with URL
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  folder: string = "revisaacmpamaugo"
) {
  // Remove extension for public_id, add timestamp to avoid conflicts
  const timestamp = Date.now();
  const baseName = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const publicId = `${folder}/${timestamp}-${baseName}`;

  return new Promise<{ url: string; publicId: string; width?: number; height?: number }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          overwrite: true,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload failed: no result"));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      );
      uploadStream.end(buffer);
    }
  );
}

/**
 * Delete an image from Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string) {
  return new Promise<void>((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

/**
 * Generate an optimized image URL with transformations
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 */
export function getOptimizedUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg";
    crop?: "fill" | "fit" | "limit" | "thumb";
  } = {}
) {
  // Extract public_id from URL
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  const uploadIndex = pathParts.indexOf("upload");
  
  if (uploadIndex === -1) return url;
  
  // Get version and public_id after /upload/
  const afterUpload = pathParts.slice(uploadIndex + 1);
  // Remove version number (starts with v)
  const publicIdParts = afterUpload[0]?.startsWith("v") 
    ? afterUpload.slice(1) 
    : afterUpload;
  const publicId = publicIdParts.join("/").replace(/\.[^/.]+$/, "");

  // Build transformation string
  const transformations: string[] = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);

  const transformStr = transformations.length > 0 
    ? `${transformations.join(",")}/` 
    : "";

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}${publicId}`;
}
