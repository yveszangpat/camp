import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeProjectSummaryStandards } from "@/lib/project-summary-standards";

const templateSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(500).optional().nullable(),
  template_data: z.record(z.string(), z.unknown()),
});

const reusableKeys = [
  "project_nature",
  "standard_alignments",
  "strategy",
  "department",
  "objectives",
  "execution_status",
  "quantitative_results",
  "qualitative_results",
  "success_indicators",
  "evaluation_results",
  "operation_assessment",
  "signatories",
] as const;

function resetResultRows(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.map((row) => ({
    ...row,
    result: "",
    status: "ยังไม่ประเมิน",
  }));
}

function resetEvaluationRows(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.map((row) => ({
    ...row,
    average: null,
    sd: null,
    interpretation: "ยังไม่ประเมิน",
  }));
}

function reusableData(source: Record<string, unknown>) {
  const data = Object.fromEntries(
    reusableKeys
      .filter((key) => source[key] !== undefined)
      .map((key) => [key, source[key]]),
  );

  data.quantitative_results = resetResultRows(data.quantitative_results);
  data.qualitative_results = resetResultRows(data.qualitative_results);
  data.success_indicators = resetResultRows(data.success_indicators);
  data.evaluation_results = resetEvaluationRows(data.evaluation_results);
  data.standard_alignments = normalizeProjectSummaryStandards(
    data.standard_alignments,
  );

  return data;
}

export async function GET() {
  const { teacher, error } = await requireTeacher();
  if (error) return error;

  const templates = await prisma.project_summary_document_template.findMany({
    where: { created_by_teacher_id: Number(teacher.teachers_id) },
    orderBy: [{ updated_at: "desc" }, { name: "asc" }],
  });

  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const { teacher, error } = await requireTeacher();
  if (error) return error;

  const parsed = templateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "ข้อมูลเท็มเพลตไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  const teacherId = Number(teacher.teachers_id);
  const templateData = JSON.parse(
    JSON.stringify(reusableData(parsed.data.template_data)),
  ) as Prisma.InputJsonValue;
  const template = await prisma.project_summary_document_template.upsert({
    where: {
      created_by_teacher_id_name: {
        created_by_teacher_id: teacherId,
        name: parsed.data.name,
      },
    },
    create: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      template_data: templateData,
      created_by_teacher_id: teacherId,
    },
    update: {
      description: parsed.data.description || null,
      template_data: templateData,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
