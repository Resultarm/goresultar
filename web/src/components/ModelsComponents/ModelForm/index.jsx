import React, { useState } from "react";
import { Button, Form, Icon, Modal } from "semantic-ui-react";

import { isTextValid } from "../../../helpers/validations";

const ModelForm = ({ model = {}, brandOptions, submit, addToast, componentName, loadModels }) => {
  const isEdit = !!model.title;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState(model.title);
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [description, setDescription] = useState(model.description);
  const [isDescriptionValid, setIsDescriptionValid] = useState(true);
  const [brandId, setBrandId] = useState(model.brandId);

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async () => {
    const isValid = isDescriptionValid && isTitleValid && brandId !== "";
    if (!isValid || isLoading) {
      return;
    }
    setIsLoading(true);
    await submit({ title, description, brandId })
      .then((resp) => {
        addToast(`Model ${model.title ? "updated" : "created"} successfully`, {
          appearance: "success",
        });
        setTitle("");
        setDescription("");
        setBrandId("");
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
    loadModels();
    toggleModalState();

    setTitle("");
    setIsTitleValid(true);
    setDescription("");
    setIsDescriptionValid(true);
    setBrandId("");
  };

  return (
    <Modal
      trigger={
        <Button onClick={toggleModalState} className={isEdit ? "table-action-btn" : "generic-create-btn"}>
          {" "}
          {isEdit ? <Icon name="pencil" /> : <span>{componentName}</span>}
        </Button>
      }
      closeIcon
      open={isModalOpen}
      onClose={handleCloseModal}
    >
      <Modal.Header>{componentName} a model</Modal.Header>
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
            label="Brand"
            options={brandOptions}
            placeholder="Brand"
            // value={model.brand ? model.brand.title : ''}
            onChange={(e, { value }) => setBrandId(value)}
          />
          <Button type="submit" color="teal" fluid size="small" loading={isLoading} primary>
            Submit
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

ModelForm.defaultProps = {
  model: {},
  brandsOptions: [],
};

export default ModelForm;
