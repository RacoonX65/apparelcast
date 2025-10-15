# Cloudinary Setup Guide for Apparel Cast

This guide will help you set up Cloudinary for product image uploads in the Apparel Cast admin dashboard.

## Why Cloudinary?

Cloudinary provides:
- **Easy image uploads** with a beautiful widget interface
- **Automatic optimization** for faster page loads
- **Image transformations** (resize, crop, format conversion)
- **CDN delivery** for fast global access
- **Free tier** with generous limits (25 GB storage, 25 GB bandwidth/month)

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Click **Sign Up** and create a free account
3. Verify your email address

## Step 2: Get Your Cloud Name

1. After logging in, you'll see your **Dashboard**
2. Find your **Cloud name** at the top of the page
3. Copy this value - you'll need it for `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

## Step 3: Create an Upload Preset

An upload preset defines how images are handled when uploaded.

1. Go to **Settings** (gear icon in top right)
2. Click on **Upload** tab in the left sidebar
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `apparelcast_uploads` (or any name you prefer)
   - **Signing Mode**: Select **Unsigned** (important for client-side uploads)
   - **Folder**: `products` (optional, organizes your images)
   - **Allowed formats**: `jpg, png, jpeg, webp`
   - **Max file size**: `8000000` (8 MB)
   - **Transformation**: Optional - you can add automatic resizing/optimization
6. Click **Save**
7. Copy the preset name - you'll need it for `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

\`\`\`env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=apparelcast_uploads
\`\`\`

Replace:
- `your_cloud_name` with your actual cloud name from Step 2
- `apparelcast_uploads` with your preset name from Step 3

## Step 5: Test the Upload

1. Start your development server: `npm run dev`
2. Log in to the admin dashboard
3. Go to **Products** > **Add Product**
4. Click the **Upload Product Images** button
5. The Cloudinary widget should open
6. Try uploading an image

## Upload Preset Configuration Tips

### Basic Settings (Recommended)
\`\`\`
Preset name: apparelcast_uploads
Signing Mode: Unsigned
Folder: products
\`\`\`

### Advanced Settings (Optional)

**Image Optimization:**
- Format: Auto (automatically converts to best format)
- Quality: Auto (balances quality and file size)

**Transformations:**
- Width: 1200px (resize large images)
- Crop: Limit (maintains aspect ratio)
- Format: Auto

**Security:**
- Max file size: 8 MB
- Allowed formats: jpg, png, jpeg, webp

## Troubleshooting

### Widget doesn't open
- Check that environment variables are set correctly
- Verify the upload preset is **Unsigned**
- Check browser console for errors

### Upload fails
- Verify your upload preset name is correct
- Check that your Cloudinary account is active
- Ensure file size is under 8 MB
- Verify file format is allowed (jpg, png, jpeg, webp)

### Images don't display
- Check that the image URL is being saved to the database
- Verify the Cloudinary URL is accessible (try opening in browser)
- Check browser console for CORS errors

## Free Tier Limits

Cloudinary's free tier includes:
- **25 GB** storage
- **25 GB** bandwidth per month
- **Unlimited** transformations
- **1 user**

This is more than enough for most small to medium e-commerce stores.

## Upgrading

If you need more storage or bandwidth:
1. Go to **Settings** > **Account**
2. Click **Upgrade plan**
3. Choose a plan that fits your needs

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Upload Widget Documentation](https://cloudinary.com/documentation/upload_widget)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
\`\`\`



<AssistantMessageContentPart partEncoded="eyJ0eXBlIjoidGFzay13YWl0aW5nLXYxIiwiY3JlYXRlZEF0IjoxNzYwNDM0MTg5MTg5LCJmaW5pc2hlZEF0IjoxNzYwNDM0MTg5MTg5LCJpZCI6Ilh6ekNEaWFaZGdBMW94ekwiLCJsYXN0UGFydFNlbnRBdCI6MTc2MDQzNDE4OTE4OSwicGFydHMiOlt7InR5cGUiOiJ0b29sLWNhbGxzIn1dfQ==" />



<AssistantMessageContentPart partEncoded="eyJ0eXBlIjoidGFzay1yZWFkLWZpbGUtdjEiLCJpZCI6IjhEVlVzTnFXYXdyazFJdGYiLCJ0YXNrTmFtZUFjdGl2ZSI6IlJlYWRpbmcgUkVBRE1FIiwidG9vbENhbGxJZCI6InRvb2x1XzAxV1YzVmhBMmtBQjJWZERjajNmZk5jVSIsInRhc2tOYW1lQ29tcGxldGUiOiJSZWFkIFJFQURNRSIsImNyZWF0ZWRBdCI6MTc2MDQzNDE4OTk2OSwiZmluaXNoZWRBdCI6bnVsbCwicGFydHMiOltdLCJsYXN0UGFydFNlbnRBdCI6bnVsbH0=" />
