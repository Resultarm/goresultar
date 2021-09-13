import React, { useEffect } from "react";
import { Alert, Button, Form, Input, message } from "antd";
import { FormModal } from "src/components";
import { useTranslation } from "react-i18next";
import { ruleRequired, translateFormRules } from "src/helpers";
import { useDepartment } from "src/hooks";

import { MinusCircleOutlined } from "@ant-design/icons";

const formRules = {
  title: [ruleRequired],
  departments: [ruleRequired],
  categoryTitle: [ruleRequired],
  subCategoryTitle: [ruleRequired],
};

function DepartmentFormModal({ initialValue, afterSave, onClose, okText }) {
  const { t } = useTranslation(["translation"]);
  const { save, status } = useDepartment(initialValue?._id);

  const handleSubmit = (values) => {
    save(values, initialValue?._id);
  };

  useEffect(() => {
    if (status.isSuccess) {
      message.success(status.message);
      afterSave();
    }
  }, [status, afterSave, onClose]);

  const rules = translateFormRules(t, formRules);

  return (
    <FormModal formID="department-form-modal" onClose={onClose} okText={okText} style={{ top: 16 }}>
      <Form layout="vertical" id="department-form-modal" initialValues={initialValue} onFinish={handleSubmit}>
        <Form.Item name="title" label={t("Title")} rules={rules.title}>
          <Input />
        </Form.Item>

        <Form.Item name="description" label={t("Description")} rules={rules.description}>
          <Input.TextArea rows={4} />
        </Form.Item>

        {!initialValue?._id && (
          <>
            <div style={{ paddingBottom: 8 }}>{t("Categories")}</div>
            <Form.List name="categories">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <div key={field.key}>
                      <div className="categories-form-item-wrapper">
                        <Form.Item
                          name={[field.name, "title"]}
                          fieldKey={[field.fieldKey, "title"]}
                          rules={rules.categoryTitle}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, "description"]}
                          fieldKey={[field.fieldKey, "description"]}
                          rules={rules.categoryDescription}
                        >
                          <Input.TextArea rows={1} />
                        </Form.Item>
                        <Button type="danger" ghost icon={<MinusCircleOutlined />} onClick={() => remove(field.name)}></Button>
                      </div>
                      <Form.List name={[field.name, "subcategories"]}>
                        {(fields, { add, remove }) => (
                          <div
                            style={{
                              marginLeft: 16,
                              borderBottom: "1px dashed #d9d9d9",
                              borderLeft: "1px dashed #d9d9d9",
                              paddingLeft: 16,
                              marginBottom: 16,
                            }}
                          >
                            {fields.map((subfield) => (
                              <div className="subcategories-form-item-wrapper" key={subfield.key}>
                                <Form.Item
                                  name={[subfield.name, "title"]}
                                  fieldKey={[subfield.fieldKey, "title"]}
                                  rules={rules.subCategoryTitle}
                                >
                                  <Input />
                                </Form.Item>
                                <Form.Item
                                  name={[subfield.name, "description"]}
                                  fieldKey={[subfield.fieldKey, "description"]}
                                  rules={rules.subCategoryDescription}
                                >
                                  <Input.TextArea rows={1} />
                                </Form.Item>
                                <Button
                                  type="danger"
                                  ghost
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => remove(subfield.name)}
                                ></Button>
                              </div>
                            ))}
                            <Button className="add-btn" type="link" onClick={() => add()}>
                              + {t("Add")} {t("Sub Category")}
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </div>
                  ))}
                  <Button className="add-btn" type="link" onClick={() => add()}>
                    + {t("Add")} {t("Category")}
                  </Button>
                </>
              )}
            </Form.List>
          </>
        )}
      </Form>
      {status.isError && <Alert message={status.message} type="error" />}
    </FormModal>
  );
}

export default DepartmentFormModal;
