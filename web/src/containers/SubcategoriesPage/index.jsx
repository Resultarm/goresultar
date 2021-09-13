import React from "react";
import SubcategoryForm from "../../components/SubcategoriesComponents/SubcategoryForm";
import SubcategoriesList from "../../components/SubcategoriesComponents/SubcategoriesList";
import { createSubcategory } from "../../services/subcategoriesService";
import { Input } from "semantic-ui-react";
import useList from "src/helpers/useList";
import { useContext } from "react";
import { OrganizationContext } from "src/contexts";
import { useAPI } from "src/helpers/useFetch";
const searchFields = "*";

function useSubCategories() {
  return useList("/api/subcategories", searchFields);
}

function useCategories() {
  return useAPI("/api/categories");
}

function SubcategoriesPage(props) {
  const [
    subCategories,
    { total, pages },
    search,
    goto,
    sort,
    filters,
    subCategoriesStatus,
    refresh,
  ] = useSubCategories();
  const [{ data: categories } = { data: [] }] = useCategories();
  const organizationId = useContext(OrganizationContext);

  const handleSearch = (event) => {
    search(event.target.value);
  };

  const clearSearch = () => {
    search("");
  };

  const categoryOptions = categories.map(({ _id, title }) => ({
    value: _id,
    text: title,
  }));

  return (
    <div className="categories-container container">
      <h2>Subcategories</h2>
      <SubcategoryForm
        componentName={"Create"}
        categoryOptions={categoryOptions}
        addToast={props.addToast}
        loadSubcategories={refresh}
        submit={(r) => createSubcategory(r, organizationId)}
      />

      <div>
        <span>Total subcategories: {total}</span>
        <div class="ui action input" style={{ marginLeft: 16 }}>
          <Input
            type="text"
            placeholder="Search..."
            onChange={handleSearch}
            value={filters.searchText}
          />
          <button class="ui icon button" onClick={clearSearch}>
            <i class="delete icon"></i>
          </button>
        </div>
      </div>

      <SubcategoriesList
        addToast={props.addToast}
        categoryOptions={categoryOptions}
        subcategories={subCategories}
        filters={filters}
        loadSubcategories={refresh}
        onPageChange={goto}
        pages={pages}
      />
    </div>
  );
}

export default SubcategoriesPage;
