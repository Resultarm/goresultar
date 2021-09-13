import React, { useState } from "react";
import { Table as AntdTable, Button } from "antd";
import RoleFormModal from "./RoleFormModal";

const columns = [
  { title: __("Role"), dataIndex: "title", key: "title" },
  { title: __("Permissions"), dataIndex: "permissions", key: "permissions" },
];

function Table({ data, status, columns }) {
  return <AntdTable dataSource={data} columns={columns} />;
}

function RolesAndPermissions() {
  const [shouldShowAddModal, setShouldShowModal] = useState(false);
  const showAddModal = () => setShouldShowModal(true);
  const closeAddModal = () => setShouldShowModal(false);

  return (
    <div>
      <Button onClick={showAddModal} type="primary">
        {__("Add")} {__("Role")}
      </Button>
      <Table data={[]} columns={columns} />
      {shouldShowAddModal && <RoleFormModal />}
    </div>
  );
}

export default RolesAndPermissions;
