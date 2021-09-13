import React, { useEffect, useMemo } from "react";

import { Button, Confirm, Input, Pagination, Table } from "semantic-ui-react";

import { useState } from "react";
import UserFormModal from "./UserFormModal";
import useFetch from "../../helpers/useFetch";
import useList from "src/helpers/useList";
import NumberFormat from "react-number-format";
const searchFields = "*";

const Span = ({ value }) => <span>{value}</span>;

const msgTemplate = {
  SUCCESS: (n, a) => `${n} ${a}${!a.endsWith("e") ? "e" : ""}d successfully!`,
  ERROR: (n, a) => (a === "status change" ? `failed to change status of ${n}` : `failed to ${a} ${n}`),
};

function useUser() {
  const [[id, payload, method], setPayload] = useState([]);
  const opts = useMemo(() => {
    if (method === "add" && payload) return ["/api/admins", { method: "POST", body: JSON.stringify(payload) }];
    if (method === "update" && id && payload) return [`/api/admins/${id}`, { method: "PUT", body: JSON.stringify(payload) }];
    if (method === "delete" && id) return [`/api/admins/${id}`, { method: "DELETE" }];

    if (method === "status change" && id && payload)
      return [`/api/admins/${id}/status`, { method: "POST", body: JSON.stringify(payload) }];
    return [undefined, undefined];
  }, [payload, method, id]);
  const [, status] = useFetch(...opts);

  const add = (payload) => setPayload([undefined, payload, "add"]);
  const edit = (payload, id) => setPayload([id, payload, "update"]);
  const del = (id) => setPayload([id, undefined, "delete"]);

  status.action = method;
  status.message = msgTemplate[status.code] ? msgTemplate[status.code]("user", method) : "";

  return [add, edit, del, status];
}

function useUsers() {
  return useList("/api/admins", searchFields);
}

function AdminsPage(props) {
  const [add, edit, del, actionStatus] = useUser();
  const [users, { total, pages }, search, goto, , filters, , refresh] = useUsers();
  const [shouldShowAddModal, setShouldShowAddModal] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState();
  const [selectedForDelete, setSelectedForDelete] = useState();
  const closeEditModal = () => setSelectedForEdit(undefined);
  const handleEdit = (i) => () => setSelectedForEdit(i);

  const handleDelete = (id) => () => setSelectedForDelete(id);
  const closeDeleteConfirmation = () => setSelectedForDelete(undefined);

  const handleSearch = (event) => {
    search(event.target.value);
  };

  const clearSearch = () => {
    search("");
  };

  useEffect(() => {
    if (actionStatus.isError || actionStatus.isSuccess) {
      props.addToast(actionStatus.message, {
        appearance: actionStatus.toString().toLowerCase(),
      });

      if (actionStatus.isSuccess) {
        closeAddModal();
        closeEditModal();
        closeDeleteConfirmation();
        refresh();
      }
    }
  }, [actionStatus]);

  const showAddModal = () => setShouldShowAddModal(true);
  const closeAddModal = () => setShouldShowAddModal(false);

  return (
    <div className="container">
      <div>
        <h2 style={{ display: "inline", marginRight: 16 }}>Admins</h2>
        <span>Total admins: {total}</span>
        <div class="ui action input" style={{ marginLeft: 16 }}>
          <Input type="text" placeholder="Search..." onChange={handleSearch} value={filters.searchText} />
          <button class="ui icon button" onClick={clearSearch}>
            <i class="delete icon"></i>
          </button>
        </div>
        <div style={{ float: "right" }}>
          <Button onClick={showAddModal} primary>
            Add User
          </Button>
        </div>
      </div>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Actions</Table.HeaderCell>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>First Name</Table.HeaderCell>
            <Table.HeaderCell>Last Name</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Landline Number</Table.HeaderCell>
            <Table.HeaderCell>Role</Table.HeaderCell>
            <Table.HeaderCell>Organization</Table.HeaderCell>
            <Table.HeaderCell>Documents</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {users.map((user) => (
            <Table.Row key={user._id}>
              <Table.Cell>
                <Button icon="edit" basic onClick={handleEdit(user)} size="mini" />
                <Button icon="trash alternate" negative basic onClick={handleDelete(user._id)} size="mini" />
              </Table.Cell>
              <Table.Cell>{user._id}</Table.Cell>
              <Table.Cell>{user.firstName}</Table.Cell>
              <Table.Cell>{user.lastName}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>
                {<NumberFormat customInput={Span} defaultValue={user.landlineNumber} format="(##) ##### - ####" readOnly />}
              </Table.Cell>
              <Table.Cell>{(user.role || {}).name}</Table.Cell>
              <Table.Cell>{user.organizations.map(({ title }) => title).join(",")}</Table.Cell>
              <Table.Cell>
                {(user.documents || []).map(({ name, url }) => (
                  <>
                    <a href={url} target="_blank">
                      {name}
                    </a>
                    <br />
                  </>
                ))}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="20" style={{ textAlign: "right" }}>
              <Pagination
                activePage={filters.currentPage}
                totalPages={pages}
                onPageChange={(_, { activePage }) => goto(activePage)}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
      {shouldShowAddModal && <UserFormModal okText={__("Add User")} onClose={closeAddModal} onSave={add} />}
      {selectedForEdit && (
        <UserFormModal
          onSave={(payload) => edit(payload, selectedForEdit._id)}
          onClose={closeEditModal}
          initialValues={selectedForEdit}
          okButtonProps={{ disabled: actionStatus.isLoading }}
          okText={__("Update User")}
        />
      )}
      {selectedForDelete && (
        <Confirm
          open
          content="Deseja mesmo remover o Usuário?"
          onCancel={closeDeleteConfirmation}
          onConfirm={() => del(selectedForDelete)}
          cancelButton="Não"
          confirmButton="Sim, Remover"
        />
      )}
    </div>
  );
}

export default AdminsPage;
