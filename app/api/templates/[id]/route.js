
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET - ดึงข้อมูลเต็มของ template (เฉพาะตัวที่เลือก)
 */
export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const templateId = parseInt(resolvedParams.id);

        console.log("Fetching template ID:", templateId);

        const template = await prisma.camp_template.findUnique({
            where: {
                camp_template_id: templateId
            },
            include: {
                camp: {
                    select: {
                        camp_id: true,
                        name: true,
                        location: true,
                        description: true,
                        has_shirt: true,
                        camp_classroom: {
                            select: {
                                classroom_classroom_id: true,
                                classroom: {
                                    select: {
                                        classroom_id: true,
                                        grade: true,
                                        type_classroom: true,
                                        teacher: {
                                            select: {
                                                firstname: true,
                                                lastname: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!template) {
            console.log("Template not found");
            return NextResponse.json(
                { error: "ไม่พบ Template" },
                { status: 404 }
            );
        }

        console.log("Template found:", template);
        return NextResponse.json(template);
    } catch (error) {
        console.error("Error fetching template:", error);
        return NextResponse.json(
            { 
                error: "ไม่สามารถดึงข้อมูล Template ได้",
                details: error.message 
            },
            { status: 500 }
        );
    }
}