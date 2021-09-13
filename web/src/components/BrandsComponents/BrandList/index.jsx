import React, { Component } from "react";
import { Pagination, Table } from "semantic-ui-react";
import BrandForm from "../BrandForm";
import { updateBrand } from "../../../services/brandsService";
import DeleteBrand from "./DeleteBrand";
import { withTranslation } from "react-i18next";

class BrandsList extends Component {
  handlePaginationClick = (page) => {
    this.props.updatePageFilter({ page: page });
  };

  render() {
    const { brands, pages, onPageChange, filters, departmentOptions, t } = this.props;
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colspan={2} rowspan={2}>
              {t("Actions")}
            </Table.HeaderCell>
            <Table.HeaderCell>{t("ID")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Title")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Department")}</Table.HeaderCell>
            <Table.HeaderCell>{t("Description")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {brands.map((brand) => (
            <Table.Row key={brand._id}>
              <Table.Cell>
                <BrandForm
                  brand={brand}
                  componentName={t("Edit")}
                  addToast={this.props.addToast}
                  loadBrands={this.props.loadBrands}
                  submit={(req) => updateBrand(brand._id, req)}
                  departmentOptions={departmentOptions}
                />
              </Table.Cell>
              <Table.Cell>
                <DeleteBrand
                  addToast={this.props.addToast}
                  id={brand._id}
                  loadBrands={this.props.loadBrands}
                  title={brand.title}
                />
              </Table.Cell>
              <Table.Cell>{brand._id}</Table.Cell>
              <Table.Cell>{brand.title}</Table.Cell>
              <Table.Cell>{brand.department?.title}</Table.Cell>
              <Table.Cell>{brand.description}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan="20" style={{ textAlign: "right" }}>
              <Pagination activePage={filters.currentPage} totalPages={pages} onPageChange={onPageChange} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

export default withTranslation("translation")(BrandsList);
