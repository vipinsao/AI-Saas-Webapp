import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest, { params }: any) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  try {
    const deletedVideo = await prisma.video.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting video" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
