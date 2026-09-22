export type ProjectSummaryStandardSubItem = {
  code: string;
  title: string;
  relatedItems: string;
  achieved: boolean;
};

export type ProjectSummaryStandard = {
  title: string;
  relatedItems: string;
  achieved: boolean;
  subItems: ProjectSummaryStandardSubItem[];
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

export function normalizeProjectSummaryStandards(
  value: unknown,
  legacyStandards?: unknown,
): ProjectSummaryStandard[] {
  const standards = asArray(value)
    .map((standard) => {
      const normalizedSubItems = asArray(standard?.subItems).map((item) => ({
        code: clean(item?.code),
        title: clean(item?.title),
        relatedItems: clean(item?.relatedItems),
        achieved: Boolean(item?.achieved),
      }));
      const promotedRelatedItems = normalizedSubItems
        .filter((item) => !item.code && !item.title && item.relatedItems)
        .map((item) => item.relatedItems)
        .join(", ");
      const subItems = normalizedSubItems.filter(
        (item) => item.code || item.title,
      );

      return {
        title: clean(standard?.title),
        relatedItems: clean(standard?.relatedItems) || promotedRelatedItems,
        achieved: Boolean(standard?.achieved),
        subItems,
      };
    })
    .filter(
      (standard) =>
        standard.title || standard.relatedItems || standard.subItems.length,
    );

  if (standards.length) return standards;

  const legacy = clean(legacyStandards);

  return legacy
    ? [{ title: legacy, relatedItems: "", achieved: false, subItems: [] }]
    : [];
}

export function projectSummaryStandardsText(value: unknown) {
  return normalizeProjectSummaryStandards(value)
    .map((standard) => {
      const standardLabel = standard.relatedItems
        ? `${standard.title}${standard.title ? " " : ""}รายการที่ ${standard.relatedItems}`
        : standard.title;
      const children = standard.subItems.map((item) => {
        const label = [item.code, item.title].filter(Boolean).join(" ");

        return item.relatedItems
          ? `${label}${label ? " " : ""}รายการที่ ${item.relatedItems}`
          : label;
      });

      return [standardLabel, ...children].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n");
}
