import React, { useEffect } from "react";
import { Alert, Form, Input, message, Select } from "antd";
import { FormModal } from "src/components";
import { useTranslation } from "react-i18next";
import { ruleRequired, translateFormRules } from "src/helpers";
import { useDepartmentOptions, useBrand } from "src/hooks";

const formRules = {
  title: [ruleRequired],
  departments: [ruleRequired],
};

function BrandFormModal({ initialValue, afterSave, onClose, okText }) {
  const { t } = useTranslation(["translation"]);
  const { save, status } = useBrand(initialValue?._id);
  const { options: departmentOptions, status: departmentOptionsStatus } = useDepartmentOptions();
  const handleSubmit = (values) => {
    save(initialValue?._id, values);
  };

  useEffect(() => {
    if (status.isSuccess) {
      message.success(status.message);
      afterSave();
    }
  }, [status, afterSave, onClose]);

  const rules = translateFormRules(t, formRules);

  return (
    <FormModal formID="brand-add-modal" onClose={onClose} okText={okText}>
      <Form layout="vertical" id="brand-add-modal" initialValues={initialValue} onFinish={handleSubmit}>
        <Form.Item name="title" label={t("Title")} rules={rules.title}>
          <Input />
        </Form.Item>

        <Form.Item name="description" label={t("Description")} rules={rules.description}>
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
      {status.isError && <Alert message={status.message} type="error" />}
    </FormModal>
  );
}

export default BrandFormModal;
