"use client";

import type { ChangeEvent, ReactNode } from "react";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  FileCheck2,
  FileText,
  ImagePlus,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UnlockKeyhole,
} from "lucide-react";
import { useParams } from "next/navigation";

import CampBreadcrumb from "../../CampBreadcrumb";

import { useStatusModal } from "@/components/StatusModalProvider";
import { normalizeProjectSummaryStandards } from "@/lib/project-summary-standards";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#6b857a] focus:ring-2 focus:ring-[#6b857a]/15 disabled:bg-gray-100 disabled:text-gray-500";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {number ? number + ". " : ""}
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ListEditor({
  values,
  onChange,
  disabled,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  placeholder: string;
}) {
  const items = Array.isArray(values) ? values : [];

  return (
    <div className="space-y-2">
      {items.map((value, index) => (
        <div className="flex items-start gap-2" key={index}>
          <span className="mt-2.5 w-7 shrink-0 text-sm text-gray-500">
            {index + 1}.
          </span>
          <textarea
            className={inputClass + " min-h-16 resize-y"}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={(event) =>
              onChange(
                items.map((item, itemIndex) =>
                  itemIndex === index ? event.target.value : item,
                ),
              )
            }
          />
          <button
            aria-label="ลบรายการ"
            className="mt-1 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
            disabled={disabled}
            type="button"
            onClick={() =>
              onChange(items.filter((_, itemIndex) => itemIndex !== index))
            }
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#5d7c6f] hover:bg-[#f0f4f2] disabled:opacity-40"
        disabled={disabled}
        type="button"
        onClick={() => onChange([...items, ""])}
      >
        <Plus size={15} /> เพิ่มรายการ
      </button>
    </div>
  );
}

function RadioCard({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) {
  const selectedClass = checked
    ? " border-[#6b857a] bg-[#f2f7f5] text-[#4d685e]"
    : " border-gray-200 bg-white text-gray-700";

  return (
    <label
      className={
        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition" +
        selectedClass +
        (disabled ? " cursor-not-allowed opacity-60" : "")
      }
    >
      <input
        checked={checked}
        disabled={disabled}
        type="radio"
        onChange={onChange}
      />
      <span className="font-medium">{label}</span>
    </label>
  );
}

function cleanAiItems(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item || "").trim())
    .filter((item) => !/^[-–—\s]*$/.test(item))
    .slice(0, 50);
}

function cleanAiText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function attendanceIndicator(source: any) {
  const percentage = Number(source?.attendance?.percentage || 0);
  const hasAttendance = Number(source?.attendance?.enrolled || 0) > 0;

  return {
    indicator: "ร้อยละของผู้ลงทะเบียนที่เข้าร่วมโครงการ",
    target: "100",
    result: percentage.toFixed(2).replace(/\.00$/, ""),
    status: hasAttendance
      ? percentage >= 100
        ? "บรรลุเป้าหมาย"
        : "ต่ำกว่าเป้าหมาย"
      : "ยังไม่ประเมิน",
    valueType: "PERCENT",
    locked: true,
  };
}

function withAttendanceIndicator(source: any, rows: any[]) {
  const existingAttendance = (Array.isArray(rows) ? rows : []).find(
    (row, index) =>
      (index === 0 && row?.locked) ||
      row?.indicator === "ร้อยละของผู้ลงทะเบียนที่เข้าร่วมโครงการ",
  );
  const remaining = (Array.isArray(rows) ? rows : []).filter(
    (row, index) =>
      !(index === 0 && row?.locked) &&
      row?.indicator !== "ร้อยละของผู้ลงทะเบียนที่เข้าร่วมโครงการ",
  );
  const automaticAttendance = attendanceIndicator(source);
  const savedTarget = String(existingAttendance?.target || "").trim();
  const savedResult = String(existingAttendance?.result || "").trim();
  const target = savedTarget || automaticAttendance.target;
  const result = savedResult || automaticAttendance.result;
  const numericTarget = Number(target);
  const numericResult = Number(result);
  const status =
    Number.isFinite(numericTarget) && Number.isFinite(numericResult)
      ? numericResult >= numericTarget
        ? "บรรลุเป้าหมาย"
        : "ต่ำกว่าเป้าหมาย"
      : automaticAttendance.status;

  return [
    {
      ...automaticAttendance,
      indicator:
        String(existingAttendance?.indicator || "").trim() ||
        "ร้อยละของผู้ลงทะเบียนที่เข้าร่วมโครงการ",
      target,
      result,
      status,
    },
    ...remaining,
  ];
}

function StandardsEditor({
  values,
  onChange,
  disabled,
}: {
  values: any[];
  onChange: (values: any[]) => void;
  disabled?: boolean;
}) {
  const standards = Array.isArray(values) ? values : [];

  return (
    <div className="space-y-4">
      {standards.map((standard, standardIndex) => {
        const subItems = Array.isArray(standard.subItems)
          ? standard.subItems
          : [];
        const updateStandard = (value: any) =>
          onChange(
            standards.map((item, index) =>
              index === standardIndex ? { ...item, ...value } : item,
            ),
          );

        return (
          <div
            className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            key={standardIndex}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <strong className="text-sm text-gray-700">
                มาตรฐานที่ {standardIndex + 1}
              </strong>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-[#4d685e]">
                  <input
                    checked={Boolean(standard.achieved)}
                    className="h-4 w-4 accent-[#5d7c6f]"
                    disabled={disabled}
                    type="checkbox"
                    onChange={(event) =>
                      updateStandard({ achieved: event.target.checked })
                    }
                  />
                  ทำได้แล้ว
                </label>
                <button
                  aria-label="ลบมาตรฐาน"
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                  disabled={disabled}
                  type="button"
                  onClick={() =>
                    onChange(
                      standards.filter((_, index) => index !== standardIndex),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
              <Field label="ชื่อมาตรฐาน">
                <input
                  className={inputClass}
                  disabled={disabled}
                  placeholder="เช่น มาตรฐานที่ 1 คุณภาพผู้เรียน"
                  value={standard.title || ""}
                  onChange={(event) =>
                    updateStandard({ title: event.target.value })
                  }
                />
              </Field>
              <Field label="รายการที่เกี่ยวข้อง">
                <input
                  className={inputClass}
                  disabled={disabled}
                  placeholder="เช่น 3"
                  value={standard.relatedItems || ""}
                  onChange={(event) =>
                    updateStandard({ relatedItems: event.target.value })
                  }
                />
              </Field>
            </div>
            <div className="mt-4 space-y-3 border-l-2 border-[#cad8d2] pl-4">
              {!subItems.length && (
                <p className="text-sm text-gray-500">
                  หากมาตรฐานนี้ไม่มีข้อย่อย ไม่ต้องเพิ่มรายการด้านล่าง
                </p>
              )}
              {subItems.map((subItem: any, subIndex: number) => (
                <div
                  className="grid gap-3 rounded-xl border border-gray-200 bg-white p-3 md:grid-cols-[110px_1fr_180px_110px_auto]"
                  key={subIndex}
                >
                  <Field label="ข้อย่อย">
                    <input
                      className={inputClass}
                      disabled={disabled}
                      placeholder="1.1"
                      value={subItem.code || ""}
                      onChange={(event) =>
                        updateStandard({
                          subItems: subItems.map((item: any, index: number) =>
                            index === subIndex
                              ? { ...item, code: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="รายละเอียดข้อย่อย">
                    <input
                      className={inputClass}
                      disabled={disabled}
                      placeholder="เช่น ผลสัมฤทธิ์ทางวิชาการของผู้เรียน"
                      value={subItem.title || ""}
                      onChange={(event) =>
                        updateStandard({
                          subItems: subItems.map((item: any, index: number) =>
                            index === subIndex
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="รายการที่เกี่ยวข้อง">
                    <input
                      className={inputClass}
                      disabled={disabled}
                      placeholder="เช่น 1, 2"
                      value={subItem.relatedItems || ""}
                      onChange={(event) =>
                        updateStandard({
                          subItems: subItems.map((item: any, index: number) =>
                            index === subIndex
                              ? { ...item, relatedItems: event.target.value }
                              : item,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="สถานะ">
                    <label className="flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-[#4d685e]">
                      <input
                        checked={Boolean(subItem.achieved)}
                        className="h-4 w-4 accent-[#5d7c6f]"
                        disabled={disabled}
                        type="checkbox"
                        onChange={(event) =>
                          updateStandard({
                            subItems: subItems.map(
                              (item: any, index: number) =>
                                index === subIndex
                                  ? {
                                      ...item,
                                      achieved: event.target.checked,
                                    }
                                  : item,
                            ),
                          })
                        }
                      />
                      ทำได้แล้ว
                    </label>
                  </Field>
                  <button
                    aria-label="ลบข้อย่อย"
                    className="mt-7 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                    disabled={disabled}
                    type="button"
                    onClick={() =>
                      updateStandard({
                        subItems: subItems.filter(
                          (_: any, index: number) => index !== subIndex,
                        ),
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#5d7c6f] hover:bg-[#f0f4f2] disabled:opacity-40"
                disabled={disabled}
                type="button"
                onClick={() =>
                  updateStandard({
                    subItems: [
                      ...subItems,
                      {
                        code: "",
                        title: "",
                        relatedItems: "",
                        achieved: false,
                      },
                    ],
                  })
                }
              >
                <Plus size={15} /> เพิ่มข้อย่อย
              </button>
            </div>
          </div>
        );
      })}
      <button
        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#5d7c6f] hover:bg-[#f0f4f2] disabled:opacity-40"
        disabled={disabled}
        type="button"
        onClick={() =>
          onChange([
            ...standards,
            {
              title: "",
              relatedItems: "",
              achieved: false,
              subItems: [],
            },
          ])
        }
      >
        <Plus size={15} /> เพิ่มมาตรฐาน
      </button>
    </div>
  );
}

function formatMoney(value: unknown) {
  return Number(value || 0).toLocaleString("th-TH", {
    maximumFractionDigits: 2,
  });
}

export default function ProjectSummaryDocumentPage() {
  const params = useParams();
  const campId = String(params.id);
  const { showError, showSuccess, showConfirm, setIsLoading } =
    useStatusModal();
  const [document, setDocument] = useState<any>(null);
  const [sourceData, setSourceData] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [loading, setLoading] = useState(true);
  const [photoCaption, setPhotoCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadTemplates = async () => {
    const response = await fetch("/api/project-summary-document-templates");
    if (!response.ok) return [];
    const data = await response.json();
    const items = Array.isArray(data) ? data : [];

    setTemplates(items);

    return items;
  };

  const requestAiSummary = async () => {
    const response = await fetch("/api/surveys/ai-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "สรุปผลแบบสอบถามด้วย AI ไม่สำเร็จ");
    }

    return {
      strengths: cleanAiItems(data.strengths),
      improvements: cleanAiItems(data.improvements),
      recommendations: cleanAiItems(data.recommendations),
      continuationReason: cleanAiText(data.continuationReason),
    };
  };

  const load = async () => {
    const [summaryResponse, peopleResponse, templateResponse] =
      await Promise.all([
        fetch("/api/camps/" + campId + "/project-summary-document"),
        fetch("/api/document-personnel"),
        fetch("/api/project-summary-document-templates"),
      ]);
    const summaryData = await summaryResponse.json();
    if (!summaryResponse.ok) {
      throw new Error(summaryData.error || "โหลดเอกสารสรุปไม่สำเร็จ");
    }

    let nextDocument = summaryData.document;
    if (
      !nextDocument.camp_project_summary_document_id ||
      !nextDocument.top_strengths?.length ||
      !nextDocument.suggestions?.length ||
      !nextDocument.recommendations ||
      !nextDocument.continuation_reason
    ) {
      try {
        const aiSummary = await requestAiSummary();
        nextDocument = {
          ...nextDocument,
          top_strengths: nextDocument.top_strengths?.length
            ? nextDocument.top_strengths
            : aiSummary.strengths,
          suggestions: nextDocument.camp_project_summary_document_id
            ? nextDocument.suggestions?.length
              ? nextDocument.suggestions
              : aiSummary.improvements
            : aiSummary.improvements,
          recommendations:
            nextDocument.recommendations ||
            (aiSummary.recommendations.length
              ? aiSummary.recommendations
              : aiSummary.improvements
            ).join("\n"),
          continuation_reason:
            nextDocument.continuation_reason || aiSummary.continuationReason,
        };
      } catch {
        // AI is optional; the report form must remain usable without it.
      }
    }

    setDocument(nextDocument);
    setSourceData(summaryData.sourceData);
    setPhotos(Array.isArray(summaryData.photos) ? summaryData.photos : []);
    setPeople(peopleResponse.ok ? await peopleResponse.json() : []);
    setTemplates(templateResponse.ok ? await templateResponse.json() : []);
  };

  useEffect(() => {
    load()
      .catch((error) => showError("ข้อผิดพลาด", error.message))
      .finally(() => setLoading(false));
  }, [campId]);

  const update = (key: string, value: any) =>
    setDocument((current: any) => ({ ...current, [key]: value }));

  const applyTemplate = () => {
    const template = templates.find(
      (item) =>
        item.project_summary_document_template_id ===
        Number(selectedTemplateId),
    );

    if (!template) {
      showError("ยังไม่ได้เลือกเท็มเพลต", "กรุณาเลือกเท็มเพลตที่ต้องการใช้");

      return;
    }

    const data = JSON.parse(JSON.stringify(template.template_data || {}));

    data.standard_alignments = normalizeProjectSummaryStandards(
      data.standard_alignments,
    );

    const preserveResultValues = (templateRows: any[], currentRows: any[]) =>
      (Array.isArray(templateRows) ? templateRows : []).map(
        (row: any, index: number) => ({
          ...row,
          result: currentRows?.[index]?.result || "",
          status: currentRows?.[index]?.status || "ยังไม่ประเมิน",
        }),
      );
    const preserveEvaluationValues = (
      templateRows: any[],
      currentRows: any[],
    ) =>
      (Array.isArray(templateRows) ? templateRows : []).map((row: any) => {
        const current = (currentRows || []).find(
          (item: any) => item.topic === row.topic,
        );

        return current
          ? {
              ...row,
              average: current.average,
              sd: current.sd,
              interpretation: current.interpretation,
            }
          : row;
      });

    setDocument((current: any) => ({
      ...current,
      ...data,
      quantitative_results: preserveResultValues(
        data.quantitative_results,
        current.quantitative_results,
      ),
      qualitative_results: preserveResultValues(
        data.qualitative_results,
        current.qualitative_results,
      ),
      success_indicators: preserveResultValues(
        data.success_indicators,
        current.success_indicators,
      ),
      evaluation_results: preserveEvaluationValues(
        data.evaluation_results,
        current.evaluation_results,
      ),
      status: "DRAFT",
    }));
    showSuccess(
      "ใช้เท็มเพลตแล้ว",
      "เติมข้อมูลที่นำกลับมาใช้ได้ โดยคงข้อมูลเฉพาะและผลจริงของค่ายนี้ไว้",
    );
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      showError("ยังไม่ได้ตั้งชื่อ", "กรุณาระบุชื่อเท็มเพลต");

      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/project-summary-document-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          template_data: document,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "บันทึกเท็มเพลตไม่สำเร็จ");
      }

      await loadTemplates();
      setSelectedTemplateId(String(data.project_summary_document_template_id));
      showSuccess(
        "บันทึกเท็มเพลตแล้ว",
        "ครั้งต่อไปสามารถเลือกเท็มเพลตนี้จากหน้าเอกสารสรุปได้ทันที",
      );
    } catch (error: any) {
      showError("บันทึกไม่สำเร็จ", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = () => {
    const template = templates.find(
      (item) =>
        item.project_summary_document_template_id ===
        Number(selectedTemplateId),
    );

    if (!template) {
      showError("ยังไม่ได้เลือกเท็มเพลต", "กรุณาเลือกเท็มเพลตที่ต้องการลบ");

      return;
    }

    showConfirm(
      "ลบเท็มเพลต",
      `ต้องการลบเท็มเพลต “${template.name}” ใช่หรือไม่`,
      async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/project-summary-document-templates/${template.project_summary_document_template_id}`,
            { method: "DELETE" },
          );
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "ลบเท็มเพลตไม่สำเร็จ");
          }

          setSelectedTemplateId("");
          setTemplateName("");
          await loadTemplates();
          showSuccess("ลบแล้ว", "ลบเท็มเพลตเรียบร้อยแล้ว");
        } catch (error: any) {
          showError("ลบไม่สำเร็จ", error.message);
        } finally {
          setIsLoading(false);
        }
      },
      "ลบเท็มเพลต",
    );
  };

  const updateRow = (key: string, index: number, value: any) =>
    update(
      key,
      document[key].map((row: any, rowIndex: number) =>
        rowIndex === index ? { ...row, ...value } : row,
      ),
    );

  const updateIndicatorValue = (
    index: number,
    row: any,
    key: string,
    value: string,
  ) => {
    const nextValue: any = { [key]: value };

    if (row.locked && (key === "target" || key === "result")) {
      const targetValue = key === "target" ? value : row.target;
      const resultValue = key === "result" ? value : row.result;
      const numericTarget = Number(targetValue);
      const numericResult = Number(resultValue);

      nextValue.status =
        targetValue !== "" &&
        resultValue !== "" &&
        Number.isFinite(numericTarget) &&
        Number.isFinite(numericResult)
          ? numericResult >= numericTarget
            ? "บรรลุเป้าหมาย"
            : "ต่ำกว่าเป้าหมาย"
          : "ยังไม่ประเมิน";
    }

    updateRow("success_indicators", index, nextValue);
  };

  const updateTargetList = (key: string, values: string[]) => {
    const current = Array.isArray(document[key]) ? document[key] : [];
    update(
      key,
      values.map((value, index) => ({
        ...(current[index] || {}),
        indicator: value,
        target: current[index]?.target || value,
        result: current[index]?.result || "",
        status: current[index]?.status || "ยังไม่ประเมิน",
      })),
    );
  };

  const readOnly = document?.status === "FINALIZED";

  const save = async (nextStatus = document?.status || "DRAFT") => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/camps/" + campId + "/project-summary-document",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...document, status: nextStatus }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "บันทึกเอกสารไม่สำเร็จ");
      }
      setDocument(data.document);
      showSuccess(
        nextStatus === "FINALIZED" ? "ยืนยันเอกสารแล้ว" : "บันทึกแล้ว",
        "บันทึกข้อมูลรายงานการดำเนินโครงการเรียบร้อยแล้ว",
      );

      return true;
    } catch (error: any) {
      showError("บันทึกไม่สำเร็จ", error.message);

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFromSystem = async () => {
    setIsLoading(true);
    try {
      const [response, aiSummary] = await Promise.all([
        fetch("/api/camps/" + campId + "/project-summary-document"),
        requestAiSummary().catch(() => ({
          strengths: [] as string[],
          improvements: [] as string[],
          recommendations: [] as string[],
          continuationReason: "",
        })),
      ]);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "โหลดข้อมูลล่าสุดไม่สำเร็จ");
      }

      const source = data.sourceData;
      const proposal = source.proposal || {};
      const currentIndicators = (document.success_indicators || []).filter(
        (row: any) => !row.locked,
      );
      const quantitative = Array.isArray(proposal.quantitative_targets)
        ? proposal.quantitative_targets.map((item: string, index: number) => ({
            indicator: item,
            target: item,
            result: currentIndicators[index]?.result || "",
            status: currentIndicators[index]?.status || "ยังไม่ประเมิน",
          }))
        : document.quantitative_results;
      const qualitative = Array.isArray(proposal.qualitative_targets)
        ? proposal.qualitative_targets.map((item: string, index: number) => ({
            indicator: item,
            target: item,
            result:
              currentIndicators[quantitative.length + index]?.result || "",
            status:
              currentIndicators[quantitative.length + index]?.status ||
              "ยังไม่ประเมิน",
          }))
        : document.qualitative_results;
      const evaluations = source.survey?.evaluationResults?.length
        ? source.survey.evaluationResults
        : document.evaluation_results;
      setSourceData(source);
      setDocument((current: any) => ({
        ...current,
        objectives: Array.isArray(proposal.objectives)
          ? proposal.objectives
          : current.objectives,
        budget_received: Number(
          proposal.budget_total || current.budget_received || 0,
        ),
        quantitative_results: quantitative,
        qualitative_results: qualitative,
        success_indicators: withAttendanceIndicator(source, [
          document.success_indicators?.[0],
          ...quantitative,
          ...qualitative,
        ]),
        evaluation_results: evaluations,
        overall_average:
          source.survey?.overallAverage ?? current.overall_average,
        overall_sd: source.survey?.overallSd ?? current.overall_sd,
        top_strengths: aiSummary.strengths.length
          ? aiSummary.strengths
          : current.top_strengths,
        suggestions: aiSummary.improvements.length
          ? aiSummary.improvements
          : current.suggestions,
        recommendations:
          (aiSummary.recommendations.length
            ? aiSummary.recommendations
            : aiSummary.improvements
          ).join("\n") || current.recommendations,
        continuation_reason:
          aiSummary.continuationReason || current.continuation_reason,
        status: "DRAFT",
      }));
      showSuccess(
        "ดึงข้อมูลแล้ว",
        "เติมวัตถุประสงค์ ตัวชี้วัด เช็กชื่อ ผลแบบสอบถาม และคำตอบปลายเปิดแล้ว",
      );
    } catch (error: any) {
      showError("ดึงข้อมูลไม่สำเร็จ", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const download = async () => {
    if (!readOnly && !(await save(document.status || "DRAFT"))) return;
    window.location.href =
      "/api/camps/" + campId + "/project-summary-document/pdf";
  };

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", photoCaption);
      const response = await fetch(
        "/api/camps/" + campId + "/project-summary-document/photos",
        { method: "POST", body: formData },
      );
      const photo = await response.json();
      if (!response.ok) {
        throw new Error(photo.error || "อัปโหลดรูปไม่สำเร็จ");
      }
      setPhotos((current) => [...current, photo]);
      setPhotoCaption("");
    } catch (error: any) {
      showError("อัปโหลดไม่สำเร็จ", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePhoto = async (photoId: number) => {
    if (!window.confirm("ต้องการลบรูปภาพนี้หรือไม่")) return;
    const response = await fetch(
      "/api/camps/" + campId + "/project-summary-document/photos/" + photoId,
      { method: "DELETE" },
    );
    if (!response.ok) {
      showError("ลบไม่สำเร็จ", "ไม่สามารถลบรูปภาพได้");

      return;
    }
    setPhotos((current) =>
      current.filter(
        (photo) => photo.camp_project_summary_photo_id !== photoId,
      ),
    );
  };

  if (loading || !document) {
    return (
      <div className="min-h-screen bg-[#f5f5f2] p-8">
        <div className="mx-auto h-64 max-w-5xl animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  const assessment = document.operation_assessment || {};

  return (
    <div className="min-h-screen bg-[#f5f5f2] pb-24">
      <main className="mx-auto max-w-5xl space-y-5 px-4 pb-24 pt-8">
        <CampBreadcrumb campId={campId} currentPage="เอกสารสรุปโครงการ" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <FileText className="mt-1 text-[#6b857a]" size={23} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                แบบกรอกรายงานการดำเนินโครงการ
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                กรอกตามหัวข้อ 1-12 ของเอกสารสรุปโครงการ
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {readOnly ? (
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700"
                type="button"
                onClick={() => update("status", "DRAFT")}
              >
                <UnlockKeyhole size={16} /> แก้ไขฉบับสมบูรณ์
              </button>
            ) : (
              <>
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                  type="button"
                  onClick={() => save("DRAFT")}
                >
                  <Save size={16} /> บันทึกแบบร่าง
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-[#5d7c6f] bg-white px-4 py-2 text-sm font-medium text-[#5d7c6f]"
                  type="button"
                  onClick={() => save("FINALIZED")}
                >
                  <FileCheck2 size={16} /> ยืนยันฉบับสมบูรณ์
                </button>
              </>
            )}
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-[#5d7c6f] px-4 py-2 text-sm font-medium text-white"
              type="button"
              onClick={download}
            >
              <Download size={16} /> บันทึกและดาวน์โหลด PDF
            </button>
          </div>
        </div>

        <section className="flex flex-col gap-4 rounded-2xl border border-[#cad8d2] bg-[#f2f7f5] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-gray-900">เติมข้อมูลจากระบบ</p>
            <p className="mt-1 text-sm text-gray-600">
              ดึงข้อมูลโครงการ วัตถุประสงค์ ตัวชี้วัด เช็กชื่อ
              และผลแบบสอบถามมาใส่ในแบบสรุป
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5d7c6f] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            disabled={readOnly}
            type="button"
            onClick={refreshFromSystem}
          >
            <RefreshCw size={16} /> ดึงข้อมูลล่าสุด
          </button>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="font-semibold text-gray-900">เท็มเพลตเอกสารสรุป</p>
            <p className="mt-1 text-sm text-gray-500">
              บันทึกโครงสร้างที่ใช้ซ้ำ เช่น มาตรฐาน วัตถุประสงค์ ตัวชี้วัด
              แบบประเมิน และผู้ลงนาม โดยไม่คัดลอกผลจริงของค่ายเดิม
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-[2fr_auto_2fr_auto]">
            <select
              className={inputClass}
              disabled={readOnly}
              value={selectedTemplateId}
              onChange={(event) => {
                setSelectedTemplateId(event.target.value);
                const selected = templates.find(
                  (item) =>
                    item.project_summary_document_template_id ===
                    Number(event.target.value),
                );

                if (selected) setTemplateName(selected.name);
              }}
            >
              <option value="">เลือกเท็มเพลตที่บันทึกไว้</option>
              {templates.map((template) => (
                <option
                  key={template.project_summary_document_template_id}
                  value={template.project_summary_document_template_id}
                >
                  {template.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                className="rounded-xl bg-[#5d7c6f] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                disabled={readOnly}
                type="button"
                onClick={applyTemplate}
              >
                ใช้เท็มเพลต
              </button>
              <button
                aria-label="ลบเท็มเพลต"
                className="rounded-xl border border-red-200 px-3 text-red-500 hover:bg-red-50 disabled:opacity-40"
                disabled={readOnly}
                type="button"
                onClick={deleteTemplate}
              >
                <Trash2 size={17} />
              </button>
            </div>
            <input
              className={inputClass}
              disabled={readOnly}
              placeholder="ตั้งชื่อเท็มเพลต เช่น สรุปโครงการวิทยาศาสตร์"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
            />
            <button
              className="rounded-xl border border-[#5d7c6f] bg-white px-4 py-2 text-sm font-medium text-[#5d7c6f] hover:bg-[#edf4f1] disabled:opacity-40"
              disabled={readOnly}
              type="button"
              onClick={saveTemplate}
            >
              บันทึกข้อมูลปัจจุบันเป็นเท็มเพลต
            </button>
          </div>
          {templates.length === 0 ? (
            <p className="mt-3 text-xs text-gray-500">
              ยังไม่มีเท็มเพลต กรอกข้อมูลที่ต้องการใช้ซ้ำแล้วตั้งชื่อเพื่อบันทึก
            </p>
          ) : null}
        </section>

        <Section number="1" title="ชื่อโครงการ">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="ปีงบประมาณ (พ.ศ.)">
              <input
                className={inputClass}
                disabled={readOnly}
                type="number"
                value={document.fiscal_year}
                onChange={(event) =>
                  update("fiscal_year", Number(event.target.value))
                }
              />
            </Field>
            <Field label="กลุ่มสาระการเรียนรู้/กลุ่มงาน">
              <input
                className={inputClass}
                disabled={readOnly}
                value={document.department || ""}
                onChange={(event) => update("department", event.target.value)}
              />
            </Field>
            <Field label="ชื่อโครงการ">
              <input
                className={inputClass}
                disabled={readOnly}
                value={document.project_name}
                onChange={(event) => update("project_name", event.target.value)}
              />
            </Field>
            <Field label="กิจกรรม">
              <input
                className={inputClass}
                disabled={readOnly}
                value={document.activity_name || ""}
                onChange={(event) =>
                  update("activity_name", event.target.value)
                }
              />
            </Field>
            <Field label="ลำดับกิจกรรมที่">
              <input
                className={inputClass}
                disabled={readOnly}
                value={document.activity_order || ""}
                onChange={(event) =>
                  update("activity_order", event.target.value)
                }
              />
            </Field>
            <Field label="รหัสโครงการ/กิจกรรม (ถ้ามี)">
              <input
                className={inputClass}
                disabled={readOnly}
                value={document.project_code || ""}
                onChange={(event) => update("project_code", event.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section number="2" title="ลักษณะโครงการ">
          <p className="mb-3 text-sm text-gray-500">
            เลือกได้เพียงหนึ่งลักษณะโครงการ
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["NEW", "ใหม่"],
              ["CONTINUING", "ต่อเนื่อง"],
              ["IN_EVALUATION_PLAN", "อยู่ในแผนประเมิน"],
              ["OUTSIDE_ACTION_PLAN", "นอกแผนปฏิบัติการ"],
            ].map(([value, label]) => (
              <RadioCard
                key={value}
                checked={document.project_nature === value}
                disabled={readOnly}
                label={label}
                onChange={() => update("project_nature", value)}
              />
            ))}
          </div>
        </Section>

        <Section number="3" title="ผู้รับผิดชอบ">
          <textarea
            className={inputClass + " min-h-24 resize-y"}
            disabled={readOnly}
            placeholder="ระบุชื่อผู้รับผิดชอบโครงการ"
            value={document.responsible_people || ""}
            onChange={(event) =>
              update("responsible_people", event.target.value)
            }
          />
        </Section>

        <Section number="4" title="สอดคล้องกับมาตรฐานการศึกษา">
          <StandardsEditor
            disabled={readOnly}
            values={document.standard_alignments || []}
            onChange={(values) => update("standard_alignments", values)}
          />
        </Section>

        <Section number="5" title="วัตถุประสงค์ของโครงการ">
          <ListEditor
            disabled={readOnly}
            placeholder="ระบุวัตถุประสงค์ของโครงการ"
            values={document.objectives || []}
            onChange={(values) => update("objectives", values)}
          />
        </Section>

        <Section number="6" title="การดำเนินการ">
          <div className="grid gap-2 md:grid-cols-3">
            {[
              ["COMPLETED", "ดำเนินการเสร็จสิ้น"],
              ["IN_PROGRESS", "อยู่ระหว่างการดำเนินการ"],
              ["NOT_STARTED", "ยังไม่ดำเนินการ"],
            ].map(([value, label]) => (
              <RadioCard
                key={value}
                checked={document.execution_status === value}
                disabled={readOnly}
                label={label}
                onChange={() => update("execution_status", value)}
              />
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["ผู้ลงทะเบียน", sourceData?.attendance?.enrolled ?? "-", "คน"],
              ["เช็กชื่อจริง", sourceData?.attendance?.checkedIn ?? "-", "คน"],
              ["อัตราเข้าร่วม", sourceData?.attendance?.percentage ?? 0, "%"],
            ].map(([label, value, suffix]) => (
              <div className="rounded-xl bg-[#f2f7f5] p-4" key={label}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-[#5d7c6f]">
                  {value} {suffix}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section number="7" title="ระยะเวลาในการดำเนินการ">
          <input
            className={inputClass}
            disabled={readOnly}
            placeholder="เช่น ระหว่างวันที่ 20 กุมภาพันธ์ 2569 ถึง 21 กุมภาพันธ์ 2569"
            value={document.duration_text || ""}
            onChange={(event) => update("duration_text", event.target.value)}
          />
        </Section>

        <Section number="8" title="สถานที่ดำเนินงาน">
          <input
            className={inputClass}
            disabled={readOnly}
            placeholder="ระบุสถานที่ดำเนินงาน"
            value={document.location_text || ""}
            onChange={(event) => update("location_text", event.target.value)}
          />
        </Section>

        <Section number="9" title="ตัวชี้วัดความสำเร็จของโครงการ">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold text-gray-800">เชิงปริมาณ</h3>
              <ListEditor
                disabled={readOnly}
                placeholder="ระบุตัวชี้วัดเชิงปริมาณ"
                values={(document.quantitative_results || []).map(
                  (row: any) => row.indicator || row.target || "",
                )}
                onChange={(values) =>
                  updateTargetList("quantitative_results", values)
                }
              />
            </div>
            <div>
              <h3 className="mb-3 font-semibold text-gray-800">เชิงคุณภาพ</h3>
              <ListEditor
                disabled={readOnly}
                placeholder="ระบุตัวชี้วัดเชิงคุณภาพ"
                values={(document.qualitative_results || []).map(
                  (row: any) => row.indicator || row.target || "",
                )}
                onChange={(values) =>
                  updateTargetList("qualitative_results", values)
                }
              />
            </div>
          </div>
        </Section>

        <Section number="10" title="งบประมาณโครงการ">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="งบประมาณที่ได้รับ (บาท)">
              <input
                className={inputClass}
                disabled={readOnly}
                min="0"
                type="number"
                value={document.budget_received}
                onChange={(event) =>
                  update("budget_received", Number(event.target.value))
                }
              />
            </Field>
            <Field label="งบประมาณที่ใช้ไปทั้งหมด (บาท)">
              <input
                className={inputClass}
                disabled={readOnly}
                min="0"
                type="number"
                value={document.budget_spent}
                onChange={(event) =>
                  update("budget_spent", Number(event.target.value))
                }
              />
            </Field>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              คงเหลือ{" "}
              <strong className="float-right">
                {formatMoney(
                  Math.max(
                    0,
                    Number(document.budget_received || 0) -
                      Number(document.budget_spent || 0),
                  ),
                )}{" "}
                บาท
              </strong>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              ใช้เกิน{" "}
              <strong className="float-right">
                {formatMoney(
                  Math.max(
                    0,
                    Number(document.budget_spent || 0) -
                      Number(document.budget_received || 0),
                  ),
                )}{" "}
                บาท
              </strong>
            </div>
          </div>
        </Section>

        <Section number="11" title="ผลการประเมินตัวชี้วัดความสำเร็จของโครงการ">
          <div className="space-y-4">
            {(document.success_indicators || []).map(
              (row: any, index: number) => (
                <div
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  key={index}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-gray-700">
                        ตัวชี้วัดที่ {index + 1}
                      </strong>
                      {row.locked ? (
                        <span className="rounded-full bg-[#e3eee9] px-2 py-1 text-xs font-medium text-[#4d685e]">
                          ค่าเริ่มต้นจากข้อมูลเช็กชื่อ
                        </span>
                      ) : null}
                    </div>
                    {!row.locked ? (
                      <button
                        className="text-gray-400 hover:text-red-500"
                        disabled={readOnly}
                        type="button"
                        onClick={() =>
                          update(
                            "success_indicators",
                            document.success_indicators.filter(
                              (_: any, itemIndex: number) =>
                                itemIndex !== index,
                            ),
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="ตัวชี้วัดความสำเร็จ">
                      <textarea
                        className={inputClass + " min-h-20 resize-y"}
                        disabled={readOnly}
                        value={row.indicator || ""}
                        onChange={(event) =>
                          updateRow("success_indicators", index, {
                            indicator: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="รูปแบบค่าเป้าหมายและผล">
                      <select
                        className={inputClass}
                        disabled={readOnly || row.locked}
                        value={row.valueType || "TEXT"}
                        onChange={(event) =>
                          updateRow("success_indicators", index, {
                            valueType: event.target.value,
                            target: "",
                            result: "",
                          })
                        }
                      >
                        <option value="TEXT">ข้อความ</option>
                        <option value="PERCENT">ร้อยละ</option>
                      </select>
                    </Field>
                    {[
                      ["target", "เป้าหมาย"],
                      ["result", "ผลการดำเนินงาน"],
                    ].map(([key, label]) => (
                      <Field key={key} label={label}>
                        <div className="relative">
                          {row.valueType === "PERCENT" ? (
                            <input
                              className={inputClass + " pr-16"}
                              disabled={readOnly}
                              max="100"
                              min="0"
                              step="0.01"
                              type="number"
                              value={row[key] || ""}
                              onChange={(event) =>
                                updateIndicatorValue(
                                  index,
                                  row,
                                  key,
                                  event.target.value,
                                )
                              }
                            />
                          ) : (
                            <textarea
                              className={inputClass + " min-h-20 resize-y"}
                              disabled={readOnly}
                              value={row[key] || ""}
                              onChange={(event) =>
                                updateIndicatorValue(
                                  index,
                                  row,
                                  key,
                                  event.target.value,
                                )
                              }
                            />
                          )}
                          {row.valueType === "PERCENT" ? (
                            <span className="pointer-events-none absolute right-3 top-2.5 text-sm text-gray-500">
                              ร้อยละ
                            </span>
                          ) : null}
                        </div>
                      </Field>
                    ))}
                    <Field label="บรรลุเป้าหมาย">
                      <select
                        className={inputClass}
                        disabled={readOnly || row.locked}
                        value={row.status || "ยังไม่ประเมิน"}
                        onChange={(event) =>
                          updateRow("success_indicators", index, {
                            status: event.target.value,
                          })
                        }
                      >
                        <option>บรรลุเป้าหมาย</option>
                        <option>สูงกว่าเป้าหมาย</option>
                        <option>เท่ากับเป้าหมาย</option>
                        <option>ต่ำกว่าเป้าหมาย</option>
                        <option>ยังไม่ประเมิน</option>
                      </select>
                    </Field>
                  </div>
                </div>
              ),
            )}
          </div>
          <button
            className="mt-3 inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#5d7c6f]"
            disabled={readOnly}
            type="button"
            onClick={() =>
              update("success_indicators", [
                ...(document.success_indicators || []),
                {
                  indicator: "",
                  target: "",
                  result: "",
                  status: "ยังไม่ประเมิน",
                  valueType: "TEXT",
                  locked: false,
                },
              ])
            }
          >
            <Plus size={15} /> เพิ่มตัวชี้วัด
          </button>
        </Section>

        <Section number="12" title="การประเมินโครงการ">
          <Field label="ข้อความเกริ่นสรุปผลการประเมิน">
            <textarea
              className={inputClass + " min-h-24 resize-y"}
              disabled={readOnly}
              value={document.evaluation_summary || ""}
              onChange={(event) =>
                update("evaluation_summary", event.target.value)
              }
            />
          </Field>
          <div className="mt-5 space-y-3">
            {(document.evaluation_results || []).map(
              (row: any, index: number) => (
                <div
                  className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1fr_110px_110px_140px_auto]"
                  key={index}
                >
                  <Field label="รายการประเมิน">
                    <textarea
                      className={inputClass + " min-h-16 resize-y"}
                      disabled={readOnly}
                      value={row.topic || ""}
                      onChange={(event) =>
                        updateRow("evaluation_results", index, {
                          topic: event.target.value,
                        })
                      }
                    />
                  </Field>
                  <Field label="ค่าเฉลี่ย">
                    <input
                      className={inputClass}
                      disabled={readOnly}
                      max="5"
                      min="0"
                      step="0.01"
                      type="number"
                      value={row.average ?? ""}
                      onChange={(event) =>
                        updateRow("evaluation_results", index, {
                          average:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="S.D.">
                    <input
                      className={inputClass}
                      disabled={readOnly}
                      max="5"
                      min="0"
                      step="0.001"
                      type="number"
                      value={row.sd ?? ""}
                      onChange={(event) =>
                        updateRow("evaluation_results", index, {
                          sd:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="แปลผล">
                    <input
                      className={inputClass}
                      disabled={readOnly}
                      value={row.interpretation || ""}
                      onChange={(event) =>
                        updateRow("evaluation_results", index, {
                          interpretation: event.target.value,
                        })
                      }
                    />
                  </Field>
                  <button
                    className="mt-7 text-gray-400 hover:text-red-500"
                    disabled={readOnly}
                    type="button"
                    onClick={() =>
                      update(
                        "evaluation_results",
                        document.evaluation_results.filter(
                          (_: any, itemIndex: number) => itemIndex !== index,
                        ),
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            )}
          </div>
          <button
            className="mt-3 inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#5d7c6f]"
            disabled={readOnly}
            type="button"
            onClick={() =>
              update("evaluation_results", [
                ...(document.evaluation_results || []),
                { topic: "", average: null, sd: null, interpretation: "" },
              ])
            }
          >
            <Plus size={15} /> เพิ่มรายการประเมิน
          </button>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="ค่าเฉลี่ยรวม">
              <input
                className={inputClass}
                disabled={readOnly}
                max="5"
                min="0"
                step="0.01"
                type="number"
                value={document.overall_average ?? ""}
                onChange={(event) =>
                  update(
                    "overall_average",
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  )
                }
              />
            </Field>
            <Field label="S.D. รวม">
              <input
                className={inputClass}
                disabled={readOnly}
                max="5"
                min="0"
                step="0.001"
                type="number"
                value={document.overall_sd ?? ""}
                onChange={(event) =>
                  update(
                    "overall_sd",
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  )
                }
              />
            </Field>
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold text-gray-800">
                ประเด็นที่มีความพึงพอใจสูงสุด
              </h3>
              <ListEditor
                disabled={readOnly}
                placeholder="เช่น กิจกรรมพิธีเปิด ค่าเฉลี่ย 4.77"
                values={document.top_strengths || []}
                onChange={(values) => update("top_strengths", values)}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                ข้อเสนอแนะ / สิ่งที่อยากให้มีเพิ่มเติม
              </h3>
              <ListEditor
                disabled={readOnly}
                placeholder="ข้อเสนอแนะที่ AI สรุปจากแบบสอบถาม"
                values={document.suggestions || []}
                onChange={(values) => update("suggestions", values)}
              />
            </div>
          </div>
        </Section>

        <Section
          title="แบบประเมินผลการดำเนินงานตามกิจกรรม"
          description="ข้อ 11-12 เติมจากผลวิเคราะห์ AI ที่มีอยู่โดยอัตโนมัติ และสามารถแก้ไขข้อความได้"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="1. การดำเนินงาน">
              <select
                className={inputClass}
                disabled={readOnly}
                value={document.execution_status}
                onChange={(event) =>
                  update("execution_status", event.target.value)
                }
              >
                <option value="COMPLETED">ดำเนินการเสร็จสิ้น</option>
                <option value="IN_PROGRESS">อยู่ระหว่างดำเนินการ</option>
                <option value="NOT_STARTED">ยังไม่ดำเนินการ</option>
              </select>
            </Field>
            {[
              [
                "quantitativeStatus",
                "2. เปรียบเทียบเป้าหมายด้านปริมาณ",
                ["สูงกว่าเป้าหมาย", "เท่ากับเป้าหมาย", "ต่ำกว่าเป้าหมาย"],
              ],
              [
                "qualitativeStatus",
                "3. เปรียบเทียบเป้าหมายด้านคุณภาพ",
                ["สูงกว่าเป้าหมาย", "เท่ากับเป้าหมาย", "ต่ำกว่าเป้าหมาย"],
              ],
              [
                "personnel",
                "4. จำนวนบุคลากรหรือผู้ดำเนินการ",
                ["มากเกินไป", "เหมาะสมดี", "ยังต้องปรับปรุง"],
              ],
              [
                "cooperation",
                "5. ความร่วมมือของผู้ร่วมงาน",
                [
                  "ได้รับความร่วมมือดีมาก",
                  "ได้รับความร่วมมือปานกลาง",
                  "ได้รับความร่วมมือน้อยมาก",
                ],
              ],
              [
                "projectAppropriateness",
                "6. ความเหมาะสมของโครงการ",
                ["ดี", "พอใช้", "ต้องปรับปรุง"],
              ],
              [
                "location",
                "7. ความเหมาะสมของสถานที่",
                ["ดี", "พอใช้", "ต้องปรับปรุง"],
              ],
              [
                "schedule",
                "8. ระยะเวลาในการดำเนินการ",
                [
                  "ตามระบุไว้ในแผน",
                  "เร็วกว่าที่ระบุไว้ในแผน",
                  "ช้ากว่าที่ระบุไว้ในแผน",
                ],
              ],
              [
                "budget",
                "9. ค่าใช้จ่ายจริง",
                [
                  "สูงกว่างบประมาณที่ได้รับ",
                  "เท่ากับงบประมาณที่ได้รับ",
                  "ต่ำกว่างบประมาณที่ได้รับ",
                ],
              ],
            ].map(([key, label, options]: any) => (
              <Field key={key} label={label}>
                <div
                  className={
                    key === "quantitativeStatus" || key === "qualitativeStatus"
                      ? "grid grid-cols-[1fr_110px] gap-2"
                      : ""
                  }
                >
                  <select
                    className={inputClass}
                    disabled={readOnly}
                    value={assessment[key] || ""}
                    onChange={(event) =>
                      update("operation_assessment", {
                        ...assessment,
                        [key]: event.target.value,
                      })
                    }
                  >
                    {options.map((option: string) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  {key === "quantitativeStatus" ||
                  key === "qualitativeStatus" ? (
                    <input
                      className={inputClass}
                      disabled={readOnly}
                      min="0"
                      placeholder="ร้อยละ"
                      type="number"
                      value={
                        assessment[
                          key === "quantitativeStatus"
                            ? "quantitativePercent"
                            : "qualitativePercent"
                        ]
                      }
                      onChange={(event) =>
                        update("operation_assessment", {
                          ...assessment,
                          [key === "quantitativeStatus"
                            ? "quantitativePercent"
                            : "qualitativePercent"]: Number(event.target.value),
                        })
                      }
                    />
                  ) : null}
                </div>
              </Field>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="10. ปัญหาและอุปสรรคระหว่างดำเนินการ">
              <textarea
                className={inputClass + " min-h-28 resize-y"}
                disabled={readOnly}
                value={document.problems || ""}
                onChange={(event) => update("problems", event.target.value)}
              />
            </Field>
            <Field label="11. ข้อเสนอแนะและแนวทางปรับปรุง">
              <p className="mb-2 text-xs text-gray-500">
                AI สรุปจากคำตอบปลายเปิดของผู้เข้าร่วม และยังแก้ไขเองได้
              </p>
              <textarea
                className={inputClass + " min-h-28 resize-y"}
                disabled={readOnly}
                value={document.recommendations || ""}
                onChange={(event) =>
                  update("recommendations", event.target.value)
                }
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="12. ความสอดคล้องกับบริบทโรงเรียนและเหตุผลที่ควรจัดต่อ">
              <p className="mb-2 text-xs text-gray-500">
                AI วิเคราะห์ประโยชน์ต่อผู้เรียนและเงื่อนไขที่ควรปรับปรุง
                และยังแก้ไขเองได้
              </p>
              <textarea
                className={inputClass + " min-h-36 resize-y"}
                disabled={readOnly}
                value={document.continuation_reason || ""}
                onChange={(event) =>
                  update("continuation_reason", event.target.value)
                }
              />
            </Field>
          </div>
        </Section>

        <Section
          title="ผู้รายงาน"
          description="ใช้เฉพาะผู้รายงาน ไม่ใช้สายอนุมัติของเอกสารข้อเสนอ"
        >
          <div className="space-y-3">
            {(document.signatories || []).map((row: any, index: number) => (
              <div
                className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1fr_auto]"
                key={index}
              >
                <Field label={"ผู้รายงานคนที่ " + (index + 1)}>
                  <select
                    className={inputClass}
                    disabled={readOnly}
                    value={row.personnelId || ""}
                    onChange={(event) => {
                      const person = people.find(
                        (item) =>
                          item.document_personnel_id ===
                          Number(event.target.value),
                      );
                      updateRow("signatories", index, {
                        role: "ผู้รายงาน",
                        personnelId: Number(event.target.value),
                        name: person
                          ? String(person.prefix_name || "") +
                            person.firstname +
                            " " +
                            person.lastname
                          : "",
                      });
                    }}
                  >
                    <option value="">เลือกบุคลากร</option>
                    {people.map((person) => (
                      <option
                        key={person.document_personnel_id}
                        value={person.document_personnel_id}
                      >
                        {person.prefix_name || ""}
                        {person.firstname} {person.lastname} ({person.position})
                      </option>
                    ))}
                  </select>
                </Field>
                <button
                  className="mt-7 text-gray-400 hover:text-red-500"
                  disabled={readOnly}
                  type="button"
                  onClick={() =>
                    update(
                      "signatories",
                      document.signatories.filter(
                        (_: any, itemIndex: number) => itemIndex !== index,
                      ),
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            className="mt-3 inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[#5d7c6f]"
            disabled={readOnly}
            type="button"
            onClick={() =>
              update("signatories", [
                ...(document.signatories || []),
                { role: "ผู้รายงาน", personnelId: "", name: "" },
              ])
            }
          >
            <Plus size={15} /> เพิ่มผู้รายงาน
          </button>
        </Section>

        <Section title="ภาคผนวกประมวลภาพกิจกรรม">
          <div className="mb-4 flex flex-col gap-3 rounded-xl bg-[#f2f7f5] p-4 md:flex-row md:items-end">
            <Field label="คำบรรยายภาพ (ถ้ามี)">
              <input
                className={inputClass}
                disabled={readOnly}
                value={photoCaption}
                onChange={(event) => setPhotoCaption(event.target.value)}
              />
            </Field>
            <input
              ref={fileRef}
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="hidden"
              disabled={readOnly}
              type="file"
              onChange={uploadPhoto}
            />
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5d7c6f] px-4 py-2.5 text-sm font-medium text-white"
              disabled={readOnly}
              type="button"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus size={17} /> เพิ่มรูปภาพ
            </button>
          </div>
          {photos.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {photos.map((photo, index) => (
                <div
                  className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                  key={photo.camp_project_summary_photo_id}
                >
                  <img
                    alt={photo.caption || "ภาพกิจกรรม " + (index + 1)}
                    className="aspect-[4/3] w-full object-cover"
                    src={photo.image_url}
                  />
                  <div className="flex items-center justify-between gap-2 p-3">
                    <span className="text-sm text-gray-600">
                      {photo.caption || "ไม่มีคำบรรยาย"}
                    </span>
                    <button
                      className="text-xs text-red-500"
                      disabled={readOnly}
                      type="button"
                      onClick={() =>
                        deletePhoto(photo.camp_project_summary_photo_id)
                      }
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              ยังไม่มีรูปภาพในภาคผนวก
            </p>
          )}
        </Section>
      </main>
    </div>
  );
}
