import { default as currencyFormatter } from "./currencyFormatterPrefix";
import { default as currencyFormatterw } from "./currencyFormatterPrefix";

import round from "./round";
import roundw from "./roundw";

export { formatNumber as nf } from "./formatters";

export { default as listOptsFromQueryParams } from "./listOptsFromQueryParams";
export { default as filtersFromQueryParams } from "./listOptsFromQueryParams";
export { default as translateRules } from "./translateRules";
export { default as translateFormRules } from "./translateRules";
export { default as editDeleteRenderer } from "./editDeleteRenderer";
export { default as computeOrderTotal } from "./computeOrderTotal";
export { default as getName } from "./getName";
export { default as measurementValueDisplay } from "./measurementValueDisplay";
export { default as deleteConfirm } from "./deleteConfirm";
export { default as makeLabelGetter } from "./makeLabelGetter";
export { round };
export { roundw };

const cfw = (nw) => currencyFormatterw.format(roundw(nw));
const cf = (n) => currencyFormatter.format(round(n));
export { cf };
export { cfw };

export const ruleRequired = { required: true };
export const makeRuleRequired = (msg) => ({ required: true, message: msg });
export const braillePatternBlank = "⠀";
