import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "../lib/db";
import { createProjectDocumentPdf } from "../lib/project-document-pdf";

const campId = 540001;
const responsible = "นายวรวุฒิ ศรีโพธิ์";

const personnelSpecs = [
  ["นาย", "วรวุฒิ", "ศรีโพธิ์", "ครู โรงเรียนขุขันธ์"],
  ["นาย", "วรวุฒิ", "ศรีโพธิ์", "หัวหน้ากลุ่มสาระการเรียนรู้วิทยาศาสตร์"],
  ["นางสาว", "พิมศิณี", "พุทธชาติ", "หัวหน้างานงบประมาณและโครงการ"],
  [
    "นางสาว",
    "เกวลี",
    "ศุภเลิศ",
    "รองผู้อำนวยการโรงเรียนขุขันธ์ กลุ่มบริหารงานงบประมาณและแผน",
  ],
  ["นาย", "สุชาติ", "เทสันตะ", "ผู้อำนวยการโรงเรียนขุขันธ์"],
] as const;

async function main() {
  const people = [];

  for (const [prefix_name, firstname, lastname, position] of personnelSpecs) {
    const person = await prisma.document_personnel.findFirstOrThrow({
      where: { prefix_name, firstname, lastname, position },
    });
    people.push(person);
  }

  const data = {
    fiscal_year: 2569,
    project_name: "โครงการเสริมนักเรียนสู่ความเป็นเลิศ",
    project_code: "ว2-201",
    activity_name:
      "กิจกรรมส่งเสริมการแข่งขันโครงงานวิทยาศาสตร์และแข่งขันทักษะวิทยาศาสตร์ระดับภูมิภาค (มหาลัยต่าง ๆ)",
    activity_order: "2.1 (หน้า 103)",
    project_type: "CONTINUING",
    standards:
      "มาตรฐานการศึกษาขั้นพื้นฐานฯ มาตรฐานที่ 1,3 ข้อที่ 1.1, 3 ตัวชี้วัดที่ 1.1.2, 3.1",
    strategy:
      "กลยุทธ์โรงเรียน ข้อที่ 3 ส่งเสริมผู้เรียนให้มีความเป็นเลิศทางทักษะวิชาการ ทักษะวิชาชีพ\nทักษะชีวิต และทักษะการเรียนรู้ในศตวรรษที่ 21",
    responsible_people: responsible,
    department: "วิทยาศาสตร์",
    rationale:
      "โรงเรียนขุขันธ์จัดการเรียนที่เน้นผู้เรียนเป็นสำคัญ โดยเน้นให้นักเรียนได้ปฏิบัติ และเรียนรู้ผ่านกระบวนการจากแหล่งเรียนรู้จริง โดยพัฒนานักเรียนที่มีอัจฉริยภาพทางด้านวิทยาศาสตร์ คณิตศาสตร์และเทคโนโลยี ให้มีความรู้ด้านวิชาการ และทำกิจกรรมที่จะพัฒนาให้เป็นมนุษย์ที่สมบูรณ์ มีเจตคติที่ดี มุ่งเน้นการคิดแก้ปัญหา เพื่อให้นักเรียนนำความรู้ ความสามารถและทักษะกระบวนการทางวิทยาศาสตร์จากห้องเรียน สู่การแก้ปัญหาตามสถานการณ์ที่เกิดขึ้นอย่างหลากหลายนอกห้องเรียน การเรียนการสอนวิทยาศาสตร์ มุ่งพัฒนาความสามารถหลายด้านอันได้แก่ ด้านการสังเกต กระบวนการวิทยาศาสตร์ การเชื่อมโยงเหตุผล และการคิดสร้างสรรค์ โรงเรียนขุขันธ์เป็นโรงเรียนมาตรฐานสากล มุ่งเน้นพัฒนานักเรียนสู่สากล มุ่งเน้นสร้างผู้เรียนให้มีความรู้และทักษะพร้อมแข่งขันในเวทีต่าง ๆ ให้นักเรียนมีประสบการณ์ในเวทีแข่งขันที่หลากหลาย เช่น การแข่งขันโครงงานวิทยาศาสตร์ การตอบปัญหาทางวิชาการ ฯลฯ ในเวทีระดับภูมิภาค และเวทีระดับชาติ โรงเรียนขุขันธ์จึงได้จัดทำโครงการนี้ขึ้นมา",
    objectives: [
      "เพื่อพัฒนาการแข่งขันด้านโครงงานวิทยาศาสตร์ระดับภูมิภาค",
      "เพื่อพัฒนาการแข่งขันทักษะวิทยาศาสตร์ระดับภูมิภาค",
    ],
    quantitative_targets: [
      "นักเรียนระดับชั้นมัธยมศึกษาตอนต้นและมัธยมศึกษาตอนปลาย ปีการศึกษา 2568 จำนวน 40 คน",
    ],
    qualitative_targets: [
      "นักเรียนมีผลสัมฤทธิ์ทางการเรียนที่สูงขึ้นอยู่ในระดับดี",
      "นักเรียนมีทักษะกระบวนการวิทยาศาสตร์และมีประสบการณ์ในการแข่งขันระดับภูมิภาคอยู่ในระดับดี",
    ],
    procedures: [
      {
        step: "1. วางแผน (Plan)",
        method:
          "1. ประชุมโครงการ เพื่อขออนุมัติงบประมาณ\n2. ประชุมคณะทำงาน / แต่งตั้งคณะกรรมการดำเนินงาน",
        period: "14-26 สิงหาคม 69",
        budget: 0,
        responsible,
      },
      {
        step: "2. ดำเนินการ (Do)",
        method:
          "กิจกรรมที่ดำเนินการ\n1. ติดต่อประสานงานกับวิทยากร\n2. ติดต่อประสานงานสถานที่ในการจัดกิจกรรม\n3. จัดทำใบขออนุญาตผู้ปกครองนักเรียน และแจ้งกำหนดการ\n4. นำนักเรียนเข้าร่วมแข่งขันในกิจกรรมต่าง ๆ",
        period: "14-26 สิงหาคม 69",
        budget: 53020,
        responsible,
      },
      {
        step: "3. ตรวจสอบ (Check)",
        method:
          "ติดตามและตรวจสอบตามขั้นตอนและแผนปฏิบัติการประจำปีงบประมาณ 2569",
        period: "14-26 สิงหาคม 69",
        budget: 0,
        responsible,
      },
      {
        step: "4. ประเมินผลและรายงาน (Action)",
        method: "สรุป ประเมินผล และรายงานโครงการ",
        period: "14-26 สิงหาคม 69",
        budget: 0,
        responsible,
      },
    ],
    duration_text:
      "ระหว่างวันที่ 14 เดือน สิงหาคม พ.ศ. 2569 ถึง วันที่ 26 เดือน สิงหาคม พ.ศ. 2569",
    location_text: "6.1 โรงเรียนขุขันธ์ อำเภอขุขันธ์ จังหวัดศรีสะเกษ",
    budget_total: 53020,
    budget_source: "เงินอุดหนุน",
    budget_items: [
      {
        description:
          "กิจกรรมส่งเสริมการแข่งขันโครงงานวิทยาศาสตร์และแข่งขันทักษะวิทยาศาสตร์ระดับภูมิภาค",
        compensation: 53020,
        expenses: 0,
        materials: 0,
        responsible,
      },
    ],
    evaluations: [
      {
        indicator:
          "ผู้เรียนมีการคิดอย่างเป็นระบบตามกระบวนการทางวิทยาศาสตร์ ร้อยละ 85",
        method: "สอบถาม",
        tool: "แบบสอบถาม",
      },
      {
        indicator: "นักเรียนประสบความสำเร็จในการแข่งขันระดับภูมิภาค ร้อยละ 80",
        method: "สอบถาม",
        tool: "แบบสอบถาม",
      },
    ],
    expected_results: [
      "นักเรียนมีพัฒนาการด้านการแข่งขันด้านโครงงานวิทยาศาสตร์",
      "นักเรียนมีพัฒนาการการแข่งขันทักษะวิทยาศาสตร์ระดับภูมิภาค",
    ],
    signatories: [
      {
        role: "ผู้เสนอโครงการ",
        personnelId: people[0].document_personnel_id,
        prefixName: people[0].prefix_name,
        firstname: people[0].firstname,
        lastname: people[0].lastname,
        position: people[0].position,
      },
      {
        role: "ผู้เห็นชอบโครงการ",
        personnelId: people[1].document_personnel_id,
        prefixName: people[1].prefix_name,
        firstname: people[1].firstname,
        lastname: people[1].lastname,
        position: people[1].position,
      },
      {
        role: "ผู้ตรวจสอบโครงการ",
        personnelId: people[2].document_personnel_id,
        prefixName: people[2].prefix_name,
        firstname: people[2].firstname,
        lastname: people[2].lastname,
        position: people[2].position,
      },
      {
        role: "ผู้เห็นชอบโครงการ",
        personnelId: people[3].document_personnel_id,
        prefixName: people[3].prefix_name,
        firstname: people[3].firstname,
        lastname: people[3].lastname,
        position: people[3].position,
      },
      {
        role: "ผู้อนุมัติโครงการ",
        personnelId: people[4].document_personnel_id,
        prefixName: people[4].prefix_name,
        firstname: people[4].firstname,
        lastname: people[4].lastname,
        position: people[4].position,
      },
    ],
  };

  const document = await prisma.camp_project_document.upsert({
    where: { camp_camp_id: campId },
    create: { camp_camp_id: campId, ...data },
    update: data,
  });

  const outputDir = path.join(process.cwd(), "output", "pdf");
  const outputPath = path.join(
    outputDir,
    "ว2-201-ส่งเสริมการแข่งขันโครงงาน.pdf",
  );
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    outputPath,
    new Uint8Array(await createProjectDocumentPdf(document)),
  );

  console.log(
    JSON.stringify(
      {
        id: document.camp_project_document_id,
        outputPath,
        budgetTotal: document.budget_total,
        signatories: people.length,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
