import { differenceInDays } from "date-fns";
import * as Yup from "yup";

export const establishment = Yup.object().shape({
  name: Yup.string().trim().required().label("Name"),
  size: Yup.string().trim().required().label("Size"),
});

export const employee = Yup.object().shape({
  last_name: Yup.string().trim().required().label("Last Name"),
  first_name: Yup.string().trim().required().label("First Name"),
  middle_initial: Yup.string()
    .trim()
    .required()
    .test(
      "isCorrectFormat",
      "Middle Initial must be in the correct format",
      (value) => {
        return ["na", "n/a"].includes(value.toLowerCase()) || value.length == 1;
      },
    )
    .label("Middle Initial"),
  rate: Yup.number()
    .typeError("Rate must be a number")
    .required()
    .label("Rate"),
  start_day: Yup.string().required().label("Start Day"),
  end_day: Yup.string().required().label("End Day"),
});

export const period = Yup.object().shape({
  start_date: Yup.string().trim().required().label("Start Date"),
  end_date: Yup.string()
    .trim()
    .required()
    .test(
      "isBefore",
      "End Date must be after Start Date",
      (value, context) =>
        differenceInDays(value, context.parent.start_date) >= 0,
    )
    .label("End Date"),
});

export const wageOrder = Yup.object().shape({
  name: Yup.string().trim().required().label("Name"),
  date: Yup.string().trim().required().label("Date"),
  less_than_ten: Yup.number()
    .typeError("Rate must be a number")
    .required()
    .label("Rate"),
  ten_or_more: Yup.number()
    .typeError("Rate must be a number")
    .required()
    .label("Rate"),
});
