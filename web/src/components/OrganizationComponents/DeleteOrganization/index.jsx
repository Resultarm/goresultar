import React, { useState } from "react";
import { Button, Icon, Modal } from "semantic-ui-react";
import { deleteOrganization } from "../../../services/organizationsService";

const DeleteOrganization = ({ title, id, addToast, loadOrgs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeOrganization = () => {
    deleteOrganization(id)
      .then((resp) => {
        addToast(`Organization deleted successfully`, {
          appearance: "success",
        });
      })
      .catch((err) => {
        if (err.message !== "") {
          addToast("Could not delete organization: " + err.message, {
            appearance: "error",
          });
        } else {
          addToast("Something went wrong", { appearance: "error" });
        }
      })
      .finally(() => {
        toggleModal();
        loadOrgs();
      });
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <Modal
      trigger={
        <Button className={"table-action-btn"} onClick={toggleModal}>
          <Icon name="trash" />
        </Button>
      }
      open={isModalOpen}
      onClose={toggleModal}
      closeIcon
    >
      <Modal.Header>Delete an organization</Modal.Header>
      <Modal.Content>
        <h4>Are you sure you want to delete organization {`"${title}"`}?</h4>
        <Button onClick={toggleModal}>
          <Icon name="checkmark" /> No
        </Button>
        <Button primary onClick={removeOrganization}>
          <Icon name="remove" /> Delete
        </Button>
      </Modal.Content>
    </Modal>
  );
};

export default DeleteOrganization;
