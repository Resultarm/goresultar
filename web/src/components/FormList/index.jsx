import React from "react";
import { Form, Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useMemo } from "react";

const defaultAddBtnProps = {
  type: "link",
  icon: <PlusOutlined />,
};

function FormList({ name, label, children, addText, min = 0, addBtnProps: addBtnPropsFromProps }) {
  const addBtnProps = useMemo(() => ({ ...defaultAddBtnProps, addBtnPropsFromProps }), [addBtnPropsFromProps]);

  return (
    <>
      {label && <div style={{ paddingBottom: 8 }}>{label}</div>}
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, i) => (
              <div
                key={field.key}
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "minmax(min-content,max-content) minmax(min-content,max-content) min-content",
                  columnGap: 8,
                  alignItems: "baseline",
                }}
              >
                {children(field)}
                <Button
                  style={{ visibility: i > min - 1 ? "visible" : "hidden" }}
                  type="danger"
                  ghost
                  icon={<MinusCircleOutlined />}
                  onClick={() => remove(field.name)}
                ></Button>
              </div>
            ))}
            <Button {...addBtnProps} onClick={() => add()}>
              {addText}
            </Button>
          </>
        )}
      </Form.List>
    </>
  );
}

export default FormList;
