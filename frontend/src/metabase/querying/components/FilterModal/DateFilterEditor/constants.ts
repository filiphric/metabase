import type { DatePickerShortcut } from "metabase/querying/components/DatePicker";

// https://v6.mantine.dev/core/modal/?t=props
export const MODAL_Z_INDEX = 200;

export const MAIN_SHORTCUTS: DatePickerShortcut[] = [
  "today",
  "yesterday",
  "last-week",
  "last-month",
];

export const SECONDARY_SHORTCUTS: DatePickerShortcut[] = [
  "last-7-days",
  "last-30-days",
  "last-3-months",
  "last-12-months",
];
