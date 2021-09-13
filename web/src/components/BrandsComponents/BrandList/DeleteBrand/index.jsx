import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon, Modal } from "semantic-ui-react";
import { deleteBrand } from "src/services/brandsService";

const DeleteBrand = ({ title, id, addToast, loadBrands }) => {
  const { t } = useTranslation(["translation"]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeBrand = () => {
    deleteBrand(id)
      .then((resp) => {
        addToast(`${t("Brand")} ${t("deleted successfully")}`, { appearance: "success" });
      })
      .catch((err) => {
        if (err.message !== "") {
          addToast(`${t("Could not delete")} ${t("brand")} <- ${err.message}`, { appearance: "error" });
        } else {
          addToast(t(`Something went wrong`), { appearance: "error" });
        }
      })
      .finally(() => {
        toggleModal();
        loadBrands();
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
      closeIcon
      onClose={toggleModal}
    >
      <Modal.Header>
        {t("Delete")} {t("brand")}
      </Modal.Header>
      <Modal.Content>
        <h4>
          {t("Are you sure you want to delete")} "{title}" ?
        </h4>
        <Button color="red" inverted onClick={removeBrand}>
          <Icon name="remove" /> {t("Delete")}
        </Button>
        <Button color="blue" inverted onClick={toggleModal}>
          <Icon name="checkmark" /> {t("Cancel")}
        </Button>
      </Modal.Content>
    </Modal>
  );
};

export default DeleteBrand;
