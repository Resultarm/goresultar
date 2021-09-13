import React, { Component } from "react";
import { Icon, Menu, Pagination, Table } from "semantic-ui-react";
import ModelForm from "../ModelForm";
import { createPageNavigation } from "../../../helpers/pagination";
import { updateModel } from "../../../services/modelsService";
import DeleteModel from "../DeleteModel";

class ModelsList extends Component {
  constructor(props) {
    super(props);

    this.createModelRow = this.createModelRow.bind(this);
    this.handlePaginationClick = this.handlePaginationClick.bind(this);
  }

  createModelRow = (model) => {
    return (
      <Table.Row key={model._id}>
        <Table.Cell>
          <ModelForm
            model={model}
            componentName={"Edit"}
            addToast={this.props.addToast}
            brandOptions={this.props.brandOptions}
            loadModels={this.props.loadModels}
            submit={(req) => updateModel(model._id, req)}
          />
        </Table.Cell>
        <Table.Cell>
          <DeleteModel
            addToast={this.props.addToast}
            id={model._id}
            title={model.title}
            loadModels={this.props.loadModels}
          />
        </Table.Cell>
        <Table.Cell>{model._id}</Table.Cell>
        <Table.Cell>{model.brand.title}</Table.Cell>
        <Table.Cell>{model.title}</Table.Cell>
        <Table.Cell>{model.description}</Table.Cell>
      </Table.Row>
    );
  };

  handlePaginationClick = (page) => {
    this.props.updatePageFilter({ page: page });
  };

  render() {
    const { pages, onPageChange, filters } = this.props;
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colspan={2} rowspan={2}>
              Actions
            </Table.HeaderCell>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Brand</Table.HeaderCell>
            <Table.HeaderCell>Titulo</Table.HeaderCell>
            <Table.HeaderCell>Descrição</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.props.models.map((model) => this.createModelRow(model))}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="20" style={{ textAlign: "right" }}>
              <Pagination
                activePage={filters.currentPage}
                totalPages={pages}
                onPageChange={onPageChange}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

export default ModelsList;
