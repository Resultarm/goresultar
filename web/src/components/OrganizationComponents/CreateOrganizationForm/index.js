import React, { useState } from "react";
import { Button, Divider, Form, Icon, Modal } from "semantic-ui-react";
import { isTextValid } from "../../../helpers/validations";
import InputNumber from "../../InputNumber";
import { useEffect } from "react";
import ImageUpload from "../../ImageUpload";
import { useMemo } from "react";

const OrganizationForm = ({ org = {}, submit, addToast, componentName, loadOrgs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState(org.title);
  const [isTitleValid, setIsTitleValid] = useState(true);
  const [logoUrl, setLogoPath] = useState(org?.logoUrl);
  const [description, setDescription] = useState(org.description);
  const [isDescriptionValid, setIsDescriptionValid] = useState(true);
  const [branches, setBranches] = useState(org.branches || []);

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async () => {
    const isValid = isDescriptionValid && isTitleValid;
    if (!isValid || isLoading) {
      return;
    }
    setIsLoading(true);
    await submit({ title, description, branches, logoUrl })
      .then((resp) => {
        addToast(`Organization ${org.title ? "updated" : "created"} successfully`, { appearance: "success" });
        window.location.reload(); // refreshes organizaionts in dropdown in header
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
    loadOrgs();
    toggleModalState();

    setTitle("");
    setIsTitleValid(true);
    setDescription("");
    setIsDescriptionValid(true);
  };

  const addBranchItem = () => {
    setBranches([...branches, { id: branches.length }]);
  };
  const updateBranchItem = (propValue, propName, index) => {
    const newBranches = branches;
    newBranches[index][propName] = propValue;
    console.log("newBranches :>> ", newBranches);
    setBranches(newBranches);
  };

  useEffect(() => {
    setIsDescriptionValid(isTextValid(description, 5, 0));
  }, [description]);

  const defaultFileList = useMemo(() => {
    return logoUrl
      ? [
          {
            uid: "0",
            name: "logo.png",
            status: "done",
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            url: logoUrl,
          },
        ]
      : [];
  }, [logoUrl]);
  return (
    <Modal
      trigger={
        <Button onClick={toggleModalState} className={componentName === "Edit" ? "table-action-btn" : "generic-create-btn"}>
          {" "}
          {componentName === "Edit" ? <Icon name="pencil" /> : <span>{componentName}</span>}
        </Button>
      }
      closeIcon
      open={isModalOpen}
      onClose={handleCloseModal}
    >
      <Modal.Header>{componentName} a organization</Modal.Header>
      <Modal.Content>
        <Form name="createOrgForm" size="large">
          <Form.Input
            fluid
            placeholder="Titulo"
            label="Titulo"
            value={title}
            error={!isTitleValid}
            onChange={(ev) => setTitle(ev.target.value)}
            onBlur={() => setIsTitleValid(isTextValid(title, 3, 0))}
          />
          <Form.TextArea
            fluid
            placeholder="Descrição"
            label="Descrição"
            value={description}
            error={!isDescriptionValid}
            onChange={(ev) => setDescription(ev.target.value)}
          />
          <ImageUpload
            onUpload={({ message }) => setLogoPath(message)}
            action="/assets/upload?entity=organization"
            accept=".jpg, .jpeg"
            name="file"
            fileList={defaultFileList}
          />
          <Divider />
          {branches.map((branch, index) => (
            <React.Fragment key={branch._id}>
              <Form.Group widths="equal" key={branch._id}>
                <Form.Input
                  fluid
                  placeholder="Titulo"
                  label={"Branch # " + index + " title"}
                  value={branch.title}
                  error={!isTextValid(title, 3, 0)}
                  onChange={(ev) => updateBranchItem(ev.target.value, "title", index)}
                  onBlur={() => setIsTitleValid(isTextValid(title, 3, 0))}
                />

                <InputNumber
                  label="Phone Number"
                  onChange={(value) => updateBranchItem(value, "phoneNumber", index)}
                  defaultValue={branch.phoneNumber}
                />
              </Form.Group>
              <Form.TextArea
                fluid
                placeholder="Descrição"
                label={"Branch # " + index + " description"}
                defaultValue={branch.description}
                error={!isTextValid(branch.description, 3, 0)}
                onChange={(ev) => updateBranchItem(ev.target.value, "description", index)}
                // onBlur={() => setIsDescriptionValid(isTextValid(description))}
              />
            </React.Fragment>
          ))}
          <Form.Button fluid onClick={addBranchItem}>
            Add a branch
          </Form.Button>

          <Button onClick={handleFormSubmit} color="teal" fluid size="small" loading={isLoading} primary>
            Submit
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default OrganizationForm;
