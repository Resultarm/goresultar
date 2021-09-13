import React from "react";

import { Button, Icon, Pagination, Table } from "semantic-ui-react";
import DeleteProduct from "../DeleteProduct";

import currencyFormatter from "../../../helpers/currencyFormatterPrefix";
import { useServiceStatusOptions } from "src/hooks";
import DropdownConfirmation from "src/components/DropdownConfirmation";
import { useTranslation } from "react-i18next";
import { nf } from "src/helpers";

const statusColors = {
  Available: "teal",
  "Not Available": undefined,
  "On Hold": "blue",
};

const emptyPredicate = (o) => !!o;

const ProductsList = ({
  products,
  addToast,
  showKitModal,
  loadProducts,
  setProductToEdit,
  onPageChange,
  pages,
  changeStatus,
  filters,
}) => {
  const { t } = useTranslation(["translation"]);
  const { data: statusOptions } = useServiceStatusOptions();

  const handleStatusChange = (id) => (_, data) => {
    changeStatus(id, { status: data.value });
  };

  return (
    <Table celled style={{ marginBottom: 30 }}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colspan={3}>{t("Actions")}</Table.HeaderCell>
          <Table.HeaderCell>{t("Title")}</Table.HeaderCell>
          <Table.HeaderCell>{t("Description")}</Table.HeaderCell>
          <Table.HeaderCell>{t("Total Units")}</Table.HeaderCell>
          <Table.HeaderCell>{t("Department")}</Table.HeaderCell>
          <Table.HeaderCell>{t("Brand")}</Table.HeaderCell>
          <Table.HeaderCell>{t("Cost")}</Table.HeaderCell>
          <Table.HeaderCell>{t("Price")}</Table.HeaderCell>
          <Table.HeaderCell>{t("Status")}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {products.map((product) => (
          <Table.Row key={product._id}>
            <Table.Cell>
              {product.kitProducts.length > 0 ? (
                <Button className="table-action-btn" onClick={() => showKitModal(product)}>
                  <Icon name="pencil alternate" />
                </Button>
              ) : (
                <Button className="table-action-btn" onClick={() => setProductToEdit(product)}>
                  <Icon name="pencil alternate" />
                </Button>
              )}
            </Table.Cell>
            <Table.Cell>
              <a href={`/products/view/${product._id}`}>
                <Icon name="eye "></Icon>
              </a>
            </Table.Cell>
            <Table.Cell>
              <DeleteProduct title={product.title} id={product._id} addToast={addToast} loadProducts={loadProducts} />
            </Table.Cell>
            <Table.Cell>{product.title}</Table.Cell>
            <Table.Cell>{product.description}</Table.Cell>
            {product.isService ? (
              <Table.Cell></Table.Cell>
            ) : (
              <Table.Cell>
                {product.totalUnits <= (product.minStockThreshold || 0) && (
                  <span style={{ fontFamily: "Segoe UI Emoji" }}>⚠️ </span>
                )}
                {nf(product.totalUnits)}
              </Table.Cell>
            )}
            <Table.Cell>
              {[product.department.title, product.category?.title, product.subcategory?.title].filter(emptyPredicate).join("/")}
            </Table.Cell>
            <Table.Cell>{[product.brand.title, product.model?.title].filter(emptyPredicate).join("/")}</Table.Cell>
            <Table.Cell>{currencyFormatter.format(product.cost)}</Table.Cell>
            <Table.Cell>{currencyFormatter.format(product.price)}</Table.Cell>

            <Table.Cell>
              {
                <DropdownConfirmation
                  options={statusOptions}
                  onChange={handleStatusChange(product._id)}
                  defaultValue={product.status}
                  color={statusColors[product.status]}
                  size="mini"
                  basic
                >
                  {t(product.status)}
                </DropdownConfirmation>
              }
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

ProductsList.defaultProps = {
  products: [],
  isLoading: true,
};

export default ProductsList;
