import React, { useContext } from "react";
import { OrganizationContext } from "src/contexts";
import { Button, Tooltip } from "antd";
import { useTranslation } from "react-i18next";

function OrgAwareButton({ disabled, ...props }) {
  const organizationId = useContext(OrganizationContext);
  const { t } = useTranslation("translation");
  const Wrapper = !organizationId
    ? ({ children }) => <Tooltip title={t("Org not selected")}>{children}</Tooltip>
    : React.Fragment;
  return (
    <Wrapper>
      <Button disabled={!organizationId || disabled} {...props} />
    </Wrapper>
  );
}

export default OrgAwareButton;
