import React from "react";

const OrganizationAddr = ({ organization }) => {
  if (!organization) return null;

  return (
    <div>
      <div style={{ width: 60 }}>
        <img style={{ maxWidth: "100%", maxHeight: "100%" }} src={organization.logoUrl}></img>
      </div>
      <div>
        <strong>{organization.title}</strong>
      </div>
      <div>{organization.description}</div>
      <div>{organization.phoneNumber}</div>
    </div>
  );
};

export default OrganizationAddr;
