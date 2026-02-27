تمام 👌
بما إنك **شركة تطوير عقاري خاصة بك** وليس Portal، فالمعماريّة تكون أبسط وأنظف وأسرع في التنفيذ.

سأعطيك الآن Blueprint احترافي واضح 👇

---

# 🏗 Architecture المقترحة

### Frontend

* Next.js 14 (App Router)
* Tailwind
* next-intl (Arabic / English)
* ISR أو SSG للـ SEO

### Backend

* Supabase (Database فقط)
* No Supabase Auth

### Media

* Images → ImageKit
* Videos → Cloudinary

---

# 🔐 Admin Authentication (بدون Auth System)

بما أنك تريد تسجيل دخول برقم سري فقط:

## الفكرة:

* Admin page: `/admin`
* يظهر Password input
* يتم مقارنة القيمة بـ `process.env.ADMIN_SECRET`
* إذا صحيحة → تخزن session بسيطة (cookie httpOnly أو localStorage)

## env file

```
ADMIN_SECRET=YourStrongPassword123
```

## مثال حماية صفحة admin (middleware)

```js
// middleware.ts
import { NextResponse } from 'next/server'

export function middleware(req) {
  const isAdmin = req.cookies.get('admin-auth')
  if (!isAdmin && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
}
```

---

# 🗄 Supabase Database Design

بما أن:

* Projects = Static (Hardcoded in Frontend)
* Blogs = Dynamic via Admin

إذن تحتاج Table واحدة فقط 👇

---

## 📑 Table: blog_posts

| column     | type      |
| ---------- | --------- |
| id         | uuid      |
| title      | text      |
| slug       | text      |
| content    | text      |
| images     | jsonb     |
| video_url  | text      |
| created_at | timestamp |

images = Array of ImageKit URLs

---

# 🏠 Website Structure

## 1️⃣ Landing Page

### Hero Section

* Background image (full width)
* Overlay gradient
* CTA button
* Title animated

```
bg-[url('/hero.jpg')] bg-cover bg-center h-screen
```

---

## 2️⃣ About Us

Static content
Company vision
Mission
Experience

---

## 3️⃣ Projects / Our Past Works

Static in Frontend

مثلاً:

```js
const projects = [
 {
   title: "New Cairo Villas",
   image: "/projects/villa.jpg",
   description: "Luxury residential compound..."
 }
]
```

ميزة ذلك:

* أسرع
* لا تحتاج DB
* أفضل SEO

---

## 4️⃣ Blog (Dynamic)

Route:

```
/blog
/blog/[slug]
```

Admin يمكنه:

* Add
* Delete
* Edit

---

# 🎨 UI Recommendation

* Dark hero overlay
* Large typography
* Minimal UI
* Luxury feeling


---

# 🔥 مميزات  بسيطة لكن قوية

* WhatsApp floating button
* CTA sticky bar
* Property Inquiry form
* Google Maps embed
* Sitemap auto generated
-------------------------------




# 📤 Image Upload Flow (ImageKit)

Admin Form:

1. Upload image
2. Direct upload to ImageKit
3. Get URL
4. Save URL inside Supabase

Example:

```js
const uploadImage = async (file) => {
  const res = await imagekit.upload({
    file: file,
    fileName: file.name,
    folder: "/real-estate/blog"
  })
  return res.url
}
```

Save in DB:

```js
await supabase.from("blog_posts").insert({
  title,
  content,
  images: imageUrls,
  video_url
})
```

---

# 🎥 Cloudinary Video Upload

Use unsigned upload preset:

```js
const uploadVideo = async (video) => {
  const formData = new FormData()
  formData.append("file", video)
  formData.append("upload_preset", "realestate")

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/YOUR_CLOUD/video/upload",
    {
      method: "POST",
      body: formData
    }
  )

  const data = await res.json()
  return data.secure_url
}
```

---

# 🧠 Admin Panel Structure

```
/admin
  /login
  /dashboard
  /add-blog
  /edit/[id]
```

Dashboard:

* View all posts
* Delete
* Edit

---

# 🌍 Localization Structure

```
/ar
/en
```

Use:

* next-intl
* Layout switch
* RTL support

---

# 🚀 SEO Structure

Each Blog Post:

* dynamic metadata
* OpenGraph image
* JSON-LD schema (Article)

Landing Page:

* RealEstateBusiness schema

---
