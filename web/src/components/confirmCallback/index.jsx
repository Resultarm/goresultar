import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

function confirmCallback(title, okText, cb) {
  confirm({
    title: title,
    icon: <ExclamationCircleOutlined />,
    okText: okText,
    cancelText: "No",
    onOk() {
      cb();
    },
  });
}

export default confirmCallback;
