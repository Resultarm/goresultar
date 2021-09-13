import React from "react";
import { Select as AntdSelect } from "antd";

const Select = (props) => <AntdSelect allowClear showSearch optionFilterProp="label" {...props} />;

export default Select;
