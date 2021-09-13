import { getDepartments } from "../services/departmentsService";
import { getCategories } from "../services/categoriesService";
import { getBrands } from "../services/brandsService";
import { getModels } from "../services/modelsService";
import { getSubcategories } from "../services/subcategoriesService";
import { getClients } from "../services/clientService";
import { getProducts } from "../services/productService";
import { getAdminRoles } from "../services/adminService";
import { getOrganizations } from "../services/organizationsService";

export const staticFormOptions = {
  unitOptions: [
    { key: "unit", text: "Unit", value: "unit" },
    { key: "size", text: "Size", value: "size" },
    // {key: 'w', text: 'Weight', value: 'w'},
    // {key: 's', text: 'Size', value: 's'},
  ],
  volumeOptions: [
    { key: "l", text: "Liter", value: 1 },
    { key: "m", text: "Milliliter", value: 2 },
    { key: "o", text: "Ounce", value: 3 },
    { key: "g", text: "Gallon", value: 4 },
    { key: "b", text: "Barrel", value: 5 },
  ],
  sizeOptions: [
    { key: "ml", text: "Millimeter", value: 1 },
    { key: "cm", text: "Centimeter", value: 2 },
    { key: "m", text: "Meter", value: 3 },
    { key: "sm", text: "SquareMeter", value: 4 },
    { key: "cbm", text: "CubicMeter", value: 5 },
    { key: "in", text: "Inch", value: 6 },
    { key: "ft", text: "Foot", value: 7 },
  ],
  sizev2Options: [
    { key: "linear", text: "linear", value: 1 },
    { key: "sqmeter", text: "sq. meter", value: 2 },
    { key: "cubicmeter", text: "cubic meter", value: 3 },
  ],
  weightOptions: [
    { key: "mg", text: "Milligram", value: 1 },
    { key: "g", text: "Gram", value: 2 },
    { key: "kg", text: "Kilogram", value: 3 },
    { key: "tn", text: "Tonne", value: 4 },
  ],
  paymentOptions: [
    { key: "cash", text: "Dinheiro", value: 1 },
    { key: "debit", text: "Debito", value: 2 },
    { key: "credit", text: "Credito", value: 3 },
    { key: "check", text: "Cheque", value: 4 },
    { key: "bc", text: "Bitcoins", value: 5 },
    { key: "dep", text: "Depositos", value: 6 },
    { key: "tr", text: "Transferencia", value: 7 },
    { key: "other", text: "other", value: 8 },
  ],
  statusOptions: [
    { key: 0, text: "All", value: null },
    { key: 1, text: "Open", value: 1 },
    { key: 2, text: "Partial", value: 2 },
    { key: 3, text: "Closed", value: 3 },
    { key: 4, text: "Quotation", value: 4 },
  ],
};
export const preparedepartmentsOptions = (addToast) => {
  const options = [];
  getDepartments({ showAll: true })
    .then((resp) =>
      resp.data.map((dep) =>
        options.push({
          text: dep.title,
          value: dep._id,
        })
      )
    )
    .catch((err) => addToast("Could not fetch departments", { appearance: "error" }));
  return options;
};

export const prepareCategoriesOptions = (addToast) => {
  const options = [];
  getCategories({ showAll: true })
    .then((resp) =>
      resp.data.map((cat) =>
        options.push({
          text: cat.title,
          value: cat._id,
          departmentId: cat.departmentId,
        })
      )
    )
    .catch((err) => addToast("Could not fetch categories", { appearance: "error" }));
  return options;
};

export const prepareModelsOptions = (addToast) => {
  const options = [];
  getModels({ showAll: true })
    .then((resp) =>
      resp.data.map((mod) =>
        options.push({
          text: mod.title,
          value: mod._id,
          brandId: mod.brandId,
        })
      )
    )
    .catch((err) => addToast("Could not fetch models", { appearance: "error" }));
  return options;
};

export const prepareBrandsOptions = (addToast) => {
  const options = [];
  getBrands({ showAll: true })
    .then((resp) =>
      resp.data.map((brand) =>
        options.push({
          text: brand.title,
          value: brand._id,
          departmentId: brand.departmentId,
        })
      )
    )
    .catch((err) => addToast("Could not fetch brands", { appearance: "error" }));
  return options;
};

export const prepareSubcategoriesOptions = (addToast) => {
  const options = [];
  getSubcategories({ showAll: true })
    .then((resp) =>
      resp.data.map((cat) =>
        options.push({
          text: cat.title,
          value: cat._id,
          categoryId: cat.categoryId,
        })
      )
    )
    .catch((err) => addToast("Could not fetch subcategories", { appearance: "error" }));
  return options;
};

export const prepareClientsOptions = (addToast) => {
  const options = [];
  getClients({ showAll: true })
    .then((resp) =>
      resp.data.map((client) =>
        options.push({
          text: client.firstName + " " + client.lastName,
          value: client.id,
        })
      )
    )
    .catch((err) => addToast("Could not fetch clients", { appearance: "error" }));
  return options;
};
export const prepareRolesOptions = (addToast) => {
  const options = [];
  getAdminRoles({ showAll: true })
    .then((resp) =>
      resp.data.map((role) =>
        options.push({
          text: role.name,
          value: role.roleNumber,
        })
      )
    )
    .catch((err) => addToast("Could not fetch admin roles", { appearance: "error" }));
  return options;
};

export const prepareOrganizationsOptions = (addToast) => {
  const options = [];
  getOrganizations({ showAll: true })
    .then((resp) =>
      resp.data.map((org) => {
        const branches = org.branches
          ? org.branches.map((branch) => ({
              text: branch.title,
              value: branch._id,
            }))
          : [];
        console.log("branches", branches);
        return options.push({
          text: org.title,
          value: org._id,
          branches: branches,
        });
      })
    )
    .catch((err) => addToast("Could not fetch organizations" + err, { appearance: "error" }));
  console.log(options);
  return options;
};

export const prepareProductsOptions = (addToast) => {
  const options = [];
  getProducts({ showAll: true })
    .then((resp) =>
      resp.data.map((prod) =>
        options.push({
          text: prod.title,
          value: prod._id,
          price: prod.price || 0,
        })
      )
    )
    .catch((err) => addToast("Could not fetch products/services", { appearance: "error" }));
  return options;
};

export const prepareOptions = (addToast) => {
  return {
    categoriesOptions: prepareCategoriesOptions(addToast),
    brandsOptions: prepareBrandsOptions(addToast),
    modelsOptions: prepareModelsOptions(addToast),
    subcategoriesOptions: prepareSubcategoriesOptions(addToast),
    departmentsOptions: preparedepartmentsOptions(addToast),
  };
};
