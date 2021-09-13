import React, { Component } from "react";
import { Icon, Menu, Pagination, Table } from "semantic-ui-react";
import SubcategoryForm from "../SubcategoryForm";
import { createPageNavigation } from "../../../helpers/pagination";
import { updateSubcategory } from "../../../services/subcategoriesService";
import DeleteSubcategory from "../DeleteSubcategory";

class SubcategoriesList extends Component {
  constructor(props) {
    super(props);

    this.createSubcategoryRow = this.createSubcategoryRow.bind(this);
    this.handlePaginationClick = this.handlePaginationClick.bind(this);
  }

  createSubcategoryRow = (cat) => {
    return (
      <Table.Row key={cat._id}>
        <Table.Cell>
          <SubcategoryForm
            category={cat}
            componentName={"Edit"}
            addToast={this.props.addToast}
            categoryOptions={this.props.categoryOptions}
            loadSubcategories={this.props.loadSubcategories}
            submit={(req) => updateSubcategory(cat._id, req)}
          />
        </Table.Cell>
        <Table.Cell>
          <DeleteSubcategory
            addToast={this.props.addToast}
            id={cat._id}
            title={cat.title}
            loadSubcategories={this.props.loadSubcategories}
          />
        </Table.Cell>
        <Table.Cell>{cat._id}</Table.Cell>
        <Table.Cell>{cat.title}</Table.Cell>
        <Table.Cell>{cat.category.title}</Table.Cell>
        <Table.Cell>{cat.description}</Table.Cell>
      </Table.Row>
    );
  };

  handlePaginationClick = (page) => {
    this.props.updatePageFilter({ page: page });
  };

  render() {
    const { pages, filters, onPageChange } = this.props;
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colspan={2} rowspan={2}>
              Actions
            </Table.HeaderCell>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Titulo</Table.HeaderCell>
            <Table.HeaderCell>Category</Table.HeaderCell>
            <Table.HeaderCell>Descrição</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.props.subcategories.map((cat) =>
            this.createSubcategoryRow(cat)
          )}
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

export default SubcategoriesList;
