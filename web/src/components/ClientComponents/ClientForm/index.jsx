import React, { useState } from "react";
import { Button, Form, Icon, Modal } from "semantic-ui-react";

import "./styles.css";
import { isTextValid } from "../../../helpers/validations";

const ClientForm = ({ client, submit, addToast, componentName, loadClients }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [firstName, setName] = useState(client.firstName);
  const [isNameValid, setIsNameValid] = useState(true);

  const [isLastNameValid, setIsLastNameValid] = useState(true);
  const [lastName, setLastName] = useState(client.lastName);

  const [address, setAddress] = useState(client.address);
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState(client.cellNumber);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  //todo extract into helpers
  const phoneNumberValidation = (text) => {
    return text.length >= 7;
  };

  const handleFormSubmit = async () => {
    const isValid = isTextValid(firstName, 3, 0) && isTextValid(lastName, 3, 0);
    if (!isValid || isLoading) {
      return;
    }
    setIsLoading(true);
    await submit({ firstName, lastName, cellNumber: phoneNumber, address })
      .then((resp) => addToast(`Client ${client.id ? "updated" : "created"} successfully`, { appearance: "success" }))
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
    loadClients();
    toggleModalState();
  };

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
      <Modal.Header>{componentName} a client</Modal.Header>
      <Modal.Content>
        <div className={"create-client-form"}>
          <Form firstName="createDepForm" size="large" onSubmit={handleFormSubmit}>
            <Form.Input
              fluid
              placeholder="First Name"
              value={firstName}
              error={!isNameValid}
              onChange={(ev) => setName(ev.target.value)}
              onBlur={() => setIsNameValid(isTextValid(firstName, 3, 0))}
            />
            <Form.Input
              fluid
              placeholder="Last Name"
              value={lastName}
              error={!isLastNameValid}
              onChange={(ev) => setLastName(ev.target.value)}
              onBlur={() => setIsLastNameValid(isTextValid(lastName, 3, 0))}
            />
            <Form.Input
              fluid
              placeholder="Phone Number"
              value={phoneNumber}
              error={!isPhoneNumberValid}
              onChange={(ev) => setPhoneNumber(ev.target.value)}
              onBlur={() => setIsPhoneNumberValid(phoneNumberValidation(phoneNumber))}
            />
            <Form.Input
              fluid
              placeholder="Address"
              value={address}
              error={!isAddressValid}
              onChange={(ev) => setAddress(ev.target.value)}
              onBlur={() => setIsAddressValid(isTextValid(address, 3, 0))}
            />
            <Button type="submit" color="teal" fluid size="small" loading={isLoading} primary>
              Submit
            </Button>
          </Form>
        </div>
      </Modal.Content>
    </Modal>
  );
};

ClientForm.defaultProps = {
  client: {},
};

export default ClientForm;
