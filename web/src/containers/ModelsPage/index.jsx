import React from "react";
import { createModel } from "../../services/modelsService";
import ModelForm from "../../components/ModelsComponents/ModelForm";
import ModelsList from "../../components/ModelsComponents/ModelsList";
import { Input } from "semantic-ui-react";
import useList from "src/helpers/useList";
import { useContext } from "react";
import { OrganizationContext } from "src/contexts";
import { useAPI } from "src/helpers/useFetch";

const searchFields = "*";

function useBrands() {
  return useAPI("/api/brands?showAll=true", searchFields);
}
function useModels() {
  return useList("/api/models", searchFields);
}

function ModelsPage(props) {
  const [models, { total, pages }, search, goto, sort, filters, modelsStatus, refresh] = useModels();
  const [{ data: brands } = { data: [] }, , , , , , brandsStatus, ,] = useBrands();
  const organizationId = useContext(OrganizationContext);

  const handleSearch = (event) => {
    search(event.target.value);
  };

  const clearSearch = () => {
    search("");
  };

  const handlePageChange = (_, d) => {
    goto(d.activePage);
  };

  const brandsOptions = brands.map(({ _id, title }) => ({
    text: title,
    value: _id,
  }));

  return (
    <div className="container">
      <h2>Models</h2>
      <ModelForm
        componentName={"Create"}
        brandOptions={brandsOptions}
        addToast={props.addToast}
        loadModels={refresh}
        submit={(req) => createModel(req, organizationId)}
      />
      <div>
        <span>Total models: {total}</span>
        <div class="ui action input" style={{ marginLeft: 16 }}>
          <Input type="text" placeholder="Search..." onChange={handleSearch} value={filters.searchText} />
          <button class="ui icon button" onClick={clearSearch}>
            <i class="delete icon"></i>
          </button>
        </div>
      </div>
      <ModelsList
        addToast={props.addToast}
        brandOptions={brandsOptions}
        models={models}
        loadModels={refresh}
        onPageChange={handlePageChange}
        pages={pages}
        filters={filters}
      />
    </div>
  );
}

export default ModelsPage;
