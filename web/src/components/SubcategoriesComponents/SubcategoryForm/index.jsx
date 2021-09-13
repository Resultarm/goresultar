import React, { useState } from "react";
import { Button, Form, Icon, Modal } from "semantic-ui-react";

import { isTextValid } from "../../../helpers/validations";

const SubcategoryForm = ({ category = {}, categoryOptions, submit, addToast, componentName, loadSubcategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState(category.title);
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [description, setDescription] = useState(category.description);
  const [categoryId, setCategoryId] = useState("");
  const [isDescriptionValid, setIsDescriptionValid] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async () => {
    const isValid = isDescriptionValid && isTitleValid && categoryId !== "";
    if (!isValid || isLoading) {
      return;
    }
    setIsLoading(true);
    await submit({ title, description, categoryId })
      .then((resp) => {
        addToast(`Subcategory ${category.title ? "updated" : "created"} successfully`, { appearance: "success" });
        setTitle("");
        setDescription("");
        setCategoryId("");
        handleCloseModal();
      })
      .catch((err) => {
        addToast(err.message, { appearance: "error" });
      });
    setIsLoading(false);
  };

  const toggleModalState = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCloseModal = () => {
    loadSubcategories();
    toggleModalState();
  };

  return (
    <Modal
      trigger={
        <Button className={componentName === "Edit" ? "table-action-btn" : "generic-create-btn"} onClick={toggleModalState}>
          {componentName === "Edit" ? <Icon name="pencil" /> : <span>{componentName}</span>}
        </Button>
      }
      closeIcon
      open={isModalOpen}
      onClose={handleCloseModal}
    >
      <Modal.Header>{componentName} Subcategory</Modal.Header>
      <Modal.Content>
        <Form name="createDepForm" size="large" onSubmit={handleFormSubmit}>
          <Form.Input
            fluid
            placeholder="Titulo"
            value={title}
            error={!isTitleValid}
            onChange={(ev) => setTitle(ev.target.value)}
            onBlur={() => setIsTitleValid(isTextValid(title, 3, 0))}
          />
          <Form.TextArea
            fluid
            placeholder="Descrição"
            value={description}
            error={!isDescriptionValid}
            onChange={(ev) => setDescription(ev.target.value)}
            onBlur={() => setIsDescriptionValid(isTextValid(description, 5, 0))}
          />
          <Form.Select
            fluid
            label="Category"
            options={categoryOptions}
            placeholder="Category"
            onChange={(e, { value }) => setCategoryId(value)}
            search
          />
          <Button type="submit" color="teal" fluid size="small" loading={isLoading} primary>
            Submit
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

SubcategoryForm.defaultProps = {
  category: {},
};

export default SubcategoryForm;
