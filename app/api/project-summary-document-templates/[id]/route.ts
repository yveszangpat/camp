import { NextResponse } from "next/server";

import { requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { teacher, error } = await requireTeacher();
  if (error) return error;

  const { id } = await context.params;
  const templateId = Number(id);
  if (!Number.isInteger(templateId) || templateId <= 0) {
    return NextResponse.json(
      { error: "รหัสเท็มเพลตไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  const deleted = await prisma.project_summary_document_template.deleteMany({
    where: {
      project_summary_document_template_id: templateId,
      created_by_teacher_id: Number(teacher.teachers_id),
    },
  });

  if (!deleted.count) {
    return NextResponse.json({ error: "ไม่พบเท็มเพลต" }, { status: 404 });
  }

  return NextResponse.json({ message: "ลบเท็มเพลตแล้ว" });
}
