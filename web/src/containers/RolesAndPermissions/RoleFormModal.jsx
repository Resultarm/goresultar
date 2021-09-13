import React from "react";
import { Form, Input } from "antd";
import FormModal from "src/components/FormModal";
import { usePermissions } from "src/hooks";

const FORM_ID = "role-add-form-modal";

function RoleFormModal({ okText, onClose }) {
  const { data: permissions, status } = usePermissions();
  const initialValue = { permissions };
  console.log("initialValue :>> ", initialValue);
  return (
    <FormModal
      className={FORM_ID}
      formID={FORM_ID}
      okText={okText}
      onClose={onClose}
      // submitButtonProps={{ loading: saveStatus.isLoading }}
      width="100%"
      style={{ top: 16 }}
      organizationId={initialValue?.organizationId}
    >
      <Form id={FORM_ID} initialValues={initialValue}>
        <Form.Item label={__("Title")} name="title">
          <Input></Input>
        </Form.Item>
        <Form.List name="permissions">{console.log}</Form.List>
      </Form>
    </FormModal>
  );
}

export default RoleFormModal;
