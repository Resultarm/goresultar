import { Modal } from "antd";

const OK_BUTTON_PROPS = { type: "danger" };

const deleteConfirm = ({ onOk, afterClose }) =>
  Modal.confirm({
    title: __("Are you sure you want to delete") + " ?",
    onOk,
    afterClose,
    okText: __("Yes, Delete"),
    cancelText: __("No"),
    okButtonProps: OK_BUTTON_PROPS,
  });

export default deleteConfirm;
