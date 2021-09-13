import React from "react";
import { Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useEffect } from "react";

function ImageUpload({ onUpload, fileList: inFileList, ...rest }) {
  const [fileList, setFileList] = useState([]);

  const handleChange = ({ fileList, file }) => {
    setFileList(fileList);
    if (file.status === "done") {
      onUpload(file.response);
    }
  };

  useEffect(() => {
    setFileList(inFileList);
  }, [inFileList]);

  return (
    <Upload
      accept=".jpg, .jpeg, .png"
      listType="picture-card"
      fileList={fileList}
      onChange={handleChange}
      headers={{ Authorization: "Bearer " + localStorage.getItem("token") }}
      {...rest}
    >
      {fileList.length === 0 && (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Upload logo</div>
        </div>
      )}
    </Upload>
  );
}

export default ImageUpload;
