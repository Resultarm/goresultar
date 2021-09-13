import React, { useState } from "react";
import { Button, Icon, Modal } from "semantic-ui-react";
import { deleteProduct } from "../../../services/productService";

const DeleteProduct = ({ title, id, addToast, loadProducts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeProduct = () => {
    deleteProduct(id)
      .then((resp) => {
        addToast(`Produto deleted successfully`, { appearance: "success" });
      })
      .catch((err) => {
        if (err.message !== "") {
          addToast("Could not delete product: " + err.message, {
            appearance: "error",
          });
        } else {
          addToast("Something went wrong", { appearance: "error" });
        }
      })
      .finally(() => {
        toggleModal();
        loadProducts();
      });
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <Modal
      trigger={
        <Button className="table-action-btn" onClick={toggleModal}>
          <Icon name="trash" />
        </Button>
      }
      open={isModalOpen}
      closeIcon
    >
      <Modal.Header>Delete a product</Modal.Header>
      <Modal.Content>
        <h4>Are you sure you want to delete product {`"${title}"`}?</h4>
        <Button color="red" inverted onClick={removeProduct}>
          <Icon name="remove" /> Delete
        </Button>
        <Button color="blue" inverted onClick={toggleModal}>
          <Icon name="checkmark" /> Cancel
        </Button>
      </Modal.Content>
    </Modal>
  );
};

export default DeleteProduct;
