import { makeLabelGetter } from "src/helpers";

export const EXPENSE_FREQUENCY = {
  daily: __("Daily"),
  weekly: __("Weekly"),
  biweekly: __("Bi-Weekly"),
  monthly: __("Monthly"),
  custom: __("Custom"),
};

export const GET_EXPENSE_FREQUENCY_LABEL = makeLabelGetter(EXPENSE_FREQUENCY);

export const EXPENSE_FREQUENCY_OPTIONS = Object.entries(EXPENSE_FREQUENCY).map(([value, label]) => ({ value, label }));

export const EXPENSE_TYPE = {
  utility: __("Utility"),
  salary: __("Salary"),
  rent: __("Rent"),
  purchase: __("Purchase"),
};

export const GET_EXPENSE_TYPE_LABEL = makeLabelGetter(EXPENSE_TYPE);

export const EXPENSE_TYPE_OPTIONS = Object.entries(EXPENSE_TYPE).map(([value, label]) => ({ value, label }));
