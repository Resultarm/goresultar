import React, { useState } from "react";
import { Button, Confirm, Input, Pagination, Table } from "semantic-ui-react";
import DepartmentForm from "../../components/DepartmentsComponents/DepartmentForm";
import { createDepartment, deleteDepartment } from "./../../services/departmentsService";
import { updateDepartment } from "./../../services/departmentsService";
import useList from "src/helpers/useList";
import { useContext } from "react";
import { OrganizationContext } from "src/contexts";
import { useTranslation } from "react-i18next";
import "./styles.css";

const searchFields = "*";

function useDepartments() {
  return useList("/api/departments", searchFields);
}

function DepartmentsPage(props) {
  const { t } = useTranslation(["translation"]);
  const [departments, { total, pages }, search, goto, sort, filters, departmentsStatus, refresh] = useDepartments();

  const [shouldShowAddModal, setShouldShowAddModal] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState();
  const [selectedForDelete, setSelectedForDelete] = useState();
  const organizationId = useContext(OrganizationContext);

  const handleSearch = (e) => search(e.target.value);

  const closeAddModal = () => setShouldShowAddModal(false);
  const showAddModal = () => setShouldShowAddModal(true);

  const closeEditModal = () => setSelectedForEdit(undefined);
  const handleEdit = (department) => () => setSelectedForEdit(department);
  const handleEditSuccess = () => {
    closeEditModal();
    refresh();
  };

  const handleDelete = (id) => () => setSelectedForDelete(id);
  const closeDeleteConfirmation = () => setSelectedForDelete(undefined);
  const handleDeleteSuccess = () => {
    closeDeleteConfirmation();
    refresh();
  };

  const handlePageChange = (_, d) => {
    goto(d.activePage);
  };

  return (
    <div className="department-container">
      <h2>{t("Departments")}</h2>
      <div className="list-actions">
        <span>
          {t("Total")}: {total}
        </span>
        <div>
          <Input type="text" placeholder={t("Search")} onChange={handleSearch} value={filters.searchText} />
          <button class="ui icon button" onClick={() => search("")}>
            <i class="delete icon"></i>
          </button>
        </div>
        <Button onClick={showAddModal} primary>
          {t("Add")} {t("Department")}
        </Button>
      </div>

      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colspan={2} rowspan={2}>
              {t("Actions")}
            </Table.HeaderCell>
            <Table.HeaderCell>{t("ID")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Title")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Description")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {departments.map((dep) => (
            <Table.Row key={dep._id}>
              <Table.Cell>
                <Button icon="edit" basic onClick={handleEdit(dep)} size="mini" />
              </Table.Cell>
              <Table.Cell>
                <Button icon="trash alternate" negative basic onClick={handleDelete(dep._id)} size="mini" />
              </Table.Cell>
              <Table.Cell>{dep._id}</Table.Cell>
              <Table.Cell>{dep.title}</Table.Cell>
              <Table.Cell>{dep.description}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="20" style={{ textAlign: "right" }}>
              <Pagination activePage={filters.currentPage} totalPages={pages} onPageChange={handlePageChange} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
      {shouldShowAddModal && (
        <DepartmentForm
          componentName={t("Create")}
          addToast={props.addToast}
          loadDepartments={refresh}
          submit={(req) => createDepartment(req, organizationId).then(() => closeAddModal())}
          onClose={closeAddModal}
        />
      )}
      {selectedForEdit && (
        <DepartmentForm
          department={selectedForEdit}
          componentName={t("Edit")}
          addToast={props.addToast}
          loadDepartments={refresh}
          submit={(req) => updateDepartment(selectedForEdit._id, req).then(handleEditSuccess)}
          onClose={closeEditModal}
        />
      )}
      {selectedForDelete && (
        <Confirm
          open
          content={t("Are you sure you want to delete") + " ?"}
          onCancel={closeDeleteConfirmation}
          onConfirm={() => deleteDepartment(selectedForDelete).then(handleDeleteSuccess)}
          cancelButton={t("No")}
          confirmButton={t("Delete")}
        />
      )}
    </div>
  );
}

export default DepartmentsPage;
