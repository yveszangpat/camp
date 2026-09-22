import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeProjectSummaryStandards,
  projectSummaryStandardsText,
} from "../lib/project-summary-standards";

test("a standard without sub-items stays as a single standard", () => {
  const standards = normalizeProjectSummaryStandards([
    {
      title: "มาตรฐานที่ 2 กระบวนการบริหารจัดการ",
      achieved: false,
      subItems: [
        { code: "", title: "", relatedItems: "", achieved: false },
      ],
    },
  ]);

  assert.deepEqual(standards, [
    {
      title: "มาตรฐานที่ 2 กระบวนการบริหารจัดการ",
      relatedItems: "",
      achieved: false,
      subItems: [],
    },
  ]);
  assert.equal(
    projectSummaryStandardsText(standards),
    "มาตรฐานที่ 2 กระบวนการบริหารจัดการ",
  );
});

test("real sub-items and related item numbers are preserved", () => {
  const standards = normalizeProjectSummaryStandards([
    {
      title: "มาตรฐานที่ 1 คุณภาพผู้เรียน",
      achieved: true,
      subItems: [
        {
          code: "1.1",
          title: "ผลสัมฤทธิ์ทางวิชาการของผู้เรียน",
          relatedItems: "1,2",
          achieved: true,
        },
      ],
    },
  ]);

  assert.equal(standards[0].subItems.length, 1);
  assert.match(projectSummaryStandardsText(standards), /1\.1/);
  assert.match(projectSummaryStandardsText(standards), /รายการที่ 1,2/);
});

test("legacy standards become a standard without a synthetic sub-item", () => {
  assert.deepEqual(normalizeProjectSummaryStandards([], "มาตรฐานเดิม"), [
    {
      title: "มาตรฐานเดิม",
      relatedItems: "",
      achieved: false,
      subItems: [],
    },
  ]);
});

test("a related item without a sub-item is promoted to the standard line", () => {
  const standards = normalizeProjectSummaryStandards([
    {
      title: "มาตรฐานที่ 3 การสอนที่เน้นผู้เรียนเป็นสำคัญ",
      achieved: true,
      subItems: [
        { code: "", title: "", relatedItems: "3", achieved: false },
      ],
    },
  ]);

  assert.deepEqual(standards, [
    {
      title: "มาตรฐานที่ 3 การสอนที่เน้นผู้เรียนเป็นสำคัญ",
      relatedItems: "3",
      achieved: true,
      subItems: [],
    },
  ]);
  assert.equal(
    projectSummaryStandardsText(standards),
    "มาตรฐานที่ 3 การสอนที่เน้นผู้เรียนเป็นสำคัญ รายการที่ 3",
  );
});
