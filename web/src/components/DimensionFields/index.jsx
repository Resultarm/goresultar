import { ConfigProvider } from "antd";
import React from "react";
import { InputNumberFmtd } from "src/components";
import { SQUARE_METER, LINEAR_METER, CUBIC_METER } from "./constants";
import "./styles.scss";
import { useMemo } from "react";
import { useCallback } from "react";

const MetersPlaceholder = __("Meters");
const WidthPlaceholder = __("Width");
const LengthPlaceholder = __("Length");
const HeightPlaceholder = __("Height");

const LINEAR_METER_INPUT_CONFIG = {
  label: __("M"),
  placeholder: MetersPlaceholder,
};

const WIDTH_INPUT_CONFIG = {
  label: __("W"),
  placeholder: WidthPlaceholder,
};

const HEIGHT_INPUT_CONFIG = {
  label: __("H"),
  placeholder: HeightPlaceholder,
};

const LENGTH_INPUT_CONFIG = {
  label: __("L"),
  placeholder: LengthPlaceholder,
};

const CONFIG_MAP = {
  [LINEAR_METER]: [LINEAR_METER_INPUT_CONFIG],
  [SQUARE_METER]: [WIDTH_INPUT_CONFIG, HEIGHT_INPUT_CONFIG],
  [CUBIC_METER]: [WIDTH_INPUT_CONFIG, HEIGHT_INPUT_CONFIG, LENGTH_INPUT_CONFIG],
};

function DimensionFields({ measurementType, onChange, value }) {
  const handleChange = useCallback(
    (i) => (v) => {
      const newValue = [...value];
      newValue[i] = v;
      if (onChange) onChange(newValue);
    },
    [value, onChange]
  );

  const children = useMemo(() => {
    const config = CONFIG_MAP[measurementType];
    if (!config) return null;
    return config.map(({ label, placeholder }, i) => (
      <React.Fragment key={measurementType + label}>
        {label}: <InputNumberFmtd placeholder={placeholder} onChange={handleChange(i)} value={value[i]} />
      </React.Fragment>
    ));
  }, [measurementType, handleChange, value]);

  return (
    <ConfigProvider componentSize="small">
      <div className="dimension-fields-container">{children}</div>
    </ConfigProvider>
  );
}

export default DimensionFields;
