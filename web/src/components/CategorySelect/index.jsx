import React from "react";
import { Cascader } from "antd";
import { useDepartments, useCategories, useSubcategories } from "src/hooks";

function useDepartmentTree() {
  const { all: departments } = useDepartments();
  const { all: categories } = useCategories();
  const { all: subcategories } = useSubcategories();

  const depTree = departments.map((dep) => {
    return {
      value: dep._id,
      label: dep.title,
      children: categories
        .filter((cat) => cat.departmentId === dep._id)
        .map((cat) => {
          return {
            value: cat._id,
            label: cat.title,
            children: subcategories
              .filter((subcat) => subcat.categoryId === cat._id)
              .map((subcat) => {
                return {
                  value: subcat._id,
                  label: subcat.title,
                };
              }),
          };
        }),
    };
  });

  return { options: depTree };
}

function CategorySelect({ onChange, value }) {
  const { options: departmentTreeOptions } = useDepartmentTree();
  return <Cascader options={departmentTreeOptions} onChange={onChange} changeOnSelect value={value} />;
}

export default CategorySelect;
