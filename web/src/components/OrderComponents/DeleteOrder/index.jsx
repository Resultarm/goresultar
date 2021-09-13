import React, { useState } from "react";
import { Button, Checkbox, Icon, Modal } from "semantic-ui-react";
import {
  deleteOrder,
  updateOrderProcessStatus,
} from "../../../services/orderService";

const DeleteOrder = ({ id, addToast, hasPayments, loadOrders }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeOrder = () => {
    deleteOrder(id, { deleteTrxs: true })
      .then((resp) => {
        addToast(`Order deleted successfully`, { appearance: "success" });
      })
      .catch((err) => {
        if (err.message !== "") {
          addToast("Could not delete order: " + err.message, {
            appearance: "error",
          });
        } else {
          addToast("Something went wrong", { appearance: "error" });
        }
      })
      .finally(() => {
        toggleModal();
        loadOrders();
      });
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <Modal
      trigger={
        <Button
          onClick={toggleModal}
          icon="trash alternate"
          negative
          basic
          size="mini"
          style={{ height: 32 }}
        ></Button>
      }
      open={isModalOpen}
      onClose={toggleModal}
      closeIcon
    >
      <Modal.Header>Delete Order</Modal.Header>
      <Modal.Content>
        <h4>Are you sure you want to delete an order with id {`"${id}"`}?</h4>

        <div style={{ textAlign: "right", paddingTop: 16 }}>
          <Button onClick={toggleModal}>Close</Button>
          <Button color="red" onClick={removeOrder}>
            <Icon name="trash" /> Delete
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default DeleteOrder;
