import React from "react";
import CategoryForm from "../../components/CategoriesComponents/CategoryForm";
import CategoriesList from "../../components/CategoriesComponents/CategoriesList";
import { createCategory } from "../../services/categoriesService";

import "./styles.css";
import { Input } from "semantic-ui-react";
import { useContext } from "react";
import { OrganizationContext } from "src/contexts";
import { useAPI } from "src/helpers/useFetch";
import { useCategories } from "src/hooks";

const searchFields = "*";

function useDepartments() {
  return useAPI("/api/departments", searchFields);
}
function CategoriesPage(props) {
  const { data: categories, total, pages, search, goto, filters, refresh } = useCategories();
  const [{ data: departments } = { data: [] }, , , , , , , ,] = useDepartments();
  const organizationId = useContext(OrganizationContext);

  const handleSearch = (event) => search(event.target.value);
  const clearSearch = () => search("");

  const departmentOptions = departments.map(({ _id, title }) => ({
    value: _id,
    text: title,
  }));

  return (
    <div className="categories-container container">
      <h2>Categories</h2>

      <CategoryForm
        componentName={"Create"}
        departmentOptions={departmentOptions}
        addToast={props.addToast}
        loadCategories={refresh}
        submit={(r) => createCategory(r, organizationId)}
      />
      <div>
        <strong>Total categories: {total}</strong>
        <div class="ui action input" style={{ marginLeft: 16 }}>
          <Input type="text" placeholder="Search..." onChange={handleSearch} value={filters.searchText} />
          <button class="ui icon button" onClick={clearSearch}>
            <i class="delete icon"></i>
          </button>
        </div>
      </div>

      <CategoriesList
        addToast={props.addToast}
        departmentOptions={departmentOptions}
        categories={categories}
        loadCategories={refresh}
        onPageChange={goto}
        filters={filters}
        pages={pages}
      />
    </div>
  );
}

export default CategoriesPage;
