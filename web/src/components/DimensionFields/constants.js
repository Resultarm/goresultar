export const UNIT = "unit";
export const LINEAR_METER = "linearMeter";
export const SQUARE_METER = "squareMeter";
export const CUBIC_METER = "cubicMeter";

export const MEASUREMENT_TYPES = [
  { label: __("Unit"), value: UNIT },
  { label: __("Linear Meter"), value: LINEAR_METER },
  { label: __("Square Meter"), value: SQUARE_METER },
  { label: __("Cubic Meter"), value: CUBIC_METER },
];

// using `undefined` doesn't change value inside input
export const MEASUREMENT_DEFAULT_VALUES = {
  [LINEAR_METER]: [null],
  [SQUARE_METER]: [null, null],
  [CUBIC_METER]: [null, null, null],
};
