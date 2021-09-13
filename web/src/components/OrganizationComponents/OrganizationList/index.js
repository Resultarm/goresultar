import React from "react";
import { Button, List, Pagination, Table } from "semantic-ui-react";
import OrganizationForm from "../CreateOrganizationForm";
import { updateOrganization } from "../../../services/organizationsService";

const OrganizationList = ({ orgs, filters, pages, onPageChange, addToast, loadOrgs, handleDelete }) => {
  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Actions</Table.HeaderCell>
          <Table.HeaderCell>OrganizationID</Table.HeaderCell>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Titulo</Table.HeaderCell>
          <Table.HeaderCell>Descrição</Table.HeaderCell>
          <Table.HeaderCell>Branches </Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {orgs.map((org) => (
          <Table.Row>
            <Table.Cell>
              <Button
                style={{ marginRight: 16 }}
                icon="trash alternate"
                negative
                basic
                onClick={handleDelete(org._id)}
                size="mini"
              />
              <OrganizationForm
                org={org}
                submit={(req) => updateOrganization(org._id, req)}
                addToast={addToast}
                componentName={"Edit"}
                loadOrgs={loadOrgs}
              />
            </Table.Cell>
            <Table.Cell>{org._id}</Table.Cell>
            <Table.Cell>{org.organizationId}</Table.Cell>
            <Table.Cell>{org.title}</Table.Cell>
            <Table.Cell>{org.description}</Table.Cell>

            <Table.Cell>
              <List bulleted>{org.branches && org.branches.map((branch) => <List.Item>{branch.title}</List.Item>)}</List>
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
              onPageChange={(_, { activePage }) => onPageChange(activePage)}
            />
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
};

export default OrganizationList;
