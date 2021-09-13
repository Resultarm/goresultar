import React, { useContext } from "react";
import { Modal } from "antd";
import { OrganizationContext } from "src/contexts";

function FormModal({ okText, onClose, formID, submitButtonProps, width, style, children, organizationId }) {
  const globalOrganizationId = useContext(OrganizationContext);
  return (
    <Modal
      title={okText}
      onClose={onClose}
      visible
      okText={okText}
      okButtonProps={{
        form: formID,
        htmlType: "submit",
        ...submitButtonProps,
      }}
      onCancel={onClose}
      width={width || 800}
      maskClosable={false}
      keyboard={false}
      style={style}
      bodyStyle={{ maxHeight: "calc(100vh - 144px)" }}
      destroyOnClose
    >
      <OrganizationContext.Provider value={organizationId || globalOrganizationId}>{children}</OrganizationContext.Provider>
    </Modal>
  );
}

export default FormModal;
