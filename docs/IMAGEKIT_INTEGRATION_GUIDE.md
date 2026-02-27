# ImageKit Image Upload — Complete Integration Guide

> Extracted from a production Arabic matrimonial platform (Alzawaj Alsaeid).
> Adapted for a **new project** using **Next.js + Express + Supabase + ImageKit**.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Setup](#2-prerequisites--setup)
3. [Environment Variables](#3-environment-variables)
4. [Backend: Express + ImageKit SDK](#4-backend-express--imagekit-sdk)
   - 4.1 [Install Dependencies](#41-install-dependencies)
   - 4.2 [ImageKit Service (Reusable)](#42-imagekit-service-reusable)
   - 4.3 [Multer Configuration](#43-multer-configuration)
   - 4.4 [Supabase Client](#44-supabase-client)
   - 4.5 [Upload Route & Controller](#45-upload-route--controller)
   - 4.6 [Mount the Routes](#46-mount-the-routes)
5. [Frontend: Next.js Upload](#5-frontend-nextjs-upload)
   - 5.1 [API Client Helper](#51-api-client-helper)
   - 5.2 [Upload Function](#52-upload-function)
   - 5.3 [React Upload Component](#53-react-upload-component)
   - 5.4 [Next.js Image Domain Config](#54-nextjs-image-domain-config)
6. [Supabase: Table Schema & RLS](#6-supabase-table-schema--rls)
7. [ImageKit URL Transformations](#7-imagekit-url-transformations)
8. [Complete End-to-End Flow](#8-complete-end-to-end-flow)
9. [Error Handling Patterns](#9-error-handling-patterns)
10. [Health Check Endpoint](#10-health-check-endpoint)
11. [Security Checklist](#11-security-checklist)
12. [File Structure for New Project](#12-file-structure-for-new-project)
13. [Original Codebase Reference](#13-original-codebase-reference)

---

## 1. Architecture Overview

```
┌──────────────────┐   multipart/form-data    ┌──────────────────┐   ImageKit SDK    ┌──────────────┐
│   Frontend       │ ──────────────────────►   │   Backend        │ ────────────────► │   ImageKit   │
│   (Next.js)      │                           │   (Express)      │                   │   Cloud CDN  │
│                  │  ◄─────────────────────   │                  │  ◄─────────────── │              │
│                  │   { url, thumbnailUrl,    │                  │   { url, fileId,  │              │
│                  │     fileId, id }          │                  │     filePath }    │              │
└──────────────────┘                           └────────┬─────────┘                   └──────────────┘
                                                        │
                                                        │ INSERT url, file_id
                                                        ▼
                                                ┌──────────────┐
                                                │   Supabase   │
                                                │  (PostgreSQL)│
                                                └──────────────┘
```

### Key Design Decisions (from production codebase)

| Decision | Rationale |
|----------|-----------|
| **Server-side upload only** | `IMAGEKIT_PRIVATE_KEY` never leaves the backend |
| **Multer `memoryStorage`** | ImageKit SDK needs a `Buffer` — no temp files on disk |
| **`useUniqueFileName: true`** | ImageKit appends random chars to prevent filename collisions |
| **Store `fileId` in DB** | Required to delete images from ImageKit later |
| **On-the-fly thumbnails** | `imagekit.url()` generates transformed URLs without creating new files |
| **Lazy SDK instantiation** | `new ImageKit(...)` per-request, not at module load — avoids startup crashes if env vars missing |

---

## 2. Prerequisites & Setup

### ImageKit Account Setup

1. Sign up at [https://imagekit.io](https://imagekit.io) (free tier: 20GB bandwidth/month)
2. From the **ImageKit Dashboard → Developer options**, get these 3 values:
   - **Public Key** — starts with `public_`
   - **Private Key** — starts with `private_` (**SECRET — backend only**)
   - **URL Endpoint** — looks like `https://ik.imagekit.io/your_imagekit_id`

### Required Packages

| Package | Purpose | Install Location |
|---------|---------|-----------------|
| `imagekit` | Node.js SDK for server-side uploads | Backend |
| `multer` | Parse `multipart/form-data` requests | Backend |
| `@supabase/supabase-js` | Supabase client | Backend + Frontend |
| `axios` | HTTP client for API calls | Frontend |

---

## 3. Environment Variables

### Backend `.env`

```bash
# ─── ImageKit (REQUIRED — all 3 must be set) ─────────────────────────────────
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxx          # SECRET! Backend only
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# ─── Supabase ────────────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-role-key    # Service role — backend only

# ─── Server ──────────────────────────────────────────────────────────────────
PORT=5001
CORS_ORIGIN=http://localhost:3000
```

### Frontend `.env.local`

```bash
# Only PUBLIC keys — NEVER put private keys here
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

> **⚠️ CRITICAL**: `IMAGEKIT_PRIVATE_KEY` and `SUPABASE_SERVICE_KEY` must **NEVER** appear in frontend code or `NEXT_PUBLIC_*` variables.

---

## 4. Backend: Express + ImageKit SDK

### 4.1 Install Dependencies

```bash
cd backend

# Runtime
npm install imagekit multer express cors dotenv @supabase/supabase-js

# TypeScript (optional)
npm install -D typescript @types/express @types/multer @types/cors @types/node
```

> **Note**: `imagekit ^6.0.0` includes built-in TypeScript types. No need for `@types/imagekit`.

---

### 4.2 ImageKit Service (Reusable)

This is the **core module**. In the original codebase, this logic was duplicated across `profileController.ts` and `adminBlogController.ts`. For your new project, create a **single shared service**.

```typescript
// src/services/imagekitService.ts

import ImageKit from "imagekit";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ImageKitUploadResult {
  /** Full CDN URL of the uploaded image */
  url: string;
  /** ImageKit file ID — MUST store in DB for later deletion */
  fileId: string;
  /** Transformed thumbnail URL (on-the-fly, no new file created) */
  thumbnailUrl: string;
  /** Path in ImageKit storage (e.g., /profile-pictures/img_abc123.jpg) */
  filePath: string;
}

export interface ThumbnailOptions {
  width: string;
  height: string;
  crop: "fit" | "at_max" | "maintain_ratio" | "force" | "at_least";
}

// ─── Configuration ───────────────────────────────────────────────────────────

const imageKitConfig = {
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Check if all 3 required ImageKit environment variables are set.
 * Use this before attempting uploads to give clear error messages.
 */
export const isImageKitConfigured = (): boolean => {
  return !!(
    imageKitConfig.publicKey &&
    imageKitConfig.privateKey &&
    imageKitConfig.urlEndpoint
  );
};

/**
 * Get an ImageKit SDK instance.
 *
 * Instantiated per-request (not at module load) so the server doesn't
 * crash on startup if env vars are missing — it only fails when an
 * upload is actually attempted.
 */
const getImageKit = (): ImageKit => {
  if (!isImageKitConfigured()) {
    throw new Error(
      "ImageKit configuration is missing. " +
        "Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT"
    );
  }
  return new ImageKit(imageKitConfig);
};

// ─── Upload ──────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to ImageKit and generate a thumbnail URL.
 *
 * @param file      - Multer file object (must use memoryStorage for `.buffer`)
 * @param folder    - ImageKit folder path (e.g., "profile-pictures", "blog")
 * @param fileName  - Base file name (ImageKit appends unique suffix)
 * @param thumbnail - Thumbnail transformation options (default: 300x300 fit)
 * @returns         - { url, fileId, thumbnailUrl, filePath }
 *
 * @example
 * ```ts
 * const result = await uploadToImageKit(
 *   req.file!,
 *   "profile-pictures",
 *   `profile-${userId}-${Date.now()}`,
 *   { width: "300", height: "300", crop: "fit" }
 * );
 * // result.url       → "https://ik.imagekit.io/your_id/profile-pictures/profile-123_abc.jpg"
 * // result.fileId    → "6123abc..."   ← STORE THIS IN YOUR DB
 * // result.thumbnailUrl → "https://ik.imagekit.io/your_id/tr:w-300,h-300,c-fit/profile-pictures/..."
 * ```
 */
export const uploadToImageKit = async (
  file: Express.Multer.File,
  folder: string,
  fileName: string,
  thumbnail: ThumbnailOptions = { width: "300", height: "300", crop: "fit" }
): Promise<ImageKitUploadResult> => {
  const imagekit = getImageKit();

  // Upload the buffer to ImageKit cloud storage
  const result = await imagekit.upload({
    file: file.buffer, // Buffer from multer memoryStorage
    fileName, //          e.g., "profile-user123-1708900000000"
    folder, //            e.g., "/profile-pictures"
    useUniqueFileName: true, // Appends random chars → prevents collisions
  });

  // Generate a thumbnail URL using ImageKit's URL transformation API.
  // This does NOT create a new file — it's an on-the-fly transformation
  // that ImageKit applies when the URL is requested.
  const thumbnailUrl = imagekit.url({
    path: result.filePath,
    transformation: [
      {
        width: thumbnail.width,
        height: thumbnail.height,
        crop: thumbnail.crop,
      },
    ],
  });

  return {
    url: result.url,
    fileId: result.fileId,
    thumbnailUrl,
    filePath: result.filePath,
  };
};

// ─── Delete ──────────────────────────────────────────────────────────────────

/**
 * Delete a file from ImageKit by its fileId.
 *
 * You MUST store `fileId` in your database when uploading.
 * Without it, you cannot delete the image from ImageKit.
 *
 * @param fileId - The ImageKit file ID returned from upload
 *
 * @example
 * ```ts
 * await deleteFromImageKit("6123abc456def...");
 * ```
 */
export const deleteFromImageKit = async (fileId: string): Promise<void> => {
  const imagekit = getImageKit();
  await imagekit.deleteFile(fileId);
};
```

---

### 4.3 Multer Configuration

Multer parses `multipart/form-data` requests and provides the file as `req.file`.

**You MUST use `memoryStorage`** — ImageKit SDK requires a `Buffer`, not a file path.

```typescript
// src/middleware/upload.ts

import multer from "multer";

// ─── Memory Storage ──────────────────────────────────────────────────────────
// Stores the uploaded file in memory as a Buffer (req.file.buffer)
// Required because ImageKit SDK's upload() method accepts Buffer | string
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
  },
  fileFilter: (_req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      // Reject non-image files silently (returns 400 from controller when req.file is null)
      cb(null, false);
    }
  },
});

// ─── Error Handler Middleware ─────────────────────────────────────────────────
// Place AFTER upload.single() in the route chain to catch multer-specific errors
export const handleMulterError = (
  err: any,
  _req: any,
  res: any,
  next: any
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 5MB limit",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  next(err);
};
```

---

### 4.4 Supabase Client

```typescript
// src/config/supabase.ts

import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
}

// Use service role key on backend — bypasses RLS for admin operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
```

---

### 4.5 Upload Route & Controller

#### Routes

```typescript
// src/routes/imageRoutes.ts

import { Router } from "express";
import { upload, handleMulterError } from "../middleware/upload";
import { protect } from "../middleware/auth"; // Your JWT/session auth middleware
import * as imageController from "../controllers/imageController";

const router = Router();

// ─── Upload a single image ──────────────────────────────────────────────────
// Field name "image" MUST match: formData.append("image", file) on frontend
router.post(
  "/upload",
  protect, //                    1. Authenticate user (JWT / session)
  upload.single("image"), //     2. Parse multipart → req.file (Buffer in memory)
  handleMulterError, //          3. Catch multer-specific errors (file too large, etc.)
  imageController.uploadImage // 4. Upload to ImageKit + save to Supabase
);

// ─── Delete an image ─────────────────────────────────────────────────────────
router.delete("/:id", protect, imageController.deleteImage);

// ─── Health check ────────────────────────────────────────────────────────────
router.get("/imagekit-status", imageController.getImageKitStatus);

export default router;
```

#### Controller

```typescript
// src/controllers/imageController.ts

import { Request, Response } from "express";
import {
  uploadToImageKit,
  deleteFromImageKit,
  isImageKitConfigured,
} from "../services/imagekitService";
import { supabase } from "../config/supabase";

// Extend Request to include user from auth middleware and file from multer
interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Set by your auth middleware
  file?: Express.Multer.File; // Set by multer
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD IMAGE
// POST /api/images/upload
// Body: multipart/form-data with field "image"
// ─────────────────────────────────────────────────────────────────────────────
export const uploadImage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    // ── Validation ───────────────────────────────────────────────────────
    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        message: "No image file provided. Accepted formats: JPG, PNG, WebP, GIF",
      });
      return;
    }

    // ── 1. Upload to ImageKit ────────────────────────────────────────────
    const uploadResult = await uploadToImageKit(
      file,
      "my-project-images", //            ImageKit folder name
      `image-${userId}-${Date.now()}`, // File name (unique suffix added by ImageKit)
      { width: "400", height: "400", crop: "fit" } // Thumbnail options
    );

    // ── 2. Save metadata to Supabase ─────────────────────────────────────
    const { data, error } = await supabase
      .from("images")
      .insert({
        user_id: userId,
        url: uploadResult.url,
        thumbnail_url: uploadResult.thumbnailUrl,
        file_id: uploadResult.fileId, // ← CRITICAL: needed for deletion
        file_path: uploadResult.filePath,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size,
      })
      .select()
      .single();

    if (error) {
      // DB save failed → clean up the orphaned ImageKit image
      console.error("Supabase insert failed:", error);
      await deleteFromImageKit(uploadResult.fileId).catch((err) =>
        console.error("Failed to clean up ImageKit image:", err)
      );
      res.status(500).json({
        success: false,
        message: "Failed to save image metadata",
      });
      return;
    }

    // ── 3. Return result ─────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        id: data.id,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        fileId: uploadResult.fileId,
      },
    });
  } catch (error: any) {
    console.error("Image upload error:", error);

    // ImageKit config error
    if (error.message?.includes("ImageKit configuration")) {
      res.status(503).json({
        success: false,
        message: "Image service is not configured. Contact administrator.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload image. Please try again.",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE IMAGE
// DELETE /api/images/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteImage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    // ── 1. Get image record from Supabase ────────────────────────────────
    const { data: image, error } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId) // Ensure user owns the image
      .single();

    if (error || !image) {
      res.status(404).json({ success: false, message: "Image not found" });
      return;
    }

    // ── 2. Delete from ImageKit ──────────────────────────────────────────
    if (image.file_id) {
      try {
        await deleteFromImageKit(image.file_id);
      } catch (err) {
        console.error("Failed to delete from ImageKit:", err);
        // Continue anyway — still delete from DB to avoid stuck records
      }
    }

    // ── 3. Delete record from Supabase ───────────────────────────────────
    const { error: deleteError } = await supabase
      .from("images")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Supabase delete failed:", deleteError);
      res.status(500).json({ success: false, message: "Failed to delete image record" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Image delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// REPLACE IMAGE (upload new + delete old in one operation)
// PUT /api/images/:id
// ─────────────────────────────────────────────────────────────────────────────
export const replaceImage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const file = req.file;

    if (!userId || !file) {
      res.status(400).json({ success: false, message: "Missing file or authentication" });
      return;
    }

    // ── 1. Get existing image record ─────────────────────────────────────
    const { data: existingImage } = await supabase
      .from("images")
      .select("file_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    // ── 2. Upload new image to ImageKit ──────────────────────────────────
    const uploadResult = await uploadToImageKit(
      file,
      "my-project-images",
      `image-${userId}-${Date.now()}`,
      { width: "400", height: "400", crop: "fit" }
    );

    // ── 3. Update Supabase record ────────────────────────────────────────
    const { data, error } = await supabase
      .from("images")
      .update({
        url: uploadResult.url,
        thumbnail_url: uploadResult.thumbnailUrl,
        file_id: uploadResult.fileId,
        file_path: uploadResult.filePath,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size,
        uploaded_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      // DB update failed → clean up the new ImageKit image
      await deleteFromImageKit(uploadResult.fileId).catch(console.error);
      res.status(500).json({ success: false, message: "Failed to update image record" });
      return;
    }

    // ── 4. Delete old image from ImageKit ────────────────────────────────
    if (existingImage?.file_id) {
      await deleteFromImageKit(existingImage.file_id).catch((err) =>
        console.error("Failed to delete old image:", err)
      );
    }

    res.status(200).json({
      success: true,
      message: "Image replaced successfully",
      data: {
        id: data.id,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error("Image replace error:", error);
    res.status(500).json({ success: false, message: "Failed to replace image" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// IMAGEKIT STATUS (health check)
// GET /api/images/imagekit-status
// ─────────────────────────────────────────────────────────────────────────────
export const getImageKitStatus = (_req: Request, res: Response): void => {
  const configured = isImageKitConfigured();
  res.json({
    success: true,
    data: {
      configured,
      hasPublicKey: !!process.env.IMAGEKIT_PUBLIC_KEY,
      hasPrivateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        ? process.env.IMAGEKIT_URL_ENDPOINT.substring(0, 30) + "..."
        : "not set",
    },
  });
};
```

---

### 4.6 Mount the Routes

```typescript
// src/server.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import imageRoutes from "./routes/imageRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/images", imageRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`ImageKit status: ${process.env.IMAGEKIT_PUBLIC_KEY ? "configured" : "NOT configured"}`);
});
```

---

## 5. Frontend: Next.js Upload

### 5.1 API Client Helper

```typescript
// lib/api/client.ts

import axios, { AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api",
});

// ─── Auth Interceptor ────────────────────────────────────────────────────────
// Injects JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── API Client ──────────────────────────────────────────────────────────────
export const ApiClient = {
  /**
   * Generic GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    const response = await api.get<{ success: boolean; data: T }>(url, config);
    return response.data;
  },

  /**
   * Generic POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await api.post<{ success: boolean; data: T; message?: string }>(
      url,
      data,
      config
    );
    return response.data;
  },

  /**
   * Upload a file via multipart/form-data.
   *
   * @param url        - API endpoint (e.g., "/images/upload")
   * @param file       - File object from <input type="file">
   * @param fieldName  - Must match backend multer field name (e.g., "image")
   * @param onProgress - Optional upload progress callback (0-100)
   *
   * @example
   * ```ts
   * const result = await ApiClient.uploadFile("/images/upload", file, "image", (pct) => {
   *   console.log(`${pct}% uploaded`);
   * });
   * ```
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName: string = "image",
    onProgress?: (percent: number) => void
  ) {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await api.post<{ success: boolean; data: T; message?: string }>(
      url,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Generic DELETE request
   */
  async delete<T = any>(url: string) {
    const response = await api.delete<{ success: boolean; data: T; message?: string }>(url);
    return response.data;
  },
};
```

---

### 5.2 Upload Function

```typescript
// lib/api/images.ts

import { ApiClient } from "./client";

export interface UploadImageResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  fileId: string;
}

/**
 * Upload an image: Frontend → Backend → ImageKit → Supabase.
 *
 * @param file        - File from <input type="file">
 * @param onProgress  - Optional progress callback (0-100)
 * @returns           - { id, url, thumbnailUrl, fileId }
 */
export async function uploadImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadImageResult> {
  const response = await ApiClient.uploadFile<UploadImageResult>(
    "/images/upload", // Backend endpoint
    file,
    "image", //         Field name — MUST match upload.single("image") on backend
    onProgress
  );

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.message || "Failed to upload image");
}

/**
 * Delete an image from ImageKit + Supabase.
 *
 * @param id - Image record ID from Supabase
 */
export async function deleteImage(id: string): Promise<void> {
  const response = await ApiClient.delete(`/images/${id}`);
  if (!response.success) {
    throw new Error(response.message || "Failed to delete image");
  }
}
```

---

### 5.3 React Upload Component

```tsx
// components/ImageUploader.tsx

"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { uploadImage, type UploadImageResult } from "@/lib/api/images";

interface ImageUploaderProps {
  /** Current image URL (for edit mode) */
  currentImageUrl?: string;
  /** Called after successful upload with the result */
  onUploadComplete?: (data: UploadImageResult) => void;
  /** Called on upload error */
  onUploadError?: (error: string) => void;
  /** Max file size in MB (default: 5) */
  maxSizeMB?: number;
  /** Shape: "circle" for profile pics, "rectangle" for blog images */
  shape?: "circle" | "rectangle";
  /** Display dimensions */
  width?: number;
  height?: number;
  /** Placeholder text */
  placeholder?: string;
}

export function ImageUploader({
  currentImageUrl,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 5,
  shape = "circle",
  width = 128,
  height = 128,
  placeholder = "Click to upload",
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // ── Client-side validation (fast feedback) ───────────────────────
      setError(null);

      if (!file.type.startsWith("image/")) {
        const msg = "Please select an image file (JPG, PNG, WebP, GIF)";
        setError(msg);
        onUploadError?.(msg);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        const msg = `File size must be less than ${maxSizeMB}MB`;
        setError(msg);
        onUploadError?.(msg);
        return;
      }

      // ── Show local preview immediately ───────────────────────────────
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      // ── Upload to backend → ImageKit → Supabase ─────────────────────
      setUploading(true);
      setProgress(0);

      try {
        const result = await uploadImage(file, (pct) => setProgress(pct));

        setPreview(result.url); // Replace local preview with CDN URL
        onUploadComplete?.(result);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err.message || "Upload failed";
        setError(msg);
        onUploadError?.(msg);
        setPreview(currentImageUrl || null); // Revert to original
      } finally {
        setUploading(false);
        setProgress(0);
        // Reset input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [currentImageUrl, maxSizeMB, onUploadComplete, onUploadError]
  );

  const borderRadius = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Clickable upload area */}
      <label
        htmlFor="image-upload"
        className={`cursor-pointer relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors ${borderRadius}`}
        style={{ width, height }}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Upload preview"
            fill
            className="object-cover"
            unoptimized={preview.startsWith("data:")} // Skip optimization for base64 previews
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center p-2">
            {placeholder}
          </div>
        )}

        {/* Upload progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
            <div className="w-3/4 h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white text-xs font-medium">{progress}%</span>
          </div>
        )}
      </label>

      {/* Hidden file input */}
      <input
        id="image-upload"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm max-w-[200px] text-center">{error}</p>
      )}

      {/* Upload button alternative (optional) */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
      >
        {uploading ? "Uploading..." : preview ? "Change image" : "Select image"}
      </button>
    </div>
  );
}
```

#### Usage in a page:

```tsx
// app/profile/page.tsx

"use client";

import { ImageUploader } from "@/components/ImageUploader";

export default function ProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Profile Picture</h1>

      <ImageUploader
        shape="circle"
        width={128}
        height={128}
        maxSizeMB={5}
        placeholder="Upload photo"
        onUploadComplete={(result) => {
          console.log("Uploaded!", result.url);
          // Optionally update user profile with the new image URL
        }}
        onUploadError={(error) => {
          console.error("Upload failed:", error);
        }}
      />
    </div>
  );
}
```

#### For blog images (rectangular):

```tsx
<ImageUploader
  shape="rectangle"
  width={600}
  height={400}
  maxSizeMB={5}
  placeholder="Upload featured image"
  onUploadComplete={(result) => {
    setFeaturedImageUrl(result.url);
  }}
/>
```

---

### 5.4 Next.js Image Domain Config

Allow ImageKit URLs in Next.js `<Image>` component:

```javascript
// next.config.js (or next.config.ts)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        // Allows ALL paths under ik.imagekit.io
      },
    ],
  },
};

module.exports = nextConfig;
```

---

## 6. Supabase: Table Schema & RLS

Run this in **Supabase SQL Editor** (Dashboard → SQL Editor → New Query):

```sql
-- ═══════════════════════════════════════════════════════════════════════════════
-- IMAGES TABLE — stores metadata for images uploaded to ImageKit
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.images (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ImageKit data (from upload response)
  url           TEXT NOT NULL,           -- Full CDN URL: https://ik.imagekit.io/xxx/path/img.jpg
  thumbnail_url TEXT,                    -- Transformed URL: https://ik.imagekit.io/xxx/tr:w-300/path/img.jpg
  file_id       TEXT NOT NULL,           -- ImageKit file ID (REQUIRED for deletion)
  file_path     TEXT,                    -- ImageKit path: /profile-pictures/img_abc123.jpg

  -- File metadata
  original_name TEXT,                    -- Original filename from user's device
  mime_type     TEXT,                    -- e.g., "image/jpeg", "image/png"
  size_bytes    INTEGER,                 -- File size in bytes
  alt_text      TEXT,                    -- Accessibility alt text

  -- Organization
  folder        TEXT DEFAULT 'general',  -- Logical grouping: "profile", "blog", etc.

  -- Timestamps
  uploaded_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_folder ON public.images(folder);
CREATE INDEX IF NOT EXISTS idx_images_file_id ON public.images(file_id);

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Users can view their own images
CREATE POLICY "Users can view own images"
  ON public.images FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own images
CREATE POLICY "Users can insert own images"
  ON public.images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own images
CREATE POLICY "Users can update own images"
  ON public.images FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
  ON public.images FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Comments ────────────────────────────────────────────────────────────────
COMMENT ON TABLE public.images IS 'Image metadata for files stored in ImageKit CDN';
COMMENT ON COLUMN public.images.file_id IS 'ImageKit file ID — REQUIRED for deleting images from ImageKit';
COMMENT ON COLUMN public.images.url IS 'Full ImageKit CDN URL — use this for display';
COMMENT ON COLUMN public.images.thumbnail_url IS 'ImageKit transformation URL — generated on upload, but can also be constructed client-side';
```

---

## 7. ImageKit URL Transformations

ImageKit generates thumbnails **on-the-fly** via URL parameters. No new files are created — the transformation is applied when the URL is requested and then cached on the CDN.

### How It Works in Code

```typescript
// Server-side: using the SDK
const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

const thumbnailUrl = imagekit.url({
  path: "/profile-pictures/profile-123_abc.jpg", // filePath from upload result
  transformation: [
    { width: "300", height: "300", crop: "fit" },
  ],
});
// → https://ik.imagekit.io/your_id/tr:w-300,h-300,c-fit/profile-pictures/profile-123_abc.jpg
```

### Client-Side Transformations (No SDK Needed)

You can construct transformation URLs directly in the frontend:

```typescript
// lib/utils/imagekit.ts

/**
 * Build an ImageKit transformation URL from an original URL.
 * No backend call needed — works purely with URL manipulation.
 *
 * @param originalUrl - Full ImageKit URL from DB
 * @param width       - Target width in pixels
 * @param height      - Target height in pixels
 * @param crop        - Crop strategy
 *
 * @example
 * ```ts
 * const thumb = getImageKitThumbnail(
 *   "https://ik.imagekit.io/abc/profile/img.jpg",
 *   150, 150, "fit"
 * );
 * // → "https://ik.imagekit.io/abc/tr:w-150,h-150,c-fit/profile/img.jpg"
 * ```
 */
export function getImageKitThumbnail(
  originalUrl: string,
  width: number,
  height: number,
  crop: string = "fit"
): string {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
  const path = originalUrl.replace(endpoint, "");
  return `${endpoint}/tr:w-${width},h-${height},c-${crop}${path}`;
}

/**
 * Cache-busting: append a timestamp to force browsers to reload
 * after an image is re-uploaded (same path, new content).
 */
export function withCacheBust(url: string, uploadedAt?: string | Date): string {
  if (!uploadedAt) return url;
  const timestamp = new Date(uploadedAt).getTime();
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_t=${timestamp}`;
}
```

### Common Crop Strategies

| Value | Behavior | Best For |
|-------|----------|----------|
| `fit` | Resize to fit within box, preserves aspect ratio | Profile pictures |
| `at_max` | Resize so largest dimension fits, no distortion | Blog thumbnails |
| `maintain_ratio` | Resize + center-crop to exact dimensions | Gallery grids |
| `force` | Force exact dimensions, may distort | Rarely used |
| `at_least` | Resize so smallest dimension fits | Hero images |

### Common Transformation Cheat Sheet

```
Original:  https://ik.imagekit.io/abc/folder/image.jpg
Resize:    https://ik.imagekit.io/abc/tr:w-300,h-300/folder/image.jpg
Crop:      https://ik.imagekit.io/abc/tr:w-300,h-300,c-fit/folder/image.jpg
Quality:   https://ik.imagekit.io/abc/tr:q-80/folder/image.jpg
Blur:      https://ik.imagekit.io/abc/tr:bl-10/folder/image.jpg
Grayscale: https://ik.imagekit.io/abc/tr:e-grayscale/folder/image.jpg
Format:    https://ik.imagekit.io/abc/tr:f-webp/folder/image.jpg
Chain:     https://ik.imagekit.io/abc/tr:w-300,h-300,c-fit,q-80,f-webp/folder/image.jpg
```

---

## 8. Complete End-to-End Flow

```
USER                        FRONTEND                       BACKEND                     IMAGEKIT            SUPABASE
 │                            │                              │                           │                    │
 │  Clicks upload area        │                              │                           │                    │
 │ ─────────────────────────► │                              │                           │                    │
 │                            │                              │                           │                    │
 │                            │  Validates file:             │                           │                    │
 │                            │  • type starts with image/   │                           │                    │
 │                            │  • size ≤ 5MB                │                           │                    │
 │                            │                              │                           │                    │
 │                            │  Shows local preview         │                           │                    │
 │                            │  (FileReader → base64)       │                           │                    │
 │                            │                              │                           │                    │
 │                            │  POST /api/images/upload     │                           │                    │
 │                            │  Content-Type: multipart     │                           │                    │
 │                            │  Field: "image" = File       │                           │                    │
 │                            │ ─────────────────────────► │                           │                    │
 │                            │                              │                           │                    │
 │                            │                              │  multer.single("image")   │                    │
 │                            │                              │  → req.file.buffer        │                    │
 │                            │                              │                           │                    │
 │                            │                              │  imagekit.upload({        │                    │
 │                            │                              │    file: buffer,          │                    │
 │                            │                              │    fileName, folder,      │                    │
 │                            │                              │    useUniqueFileName      │                    │
 │                            │                              │  })                       │                    │
 │                            │                              │ ─────────────────────────►│                    │
 │                            │                              │                           │                    │
 │                            │                              │  ◄─────────────────────── │                    │
 │                            │                              │  { url, fileId, filePath }│                    │
 │                            │                              │                           │                    │
 │                            │                              │  imagekit.url({ path,     │                    │
 │                            │                              │    transformation })      │                    │
 │                            │                              │  → thumbnailUrl           │                    │
 │                            │                              │                           │                    │
 │                            │                              │  INSERT INTO images       │                    │
 │                            │                              │  (url, file_id, ...)      │                    │
 │                            │                              │ ──────────────────────────────────────────────►│
 │                            │                              │                           │                    │
 │                            │                              │  ◄──────────────────────────────────────────── │
 │                            │                              │  { id, ... }              │                    │
 │                            │                              │                           │                    │
 │                            │  ◄───────────────────────── │                           │                    │
 │                            │  { id, url, thumbnailUrl }   │                           │                    │
 │                            │                              │                           │                    │
 │  ◄──────────────────────── │                              │                           │                    │
 │  Shows CDN image           │                              │                           │                    │
 │  (replaces base64 preview) │                              │                           │                    │
```

---

## 9. Error Handling Patterns

### Backend Errors

| Error | Status | When |
|-------|--------|------|
| No file in request | 400 | User didn't select a file, or field name mismatch |
| File too large | 400 | Multer `LIMIT_FILE_SIZE` exceeded |
| Not authenticated | 401 | Missing/invalid JWT token |
| ImageKit not configured | 503 | Missing env vars |
| ImageKit upload failed | 500 | Network issue, ImageKit service down |
| Supabase insert failed | 500 | DB error (cleans up ImageKit image) |

### Frontend Error Handling

```typescript
try {
  const result = await uploadImage(file);
  // Success — update UI
} catch (error: any) {
  if (!error.response) {
    // Network error (no response from server)
    setError("Network error. Check your connection.");
    return;
  }

  const status = error.response?.status;
  const message = error.response?.data?.message;

  switch (status) {
    case 400:
      setError(message || "Invalid file. Check type and size.");
      break;
    case 401:
      setError("Please log in to upload images.");
      break;
    case 413:
      setError("File too large. Maximum 5MB.");
      break;
    case 503:
      setError("Image service unavailable. Try again later.");
      break;
    default:
      setError("Upload failed. Please try again.");
  }
}
```

### Critical Cleanup Pattern

If Supabase save fails after ImageKit upload succeeds, **delete the orphaned image**:

```typescript
// In the controller:
const uploadResult = await uploadToImageKit(file, folder, fileName);

const { error } = await supabase.from("images").insert({ ... });

if (error) {
  // ⚠️ CRITICAL: Clean up orphaned ImageKit image
  await deleteFromImageKit(uploadResult.fileId).catch(console.error);
  throw error;
}
```

---

## 10. Health Check Endpoint

Verify ImageKit is properly configured before users attempt uploads:

```bash
# Test it
curl http://localhost:5001/api/images/imagekit-status

# Response:
{
  "success": true,
  "data": {
    "configured": true,
    "hasPublicKey": true,
    "hasPrivateKey": true,
    "urlEndpoint": "https://ik.imagekit.io/your..."
  }
}
```

---

## 11. Security Checklist

- [ ] `IMAGEKIT_PRIVATE_KEY` is ONLY in backend `.env`, never in `NEXT_PUBLIC_*`
- [ ] `SUPABASE_SERVICE_KEY` is ONLY in backend `.env`, never in frontend
- [ ] Multer `fileFilter` rejects non-image MIME types
- [ ] Multer `limits.fileSize` caps uploads at 5MB (or your limit)
- [ ] Auth middleware (`protect`) runs BEFORE upload middleware
- [ ] Rate limiting on upload endpoints (prevent abuse/cost spikes)
- [ ] Supabase RLS policies restrict image access to owners
- [ ] Old images are deleted from ImageKit when replaced (`deleteFromImageKit`)
- [ ] `file_id` is stored in database for EVERY upload (required for deletion)
- [ ] Frontend validates file type + size before sending (faster user feedback)
- [ ] `next.config.js` allowlists only `ik.imagekit.io` hostname
- [ ] Error handling cleans up orphaned ImageKit images if DB save fails

---

## 12. File Structure for New Project

```
my-new-project/
├── backend/
│   ├── src/
│   │   ├── server.ts                     # Express entry point
│   │   ├── config/
│   │   │   └── supabase.ts               # Supabase client (service role key)
│   │   ├── services/
│   │   │   └── imagekitService.ts         # uploadToImageKit() + deleteFromImageKit()
│   │   ├── middleware/
│   │   │   ├── auth.ts                    # JWT/session authentication
│   │   │   └── upload.ts                  # Multer config + error handler
│   │   ├── controllers/
│   │   │   └── imageController.ts         # upload, delete, replace, status
│   │   └── routes/
│   │       └── imageRoutes.ts             # POST /upload, DELETE /:id, GET /status
│   ├── .env                               # IMAGEKIT_PRIVATE_KEY + SUPABASE_SERVICE_KEY
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/                               # Next.js App Router
│   │   └── profile/
│   │       └── page.tsx                   # Example page using ImageUploader
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                  # Axios + uploadFile() helper
│   │   │   └── images.ts                  # uploadImage() + deleteImage()
│   │   └── utils/
│   │       └── imagekit.ts                # getImageKitThumbnail() + withCacheBust()
│   ├── components/
│   │   └── ImageUploader.tsx              # Reusable upload component
│   ├── next.config.js                     # ik.imagekit.io in remotePatterns
│   ├── .env.local                         # NEXT_PUBLIC_* only
│   └── package.json
│
└── supabase/
    └── migrations/
        └── 001_create_images_table.sql    # images table + RLS policies
```

---

## 13. Original Codebase Reference

This guide was extracted from these files in the Alzawaj project:

### Backend Files

| File | What It Contains |
|------|-----------------|
| `alzawaj-project-backend/src/controllers/profileController.ts` | ImageKit config + `uploadToImageKit()` + `deleteFromImageKit()` + `uploadProfilePicture` controller |
| `alzawaj-project-backend/src/controllers/adminBlogController.ts` | Duplicate ImageKit config + blog `uploadToImageKit()` (600x400 thumbnails) |
| `alzawaj-project-backend/src/routes/profileRoutes.ts` | `POST /api/profile/picture` with multer `memoryStorage` + `upload.single('photo')` |
| `alzawaj-project-backend/src/routes/adminBlogRoutes.ts` | `POST /api/admin/blogs` with multer + `upload.single('featuredImage')` |
| `alzawaj-project-backend/src/models/Profile.ts` | `IProfilePicture { url, thumbnailUrl, uploadedAt, fileId }` interface |
| `alzawaj-project-backend/package.json` | `"imagekit": "^6.0.0"` dependency |

### Frontend Files

| File | What It Contains |
|------|-----------------|
| `alzawaj-project-frontend/lib/api/profile.ts` | `uploadProfilePicture(file)` — FormData with `"photo"` field |
| `alzawaj-project-frontend/lib/api/client.ts` | `ApiClient.uploadFile()` — generic multipart upload helper |
| `alzawaj-project-frontend/lib/api/blog.ts` | `blogApi.createPost()` — FormData with `"featuredImage"` field |
| `alzawaj-project-frontend/components/profile/profile-view.tsx` | `handlePhotoUpload()` — validate + upload + refresh profile |
| `alzawaj-project-frontend/components/profile/ProfileImage.tsx` | Display component with cache-busting `?_t=timestamp` |
| `alzawaj-project-frontend/providers/auth-provider.tsx` | Pending photo upload after login (from registration) |
| `alzawaj-project-frontend/next.config.js` | `remotePatterns: [{ hostname: "ik.imagekit.io" }]` |

### Key Differences from Original → This Guide

| Original Codebase | This Guide |
|-------------------|------------|
| ImageKit helpers duplicated in 2 controllers | Single shared `imagekitService.ts` |
| MongoDB/Mongoose for storage | Supabase/PostgreSQL |
| No replace-image endpoint | Includes `replaceImage` controller |
| No upload progress tracking | Frontend progress callback |
| Profile-specific upload logic | Generic, reusable image upload |
| Two different field names (`photo`, `featuredImage`) | Single field name (`image`) with docs on customizing |

---

## Quick Start Checklist

```bash
# 1. Create ImageKit account → get keys
# 2. Create Supabase project → run SQL migration
# 3. Set up backend
cd backend
npm install imagekit multer express cors dotenv @supabase/supabase-js
# Copy .env and fill in keys
npm run dev

# 4. Verify ImageKit is configured
curl http://localhost:5001/api/images/imagekit-status

# 5. Set up frontend
cd frontend
npm install axios
# Copy .env.local
npm run dev

# 6. Test upload via curl
curl -X POST http://localhost:5001/api/images/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/test.jpg"

# 7. Check Supabase → images table should have a new row
# 8. Open the returned URL in browser → image on ImageKit CDN
```
