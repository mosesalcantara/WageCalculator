import { differenceInDays } from "date-fns";
import * as z from "zod";

const errors = {
  required: "is a required field",
  number: "must be a number",
  date: "must be a date",
};

const getError = (type: keyof typeof errors, label: string) => {
  return `${label} ${errors[type]}`;
};

export const establishment = z.object({
  // name: z
  //   .string(getError("required", "Name"))
  //   .min(1, getError("required", "Name")),
    name: z.number(getError("number", "Rate")),
  size: z
    .string(getError("required", "Size"))
    .min(1, getError("required", "Size")),
});

export type Establishment = z.infer<typeof establishment>;

export const employee = z
  .object({
    last_name: z
      .string(getError("required", "Last Name"))
      .min(1, getError("required", "Last Name")),
    first_name: z
      .string(getError("required", "First Name"))
      .min(1, getError("required", "First Name")),
    middle_initial: z
      .string(getError("required", "Middle Initial"))
      .min(1, getError("required", "Middle Initial")),
    rate: z.number(getError("number", "Rate")),
    start_day: z
      .string(getError("required", "Start Day"))
      .min(1, getError("required", "Start Day")),
    end_day: z
      .string(getError("required", "End Day"))
      .min(1, getError("required", "End Day")),
  })
  .refine(
    (values) =>
      ["na", "n/a"].includes(values.middle_initial.toLowerCase()) ||
      values.middle_initial.length == 1,
    {
      error: "Middle Initial must be in the correct format",
      path: ["middle_initial"],
    },
  );

export type Employee = z.infer<typeof employee>;

export const period = z
  .object({
    start_date: z.date(getError("date", "Start Date")),
    end_date: z.date(getError("date", "End Date")),
  })
  .refine(
    (values) => differenceInDays(values.end_date, values.start_date) >= 0,
    {
      error: "End Date must be after Start Date",
      path: ["end_date"],
    },
  );

export type Period = z.infer<typeof period>;

export const wageOrder = z.object({
  name: z
    .string(getError("required", "Name"))
    .min(1, getError("required", "Name")),
  date: z.date(getError("date", "Date")),
  less_than_ten: z.number(getError("number", "Rate")),
  ten_or_more: z.number(getError("number", "Rate")),
});

export type WageOrder = z.infer<typeof wageOrder>;

export const holiday = z.object({
  name: z
    .string(getError("required", "Name"))
    .min(1, getError("required", "Name")),
  date: z.date(getError("date", "Date")),
  type: z
    .string(getError("required", "Type"))
    .min(1, getError("required", "Type")),
});

export type Holiday = z.infer<typeof holiday>;
