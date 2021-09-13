import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Confirm, Dropdown, Form, Modal } from "semantic-ui-react";

function DropdownConfirmation({ onChange, options, defaultValue, children, color, size, basic }) {
  const { t } = useTranslation(["translation"]);
  const hasMounted = useRef();
  const [confirmValue, setConfirmValue] = useState(undefined);
  const [{ value, comment }, setValue] = useState({ value: defaultValue });
  const handleChange = (event, data) => {
    const opt = data.options.find(({ value }) => value === data.value);
    if (opt.confirm || opt.confirmWithComment) {
      setConfirmValue(opt);
    } else {
      setValue({ value: data.value });
    }
  };
  const handleSubmit = (e, data) => {
    setValue({
      value: confirmValue.value,
      comment: e.target.elements.comment.value,
    });
  };
  const confirm = () => {
    onChange(undefined, { value: confirmValue.value, comment });
    setConfirmValue(undefined);
  };

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    onChange(undefined, { value, comment });
  }, [value]);

  return (
    <>
      <Dropdown
        options={options}
        onChange={handleChange}
        value={value}
        icon=""
        trigger={
          <Button.Group color={color} size={size} basic={basic}>
            <Button style={{ width: 80 }}>{children}</Button>
            <Button icon="dropdown" />
          </Button.Group>
        }
      />
      {confirmValue?.confirm && (
        <Confirm
          open
          content={`${t("Are you sure you want to")} ${confirmValue.text} ?`}
          onCancel={() => setConfirmValue(undefined)}
          onConfirm={confirm}
          cancelButton={t("No")}
          confirmButton={t("Yes")}
        />
      )}

      {confirmValue?.confirmWithComment && (
        <Modal closeIcon open onClose={() => setConfirmValue(undefined)}>
          <Modal.Header>{t("Comment")}</Modal.Header>
          <Modal.Content>
            <Form onSubmit={handleSubmit}>
              <Form.TextArea name="comment" label={t("Comment")} maxLength={50} required />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" primary>
                  {t("Submit")}
                </Button>
              </div>
            </Form>
          </Modal.Content>
        </Modal>
      )}
    </>
  );
}

export default DropdownConfirmation;
