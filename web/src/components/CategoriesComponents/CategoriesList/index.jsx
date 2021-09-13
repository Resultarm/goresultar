import React, { Component } from "react";
import { Icon, Menu, Pagination, Table } from "semantic-ui-react";
import CategoryForm from "../CategoryForm";
import { updateCategory } from "../../../services/categoriesService";
import { createPageNavigation } from "../../../helpers/pagination";
import DeleteCategory from "../DeleteCategory";

class CategoriesList extends Component {
  constructor(props) {
    super(props);

    this.createCategoryRow = this.createCategoryRow.bind(this);
    this.handlePaginationClick = this.handlePaginationClick.bind(this);
  }

  createCategoryRow = (cat) => {
    return (
      <Table.Row key={cat._id}>
        <Table.Cell>
          <CategoryForm
            category={cat}
            componentName={"Edit"}
            addToast={this.props.addToast}
            departmentOptions={this.props.departmentOptions}
            loadCategories={this.props.loadCategories}
            submit={(req) => updateCategory(cat._id, req)}
          />
        </Table.Cell>
        <Table.Cell>
          <DeleteCategory
            addToast={this.props.addToast}
            id={cat._id}
            title={cat.title}
            loadCategories={this.props.loadCategories}
          />
        </Table.Cell>
        <Table.Cell>{cat._id}</Table.Cell>
        <Table.Cell>{cat.title}</Table.Cell>
        <Table.Cell>{cat.department ? cat.department.title : ""}</Table.Cell>
        <Table.Cell>{cat.description}</Table.Cell>
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
            <Table.HeaderCell>Titulo</Table.HeaderCell>
            <Table.HeaderCell>Departamento</Table.HeaderCell>
            <Table.HeaderCell>Descrição</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.props.categories.map((cat) => this.createCategoryRow(cat))}
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
  }
}

export default CategoriesList;
