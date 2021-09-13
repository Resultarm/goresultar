import React from "react";
import { Button } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const editDeleteRenderer = (onEdit, onDelete) => (i) => {
  return (
    <>
      <Button
        className="margin-right"
        icon={<DeleteOutlined />}
        type="danger"
        onClick={() => onDelete(i._id)}
        size="small"
        ghost
      />
      <Button className="margin-right" icon={<EditOutlined />} onClick={() => onEdit(i)} size="small" />
    </>
  );
};

export default editDeleteRenderer;
