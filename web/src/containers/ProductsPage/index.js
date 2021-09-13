import React, { useMemo } from "react";

import Spinner from "./../../components/Spinner";
import "./styles.css";
import { Input } from "semantic-ui-react";
import ProductList from "src/components/ProductComponents/ProductList";
import ServiceFormModal from "src/components/ProductComponents/ServiceFormModal";
import ProductKitFormModal from "./ProductKitFormModal";

import { useState } from "react";
import { useEffect } from "react";
import OrgAwareButton from "src/components/OrgAwareButton";
import { useProduct } from "src/hooks";
import ProductFormModal from "./ProductFormModal";

import {
  useDepartmentOptions,
  useBrandOptions,
  useCategoryOptions,
  useSubCategoryOptions,
  useModelOptions,
  useProductList,
  useProviderOptions,
} from "src/hooks";

import { useTranslation } from "react-i18next";
import { Select } from "antd";
import { navigate } from "@reach/router";

const defaultFilterFields = { departmentId: undefined, brandId: undefined };
const filterer = ({ departmentId, brandId }) => (product) => {
  return (departmentId ? product.departmentId === departmentId : true) && (brandId ? product.brandId === brandId : true);
};

function ProductsPage({ location, addToast }) {
  const { t } = useTranslation(["translation"]);
  const filterFields = useMemo(
    () => ({ ...defaultFilterFields, ...Object.fromEntries(new URLSearchParams(location.search)) }),
    [] // don't put location.search. replacing history will empties filters
  );
  const { data: products, total, pages, search, goto, filters, status: productsStatus, refresh } = useProductList(
    undefined,
    filterFields,
    filterer
  );

  const { changeStatus, status: changeStatusStatus } = useProduct();
  const [shouldShowCreateKitModal, setShouldShowCreateKitModal] = useState(false);
  const [kitToEdit, setKitToEdit] = useState(undefined);
  const [shouldShowAddServiceModal, setShouldShowAddServiceModal] = useState(false);
  const [shouldShowAddModal, setShouldShowAddModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(undefined);
  const [lowStockAlerted, setLowStockAlerted] = useState(false);

  const { options: departmentOptions } = useDepartmentOptions(productToEdit?.organizationId);
  const [brandOptions] = useBrandOptions(productToEdit?.organizationId);
  const [modelOptions] = useModelOptions(productToEdit?.organizationId);
  const [categoryOptions] = useCategoryOptions(productToEdit?.organizationId);
  const [subCategoryOptions] = useSubCategoryOptions(productToEdit?.organizationId);
  const { options: providerOptions } = useProviderOptions(productToEdit?.organizationId);

  const options = {
    departmentOptions,
    brandOptions,
    modelOptions,
    categoryOptions,
    subCategoryOptions,
    providerOptions,
  };

  const showAddModal = () => setShouldShowAddModal(true);
  const closeAddModal = () => setShouldShowAddModal(false);

  const showAddServiceModal = () => setShouldShowAddServiceModal(true);

  const showCreateKitModal = () => {
    setShouldShowCreateKitModal(true);
  };

  const closeEditModal = () => setProductToEdit(undefined);

  useEffect(() => {
    if (!lowStockAlerted) {
      const shouldAlert = (products || []).some((p) => !p.isService && p.totalUnits <= (p.minStockThreshold || 0));

      if (shouldAlert) {
        addToast(t("You have few product with low stock"), {
          appearance: "warning",
          autoDismissTimeout: 10000,
        });
        setLowStockAlerted(true);
      }
    }
  }, [lowStockAlerted, products]);

  const handleSearch = (event) => {
    search(event.target.value);
  };

  const clearSearch = () => {
    search("");
  };

  const handleCloseKitModal = () => {
    setShouldShowCreateKitModal(false);
    setKitToEdit(undefined);
  };

  const afterKitSave = () => {
    handleCloseKitModal();
    refresh();
  };

  const handleProductFormClose = () => {
    closeAddModal();
    closeEditModal();
  };

  const afterProductSave = () => {
    closeAddModal();
    closeEditModal();
    refresh();
  };

  const closeServiceModal = () => {
    setShouldShowAddServiceModal(false);
    setProductToEdit(undefined);
  };

  const afterServiceSave = () => {
    closeServiceModal();
    refresh();
  };

  useEffect(() => {
    if (changeStatusStatus.isSuccess) {
      refresh();
    }
  }, [changeStatusStatus]);

  useEffect(() => {
    navigate("/products", { replace: true });
  }, []);

  return productsStatus.isLoading ? (
    <Spinner />
  ) : (
    <div className={"container"}>
      <h2 style={{ display: "inline" }}>Produtos</h2>
      <span style={{ marginLeft: 16, marginRight: 16 }}>
        {t("Total")}: {total}
      </span>
      <div class="ui action input" style={{ marginLeft: 16, marginRight: 16 }}>
        <Input type="text" placeholder="Search..." onChange={handleSearch} value={filters.searchText} />
        <button class="ui icon button" onClick={clearSearch}>
          <i class="delete icon"></i>
        </button>
      </div>
      <Select
        defaultValue={filters.values.departmentId}
        onChange={filters.handlers.departmentId}
        style={{ width: 200, marginRight: 16 }}
        placeholder={t("Department")}
        options={departmentOptions.map(({ value, label }) => ({ value, label }))}
        allowClear
        showSearch
      ></Select>
      <Select
        defaultValue={filters.values.brandId}
        onChange={filters.handlers.brandId}
        style={{ width: 200, marginRight: 16 }}
        placeholder={t("Brand")}
        options={brandOptions.map(({ value, label }) => ({ value, label }))}
        allowClear
        showSearch
      ></Select>
      <OrgAwareButton type="primary" className="generic-create-btn" onClick={showAddModal}>
        {t("Add")} {t("Product")}
      </OrgAwareButton>
      <OrgAwareButton type="primary" className="generic-create-btn" onClick={showCreateKitModal}>
        {t("Create")} {t("Kit")}
      </OrgAwareButton>
      <OrgAwareButton type="primary" className="generic-create-btn" onClick={showAddServiceModal}>
        {t("Add")} {t("Service")}
      </OrgAwareButton>
      <ProductList
        options={options}
        loadProducts={refresh}
        filters={filters}
        addToast={addToast}
        products={products}
        showKitModal={setKitToEdit}
        setProductToEdit={setProductToEdit}
        pages={pages}
        onPageChange={goto}
        changeStatus={changeStatus}
      />

      {(shouldShowCreateKitModal || kitToEdit) && (
        <ProductKitFormModal
          onClose={handleCloseKitModal}
          afterSave={afterKitSave}
          okText={`${kitToEdit ? t("Update") : t("Add")} ${t("Kit")}`}
          initialValue={kitToEdit}
        />
      )}

      {(shouldShowAddModal || (productToEdit && !productToEdit.isService)) && (
        <ProductFormModal
          onClose={handleProductFormClose}
          okText={`${productToEdit ? t("Update") : t("Add")} ${t("Product")}`}
          afterSave={afterProductSave}
          initialValue={productToEdit}
        />
      )}

      {(productToEdit?.isService || shouldShowAddServiceModal) && (
        <ServiceFormModal
          okText={productToEdit ? t("Update") + " " + t("Service") : t("Add") + " " + t("Service")}
          afterSave={afterServiceSave}
          initialValue={productToEdit}
          onClose={closeServiceModal}
        />
      )}
    </div>
  );
}

export default ProductsPage;
