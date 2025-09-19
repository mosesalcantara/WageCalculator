import * as Yup from "yup";

export const establishment = Yup.object().shape({
  name: Yup.string().trim().required().label("Name"),
});

export const employee = Yup.object().shape({
  first_name: Yup.string().trim().required().label("First Name"),
  last_name: Yup.string().trim().required().label("Last Name"),
  rate: Yup.number().typeError().required().label("Rate"),
  start_day: Yup.string().trim().required().label("Start Day"),
  end_day: Yup.string().trim().required().label("End Day"),
});
