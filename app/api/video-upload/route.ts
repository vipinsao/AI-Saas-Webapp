import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

//we are connecting to our database so that as reponse we will sttore it our database
const prisma = new PrismaClient();

// Configuration
cloudinary.config({
  //this can be used via client side also thats why we are using next_public_cloud_name
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,

  //this should be highly secured
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

//because we are using typescript thats why this is important
interface CloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: number;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    //todo we have to check for user authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 } // Unauthorized
      );
    }

    if (
      !process.env.Next_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_SECRET ||
      !process.env.CLOUDINARY_API_KEY
    ) {
      return NextResponse.json(
        { error: "Cloudinary credentials not found" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = (formData.get("file") as File) || null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const originalSize = formData.get("originalSize") as string;

    if (!file) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    //for uploading any kind of file to cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "video-uploads",
            transformation: [{ quality: "auto", fetch_format: "mp4" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        );
        uploadStream.end(buffer);
      }
    );
    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: result.public_id,
        originalSize: originalSize,
        compressedSize: String(result.bytes),
        duration: result.duration || 0,
      },
    });
    return NextResponse.json(video);
  } catch (error) {
    console.log("Upload video failed", error);
    return NextResponse.json(
      { error: "Error uploading video" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
