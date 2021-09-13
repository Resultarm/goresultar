import { useAPI } from "src/helpers/useFetch";
export { useAPI } from "src/helpers/useFetch";
export { default as useList } from "src/helpers/useListv2";
export { default as useFetch } from "src/helpers/useFetch";
export { default as useProduct } from "./useProduct";
export { default as useServiceList } from "./useServiceList";
export { default as useProductList } from "./useProductList";
export { default as useClientOptions } from "./useClientOptions";
export { default as useOrder } from "./useOrder";
export { default as useTaskList } from "./useTaskList";
export { default as useVehicleList } from "./useVehicleList";
export { default as useOrders } from "./useOrders";
export { default as useExpenses } from "./useExpenses";
export { default as usePermissions } from "./usePermissions";
export { statuses as orderStatuses } from "./useOrders";
export { orderProcesses } from "./useOrders";
export { default as useTask } from "./useTask";
export { default as useVehicle } from "./useVehicle";
export { default as useVehicleOptions } from "./useVehicleOptions";
export { default as useOrganization } from "./useOrganization";
export { default as useStaffOptions } from "./useStaffOptions";
export { default as useCategories } from "./useCategories";
export { default as useServiceStatusOptions } from "./useServiceStatusOptions";
export { default as useDepartments } from "./useDepartments";
export { default as useBrands } from "./useBrands";
export { default as useSubcategories } from "./useSubcategories";
export { default as useBrand } from "./useBrand";
export { default as useDepartmentOptions } from "./useDepartmentOptions";
export { default as useOrderOptions } from "./useOrderOptions";
export { default as useModels } from "./useModels";
export { default as useDepartment } from "./useDepartment";
export { default as useLogin } from "./useLogin";
export { default as useClients } from "./useClients";
export { default as useClient } from "./useClient";
export { default as useRoles } from "./useRoles";
export { default as useProductv2 } from "./useProductv2";
export { default as useQuotationToOrder } from "./useQuotationToOrder";
export { default as useDepartmentProfits } from "./useDepartmentProfits";
export { default as useProductProfits } from "./useProductProfits";

export function useDepartmentsWithProfits(organizationId) {
  const [departments = [], status, refresh] = useAPI("/api/departments-with-profits");
  const filteredDepartments = departments.filter((o) => (organizationId ? o.organizationId === organizationId : true));
  return [filteredDepartments, status, refresh];
}

const noOrgHeader = { headers: { OrganizationID: "" } };
export function useOrganizations() {
  const [{ data: organizations } = { data: [] }, status, refresh] = useAPI("/api/v2/organizations", noOrgHeader);

  return [organizations, status, refresh];
}

export function useCheques() {
  const [{ data: cheques } = { data: [] }, status, refresh] = useAPI("/api/cheques");

  return [cheques, status, refresh];
}

export function useNewCheques(organizationId) {
  const [cheques, status, refresh] = useCheques();
  const newCheques = cheques.filter((c) => c.status === "new" && (organizationId ? c.organizationId === organizationId : true));
  return [newCheques, status, refresh];
}

export function useBrandOptions(organizationId) {
  // const options = useMemo(
  //   () =>
  //     organizationId
  //       ? { headers: { OrganizationID: organizationId } }
  //       : undefined,
  //   [organizationId]
  // );
  const [{ data: brands } = { data: [] }, status, refresh] = useAPI("/api/brands");
  const brandOptions = brands
    .filter((o) => (organizationId ? o.organizationId === organizationId : true))
    .map(({ _id, title, departmentId }) => ({
      value: _id,
      text: title,
      label: title,
      departmentId,
    }));

  return [brandOptions, status, refresh];
}
export function useModelOptions(organizationId) {
  const [{ data: models } = { data: [] }, status, refresh] = useAPI("/api/models");
  const modelOptions = models
    .filter((o) => (organizationId ? o.organizationId === organizationId : true))
    .map(({ _id, title, brandId }) => ({
      value: _id,
      text: title,
      brandId,
    }));

  return [modelOptions, status, refresh];
}
export function useCategoryOptions(organizationId) {
  const [{ data: categories } = { data: [] }, status, refresh] = useAPI("/api/categories");
  const categoryOptions = categories
    .filter((o) => (organizationId ? o.organizationId === organizationId : true))
    .map(({ _id, title, departmentId }) => ({
      value: _id,
      text: title,
      departmentId,
    }));

  return [categoryOptions, status, refresh];
}

export function useCategoryOptionsAntdv2(organizationId) {
  const [categoryOptions, status, refresh] = useCategoryOptions(organizationId);

  return { options: categoryOptions.map((o) => ({ ...o, label: o.text })), status, refresh };
}

export function useSubCategoryOptions(organizationId) {
  const [{ data: subCategories } = { data: [] }, status, refresh] = useAPI("/api/subcategories");
  const subCategoryOptions = subCategories
    .filter((o) => (organizationId ? o.organizationId === organizationId : true))
    .map(({ _id, title, categoryId }) => ({
      value: _id,
      text: title,
      categoryId,
    }));

  return [subCategoryOptions, status, refresh];
}

export function useProviderOptions() {
  const [{ data: users } = { data: [] }, status, refresh] = useAPI("/api/admins");
  const providerOptions = users
    .filter((u) => u.roleNumber === 5)
    .map(({ _id, name }) => ({
      value: _id,
      text: name,
      label: name,
    }));
  return { options: providerOptions, status, refresh };
}

export function useSubCategoryOptionsAntdv2(organizationId) {
  const [subCategoryOptions, status, refresh] = useSubCategoryOptions(organizationId);

  return { options: subCategoryOptions.map((o) => ({ ...o, label: o.text })), status, refresh };
}
