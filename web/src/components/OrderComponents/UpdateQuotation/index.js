import React, { useEffect, useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import { updateOrderStatus } from "../../../services/orderService";
import { ReactComponent as ToOrderIcon } from "../../../components/icons/toorder.svg";
import { useQuotationToOrder } from "src/hooks";
import { Alert } from "antd";
import { useTranslation } from "react-i18next";

const UpdateQuotation = ({ id, addToast, loadOrders }) => {
  const { t } = useTranslation("translation");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { convert, status } = useQuotationToOrder(id);

  const removeOrder = () => {
    convert(id);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    if (status.isSuccess) {
      addToast(t("Converted to order successfully!"), { appearance: "success" });
      toggleModal();
      loadOrders();
    }
  }, [status]);

  return (
    <Modal
      trigger={
        <Button onClick={toggleModal} className="table-action-btn" style={{ fontSize: "1.3em", color: "teal" }}>
          <ToOrderIcon />
        </Button>
      }
      style={{ width: 500 }}
      open={isModalOpen}
      onClose={toggleModal}
      closeIcon
    >
      <Modal.Header>{t("Convert this order into open order ?")}</Modal.Header>
      <Modal.Content>
        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Button onClick={toggleModal}>{t("No")}</Button>
          <Button primary onClick={removeOrder}>
            {t("Yes")}
          </Button>
        </div>
        {status.isError && <Alert type="error" message={t("Not enough stock") + `: ${status.message}`}></Alert>}
      </Modal.Content>
    </Modal>
  );
};

export default UpdateQuotation;
