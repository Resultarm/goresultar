import React, { useState } from "react";
import { Button, Icon, Modal } from "semantic-ui-react";
import { deleteDepartment } from "../../../services/departmentsService";

const DeleteDepartment = ({ title, id, addToast, loadDepartments }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeDepartment = () => {
    deleteDepartment(id)
      .then((resp) => {
        addToast(`Departamento deleted successfully`, {
          appearance: "success",
        });
      })
      .catch((err) => {
        if (err.message !== "") {
          addToast("Could not delete department: " + err.message, {
            appearance: "error",
          });
        } else {
          addToast("Something went wrong", { appearance: "error" });
        }
      })
      .finally(() => {
        handleCloseModal();
      });
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCloseModal = () => {
    loadDepartments();
    toggleModal();
  };
  return (
    <Modal
      trigger={
        <button className="table-action-btn" onClick={toggleModal}>
          <Icon name="trash" />
        </button>
      }
      open={isModalOpen}
      onClose={handleCloseModal}
      closeIcon
    >
      <Modal.Header>Delete a department</Modal.Header>
      <Modal.Content>
        <h4>Are you sure you want to delete department {`"${title}"`}?</h4>
        <Button color="red" inverted onClick={removeDepartment}>
          <Icon name="remove" /> Delete
        </Button>
        <Button color="blue" inverted onClick={toggleModal}>
          <Icon name="checkmark" /> Cancel
        </Button>
      </Modal.Content>
    </Modal>
  );
};

export default DeleteDepartment;
