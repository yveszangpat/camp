import { NextResponse } from "next/server";

import cloudinary from "@/config/cloudinary";
import { requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getPhoto(photoId: number, teacher: any) {
  const photo = await prisma.camp_project_summary_photo.findUnique({
    where: { camp_project_summary_photo_id: photoId },
    include: {
      summary_document: { select: { camp_camp_id: true, status: true } },
    },
  });
  if (!photo)
    return {
      error: NextResponse.json({ error: "ไม่พบรูปภาพ" }, { status: 404 }),
    };

  const camp = await prisma.camp.findFirst({
    where: { camp_id: photo.summary_document.camp_camp_id, deletedAt: null },
    select: { created_by_teacher_id: true },
  });
  if (
    !camp ||
    (teacher.role !== "ADMIN" &&
      camp.created_by_teacher_id !== teacher.teachers_id)
  ) {
    return {
      error: NextResponse.json(
        { error: "คุณไม่มีสิทธิ์จัดการรูปภาพนี้" },
        { status: 403 },
      ),
    };
  }
  if (photo.summary_document.status === "FINALIZED") {
    return {
      error: NextResponse.json(
        { error: "เอกสารฉบับสมบูรณ์ถูกยืนยันแล้ว กรุณาปลดล็อกก่อนแก้ไขรูปภาพ" },
        { status: 409 },
      ),
    };
  }
  return { photo };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ photoId: string }> },
) {
  const { teacher, error } = await requireTeacher();
  if (error) return error;
  const photo = await getPhoto(Number((await context.params).photoId), teacher);
  if (photo.error) return photo.error;
  const body = await request.json();
  const updated = await prisma.camp_project_summary_photo.update({
    where: {
      camp_project_summary_photo_id: photo.photo!.camp_project_summary_photo_id,
    },
    data: {
      caption:
        String(body?.caption || "")
          .trim()
          .slice(0, 500) || null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ photoId: string }> },
) {
  const { teacher, error } = await requireTeacher();
  if (error) return error;
  const photo = await getPhoto(Number((await context.params).photoId), teacher);
  if (photo.error) return photo.error;

  if (photo.photo!.public_id) {
    try {
      await cloudinary.uploader.destroy(photo.photo!.public_id, {
        resource_type: "image",
      });
    } catch (destroyError) {
      console.warn(
        "[project-summary-photo] Cloudinary delete failed",
        destroyError,
      );
    }
  }
  await prisma.camp_project_summary_photo.delete({
    where: {
      camp_project_summary_photo_id: photo.photo!.camp_project_summary_photo_id,
    },
  });
  return NextResponse.json({ success: true });
}
