import React, { useState } from "react";
import { Button, Form, Icon, Modal } from "semantic-ui-react";

import "./styles.css";
import { isTextValid } from "../../../helpers/validations";

const CategoryForm = ({ category = {}, departmentOptions, submit, addToast, componentName, loadCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState(category.title);
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [description, setDescription] = useState(category.description);
  const [departmentId, setDepartmentId] = useState(category.departmentId);
  const [isDescriptionValid, setIsDescriptionValid] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async () => {
    const isValid = isDescriptionValid && isTitleValid && departmentId !== "";
    if (!isValid || isLoading) {
      return;
    }
    setIsLoading(true);
    await submit({ title, description, departmentId })
      .then((resp) => {
        addToast(`Category ${category.title ? "updated" : "created"} successfully`, { appearance: "success" });
        setTitle("");
        setDescription("");
        setDepartmentId("");
      })
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
    loadCategories();
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
      <Modal.Header>{componentName} a category</Modal.Header>
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
            label="Departamento"
            options={departmentOptions}
            placeholder="Departamento"
            onChange={(e, { value }) => setDepartmentId(value)}
            value={departmentId}
          />
          <Button type="submit" color="teal" fluid loading={isLoading} primary>
            Submit
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

CategoryForm.defaultProps = {
  department: {},
};

export default CategoryForm;
