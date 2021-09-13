import React, { useEffect } from "react";
import { createOrganization } from "../../services/organizationsService";
import OrganizationList from "../../components/OrganizationComponents/OrganizationList";
import OrganizationForm from "../../components/OrganizationComponents/CreateOrganizationForm";
import { useOrganization } from "src/hooks";
import { Input } from "semantic-ui-react";
import useList from "src/helpers/useList";
import confirmCallback from "src/components/confirmCallback";

const searchFields = "*";

function useOrganizations() {
  return useList("/api/v2/organizations", searchFields);
}

function OrganizationsPage(props) {
  const [organizations, { total, pages }, search, goto, sort, filters, status, refresh] = useOrganizations();
  const { del, status: actionStatus } = useOrganization();
  const handleSearch = (event) => {
    search(event.target.value);
  };

  const handleDelete = (_id) => () => {
    confirmCallback("This will delete everything related to organization. Do you want to continue ?", "Delete", () => del(_id));
  };

  const clearSearch = () => {
    search("");
  };

  useEffect(() => {
    if (actionStatus.isError || actionStatus.isSuccess) {
      props.addToast(actionStatus.message, {
        appearance: actionStatus.toString().toLowerCase(),
      });

      if (actionStatus.isSuccess) {
        // clears org dropdown, if current selected org deleted
        localStorage.removeItem("organizationId");
        window.location.reload();
      }
    }
  }, [actionStatus]);

  return (
    <div className="container">
      <h2>Organizations</h2>
      <OrganizationForm addToast={props.addToast} loadOrgs={refresh} componentName={"Create"} submit={createOrganization} />
      <div>
        <span>Total organizations: {total}</span>
        <div class="ui action input" style={{ marginLeft: 16 }}>
          <Input type="text" placeholder="Search..." onChange={handleSearch} value={filters.searchText} />
          <button class="ui icon button" onClick={clearSearch}>
            <i class="delete icon"></i>
          </button>
        </div>
      </div>

      <OrganizationList
        orgs={organizations}
        addToast={props.addToast}
        filters={filters}
        loadOrgs={refresh}
        pages={pages}
        onPageChange={goto}
        handleDelete={handleDelete}
      />
    </div>
  );
}

export default OrganizationsPage;
