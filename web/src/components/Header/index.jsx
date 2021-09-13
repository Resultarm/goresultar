import React, { Component } from "react";

import { Link } from "@reach/router";
import { Dropdown, Menu } from "semantic-ui-react";
import { Select } from "antd";

import { getOrganizations } from "src/services/organizationsService";
import { OrganizationContext } from "src/contexts";
import "./styles.css";
import { withTranslation } from "react-i18next";

const localeOptions = [
  { value: "pt-BR", label: "Português" },
  { value: "en-US", label: "English" },
];

class MenuExampleStackable extends Component {
  static contextType = OrganizationContext;
  state = { organizations: [] };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  componentDidMount() {
    if (this.props.admin.roleNumber === 1) {
      getOrganizations().then((res) => {
        this.setState({
          organizations: (res.data || [])
            .filter(({ _id }) =>
              (this.props.admin.organizationIds || []).length > 0 ? this.props.admin.organizationIds.includes(_id) : true
            )
            .map(({ _id, title }) => ({
              value: _id,
              label: title,
            })),
        });
      });
    } else {
      this.props.onOrganizationChange(this.props.admin.organizationIds[0]);
    }
  }

  handleOrganizationChange = (organizationId) => {};

  render() {
    const { logout, admin, t, onLocaleChange, locale } = this.props;

    return (
      <Menu stackable className="custom-menu" inverted>
        <Menu.Item>
          <Link exact to="/" className="logo-link">
            {t("Management")}
          </Link>
        </Menu.Item>

        {[1, 2, 3, 8].includes(admin.role.roleNumber) && (
          <Menu.Item>
            <Dropdown
              inverted
              text={t("Departament Properties")}
              // active={activeItem === "testimonials"}
              // onClick={this.handleItemClick}
            >
              <Dropdown.Menu>
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/departments" className={"submenuBtn "}>
                    {t("Departaments")}
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/brands" className={"submenuBtn"}>
                    {t("Brands")}
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/models" className={"submenuBtn"}>
                    {t("Models")}
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/categories" className={"submenuBtn"}>
                    {t("Categories")}
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/subcategories" className={"submenuBtn"}>
                    {t("Subcategories")}
                  </Link>
                </Dropdown.Item>
                {[1, 2, 3, 8].includes(admin.role.roleNumber) && (
                  <Dropdown.Item name={t("products")} onClick={this.handleItemClick}>
                    <Link exact activeClassName="active" to="/products" className="submenuBtn">
                      {t("Products")}
                    </Link>
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        )}
        <Menu.Item>
          <Dropdown
            inverted
            text={t("Order Properties")}
            // active={activeItem === "testimonials"}
            // onClick={this.handleItemClick}
          >
            <Dropdown.Menu>
              <Dropdown.Item>
                <Link exact activeClassName="active" to="/orders" className={"menuBtn"}>
                  {t("Orders")}
                </Link>
              </Dropdown.Item>
              {[1, 2, 3, 8].includes(admin.role.roleNumber) && (
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/clients" className={"menuBtn"}>
                    {t("Clients")}
                  </Link>
                </Dropdown.Item>
              )}
              {[1, 2, 3, 8].includes(admin.roleNumber) && (
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/tasks" className={"menuBtn"}>
                    {t("Tasks")}
                  </Link>
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
        {[1, 2, 3].includes(admin.roleNumber) && (
          <Menu.Item>
            <Dropdown
              inverted
              text={t("Administration")}
              // active={activeItem === "testimonials"}
              // onClick={this.handleItemClick}
            >
              <Dropdown.Menu>
                {[1, 2].includes(admin.roleNumber) && (
                  <Dropdown.Item>
                    <Link exact activeClassName="active" to="/orgs" className={"menuBtn"}>
                      {t("Organizations")}
                    </Link>
                  </Dropdown.Item>
                )}
                {[1, 2, 3].includes(admin.roleNumber) && (
                  <Dropdown.Item>
                    <Link exact activeClassName="active" to="/admins" className={"menuBtn"}>
                      {t("Admins")}
                    </Link>
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        )}
        {[1, 2, 3].includes(admin?.roleNumber) && (
          <Menu.Item>
            <Dropdown inverted text={t("Finance")}>
              <Dropdown.Menu>
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/cheques" className={"menuBtn"}>
                    {t("Cheque Mgmt")}
                  </Link>
                </Dropdown.Item>

                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/expenses" className={"menuBtn"}>
                    {t("Expense Mgmt")}
                  </Link>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        )}
       {[1, 2].includes(admin?.roleNumber) && (
        <Menu.Item>
          <Dropdown inverted text={t("Utilities")}>
            <Dropdown.Menu>
              
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/wood-price-calculator" className="menuBtn">
                    {t("Wood Price Calculator")}
                  </Link>
                </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
       )}
        {[1, 2, 3, 8].includes(admin?.roleNumber) && (
        <Menu.Item>
          <Dropdown inverted text={t("Assets")}>
            <Dropdown.Menu>
              
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/vehicles" className="menuBtn">
                    {t("Vehicles")}
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/properties" className="menuBtn">
                    {t("properties")}
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/tools" className="menuBtn">
                    {t("tools")}
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link exact activeClassName="active" to="/others" className="menuBtn">
                    {t("outros")}
                  </Link>
                </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
       )}
        {[1, 2, 8].includes(admin?.roleNumber) && (
          <Menu.Item>
            <Select
              style={{ width: 200 }}
              options={this.state.organizations}
              placeholder={t("Organization")}
              onChange={this.props.onOrganizationChange}
              allowClear
              value={this.context}
            />
          </Menu.Item>
        )}
        <Menu.Item>
          <Select placeholder="locale" options={localeOptions} onChange={onLocaleChange} defaultValue={locale}></Select>
        </Menu.Item>
        <Menu.Item onClick={logout}>{t("Logout")}</Menu.Item>
      </Menu>
    );
  }
}

export default withTranslation("translation")(MenuExampleStackable);
