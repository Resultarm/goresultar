import React from "react";
import NumberFormat from "react-number-format";
import { Input } from "antd";

const InputNumberFmtd = ({ onChange, valuePropName, ...props }) => {
  const handleChange = (values) => {
    onChange(values[valuePropName || "floatValue"]);
  };

  return (
    <NumberFormat
      customInput={Input}
      thousandSeparator="."
      decimalSeparator=","
      {...props}
      onValueChange={onChange ? handleChange : undefined}
    />
  );
};

export default InputNumberFmtd;
