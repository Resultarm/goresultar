import React, { useState } from "react";
import { Button, Form, Icon, Modal } from "semantic-ui-react";

import "./styles.css";
import { isTextValid } from "../../../helpers/validations";
import { useTranslation } from "react-i18next";

const BrandForm = ({ brand, submit, departmentOptions, addToast, componentName, loadBrands }) => {
  const { t } = useTranslation(["translation"]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState(brand.title);
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [description, setDescription] = useState(brand.description);
  const [isDescriptionValid, setIsDescriptionValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [departmentId, setDepartmentId] = useState(brand?.departmentId);
  const handleFormSubmit = async () => {
    const isValid = isDescriptionValid && isTitleValid;
    if (!isValid || isLoading) {
      return;
    }
    setIsLoading(true);
    await submit({ title, description, departmentId })
      .then((resp) =>
        addToast(`${t("Brand")} ${t("saved successfully")}`, {
          appearance: "success",
        })
      )
      .catch((err) => {
        addToast(err.message, { appearance: "error" });
      });
    setIsLoading(false);
    handleCloseModal();
  };

  const toggleModalState = () => {
    setIsModalOpen(!isModalOpen);
  };
  const handleCloseModal = () => {
    loadBrands();
    toggleModalState();
    setTitle("");
    setDescription("");
    setIsDescriptionValid(true);
    setIsTitleValid(true);
  };

  return (
    <Modal
      trigger={
        <Button onClick={toggleModalState} className={componentName === t("Edit") ? "table-action-btn" : "generic-create-btn"}>
          {componentName === t("Edit") ? <Icon name="pencil" /> : <span>{componentName}</span>}
        </Button>
      }
      closeIcon
      open={isModalOpen}
      onClose={handleCloseModal}
    >
      <Modal.Header>
        {componentName} {t("brand")}
      </Modal.Header>
      <Modal.Content>
        <div className={"create-brand-form"}>
          <Form name="createDepForm" size="large" onSubmit={handleFormSubmit}>
            <Form.Input
              fluid
              placeholder={t("Title")}
              value={title}
              error={!isTitleValid}
              onChange={(ev) => setTitle(ev.target.value)}
              onBlur={() => setIsTitleValid(isTextValid(title, 3, 0))}
            />
            <Form.Select
              label={t("Department")}
              options={departmentOptions}
              placeholder={t("Department")}
              value={departmentId}
              onChange={(e, { value }) => setDepartmentId(value)}
            />
            <Form.TextArea
              fluid
              placeholder={t("Description")}
              value={description}
              error={!isDescriptionValid}
              onChange={(ev) => setDescription(ev.target.value)}
              onBlur={() => setIsDescriptionValid(isTextValid(description, 5, 0))}
            />
            <Button type="submit" color="teal" fluid size="small" loading={isLoading} primary>
              {t("Submit")}
            </Button>
          </Form>
        </div>
      </Modal.Content>
    </Modal>
  );
};

BrandForm.defaultProps = {
  brand: {},
};

export default BrandForm;
