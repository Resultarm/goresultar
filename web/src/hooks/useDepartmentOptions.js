import useDepartments from "./useDepartments";

function useDepartmentOptions() {
  const { all: departments, status } = useDepartments();
  const departmentOptions = departments.map(({ _id, title, organizationId }) => ({
    value: _id,
    text: title,
    label: title,
    organizationId,
  }));

  return { options: departmentOptions, status };
}

export default useDepartmentOptions;
