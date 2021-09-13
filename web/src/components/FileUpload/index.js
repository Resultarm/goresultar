import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "semantic-ui-react";

const UploadFile = ({ uploadHandler }) => {
  const { t } = useTranslation("translation");
  const [file, setFile] = useState(undefined);

  const fileChangedHandler = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <div>
      <input type="file" onChange={fileChangedHandler} />
      <Button onClick={() => uploadHandler(file)} color="blue" inverted>
        <Icon name="checkmark" /> {t("Upload")}
      </Button>
    </div>
  );
};

export default UploadFile;
