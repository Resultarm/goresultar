import React from "react";
import { Cascader } from "antd";
import { useBrands, useModels } from "src/hooks";

function useBrandTreeOptions() {
  const { all: brands } = useBrands();
  const { all: models } = useModels();

  const brandTree = brands.map((brand) => {
    const thisBrandModels = models
      .filter((model) => model.brandId === brand._id)
      .map((model) => {
        return {
          value: model._id,
          label: model.title,
        };
      });
    return {
      value: brand._id,
      label: brand.title,
      children: thisBrandModels,
      disabled: thisBrandModels.length === 0,
    };
  });

  return { options: brandTree };
}

function BrandSelect({ onChange, value }) {
  const { options: brandTreeOptions } = useBrandTreeOptions();
  return <Cascader options={brandTreeOptions} onChange={onChange} changeOnSelect value={value} />;
}

export default BrandSelect;
