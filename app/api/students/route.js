import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const students = await prisma.students.findMany({
      orderBy: { students_id: 'asc' }
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'ดึงข้อมูลไม่สำเร็จ' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const id = parseInt(body.students_id); 

    const existing = await prisma.students.findUnique({
      where: { students_id: id }
    });

    if (existing) {
      return NextResponse.json({ error: 'รหัสนักเรียนนี้มีอยู่แล้ว' }, { status: 400 });
    }

    const newStudent = await prisma.students.create({
      data: {
        students_id: id,
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        tel: body.tel,
      }
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: 'เพิ่มนักเรียนไม่สำเร็จ' }, { status: 500 });
  }
}