import React, { Component } from "react";
import { Icon, Menu, Table } from "semantic-ui-react";
import DepartmentForm from "../DepartmentForm";
import { updateDepartment } from "../../../services/departmentsService";
import { createPageNavigation } from "../../../helpers/pagination";
import DeleteDepartment from "../DeleteDepartment";

class DepartmentsList extends Component {
  constructor(props) {
    super(props);

    this.createDepartmentRow = this.createDepartmentRow.bind(this);
    this.handlePaginationClick = this.handlePaginationClick.bind(this);
  }

  createDepartmentRow = (dep) => {
    return (
      <Table.Row key={dep._id}>
        <Table.Cell>
          <DepartmentForm
            department={dep}
            componentName={"Edit"}
            addToast={this.props.addToast}
            loadDepartments={this.props.loadDepartments}
            submit={(req) => updateDepartment(dep._id, req)}
          />
        </Table.Cell>{" "}
        <Table.Cell>
          <DeleteDepartment
            addToast={this.props.addToast}
            id={dep._id}
            loadDepartments={this.props.loadDepartments}
            title={dep.title}
          />
        </Table.Cell>
        <Table.Cell>{dep._id}</Table.Cell>
        <Table.Cell>{dep.title}</Table.Cell>
        <Table.Cell>{dep.description}</Table.Cell>
      </Table.Row>
    );
  };

  handlePaginationClick = (page) => {
    this.props.updatePageFilter({ page: page });
  };

  render() {
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colspan={2} rowspan={2}>
              Actions
            </Table.HeaderCell>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Titulo</Table.HeaderCell>
            <Table.HeaderCell>Descrição</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.props.departments.map((dep) => this.createDepartmentRow(dep))}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="12">
              <Menu floated="right" pagination>
                <Menu.Item as="a" icon>
                  <Icon name="chevron left" />
                </Menu.Item>
                <Menu.Item as="a" icon>
                  <Icon name="chevron right" />
                </Menu.Item>
              </Menu>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

export default DepartmentsList;
