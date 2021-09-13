import { Button, Input, List, Popover } from "antd";
import React, { useMemo, useState, useCallback } from "react";
import { useProductList } from "src/hooks";
import { useTranslation } from "react-i18next";
import DimensionFields from "src/components/DimensionFields";
import "./styles.scss";
import { MEASUREMENT_DEFAULT_VALUES, UNIT } from "../DimensionFields/constants";
import { useEffect } from "react";
import { cf, nf } from "src/helpers";

const filterer =
  ({ showKits }) =>
  (p) =>
    showKits ? true : (p.kitProducts || []).length === 0;

const MeasurementValuePopover = ({ measurementType, children, onAdd }) => {
  const [value, setValue] = useState(MEASUREMENT_DEFAULT_VALUES[measurementType]);

  const handleAdd = useCallback(() => {
    onAdd(value);
  }, [value, onAdd]);

  const form = useMemo(() => {
    return (
      <div className="measurement-value-popover-form">
        <DimensionFields value={value} onChange={setValue} measurementType={measurementType} />
        <Button type="primary" onClick={handleAdd}>
          {__("Add")}
        </Button>
      </div>
    );
  }, [measurementType, value, handleAdd]);
  return <Popover content={form}>{children}</Popover>;
};

const ProductAddButton = ({ product, onAdd, addText }) => {
  const handleMeasurementValueChange = (selectedMeasurementValue) => {
    const p = {
      ...product,
      measurementValue: selectedMeasurementValue,
    };
    onAdd(p);
  };

  const handleAdd = () => {
    // for unit measurement type
    handleMeasurementValueChange([]);
  };

  const shouldDisableAdd = product.totalUnits === 0 && !product.isService;
  if (product.measurementType === UNIT) {
    return (
      <Button onClick={handleAdd} size="small" disabled={shouldDisableAdd}>
        + {addText}
      </Button>
    );
  }

  return (
    <MeasurementValuePopover measurementType={product.measurementType} onAdd={handleMeasurementValueChange}>
      <Button size="small" disabled={shouldDisableAdd}>
        + {addText}
      </Button>
    </MeasurementValuePopover>
  );
};

function ProductSelect({ className, onAdd, onAddAsNew, showServices = true, showKits = true, enableOutOfStock = false }) {
  const { t } = useTranslation("translation");

  const filterFields = useMemo(() => {
    return { showServices, showKits };
  }, [showServices, showKits]);

  const { all: products, status: productsStatus, search } = useProductList(undefined, filterFields, filterer);

  const handleSearch = (e) => {
    e.preventDefault();

    search(e.target.value);
  };

  const handleProductAdd = (product) => onAdd(product);
  const handleProductAddAsNew = (product) => onAddAsNew(product);

  useEffect(() => {
    let code = "";
    let reading = false;

    const handleScannerInput = (e) => {
      //usually scanners throw an 'Enter' key at the end of read

      if (e.key === "Enter") {
        if (code.length >= 13) {
          /// code ready to use
          const scannedProduct = products.find(({ ISBN }) => code === ISBN);

          code = "";
          if (scannedProduct) onAdd(scannedProduct);
        }
      } else {
        code += e.key; //while this is not an 'enter' it stores the every key
      }
      //run a timeout of 200ms at the first read and clear everything
      if (!reading) {
        reading = true;
        setTimeout(() => {
          code = "";
          reading = false;
        }, 200);
      } //200 works fine for me but you can adjust it
    };
    document.addEventListener("keydown", handleScannerInput);

    return () => {
      document.removeEventListener("keydown", handleScannerInput);
    };
  }, [products, onAdd]);

  return (
    <div className={`product-select ${className}`}>
      <Input.Search onChange={handleSearch} allowClear />
      <List
        itemLayout="horizontal"
        dataSource={products}
        loading={productsStatus.isLoading}
        renderItem={(product) => (
          <List.Item
            key={product._id}
            className={product.totalUnits === 0 && !product.isService && !enableOutOfStock ? "disabled" : undefined}
            actions={[
              <ProductAddButton product={product} onAdd={handleProductAddAsNew} addText={__("Add as Another")} />,
              <ProductAddButton product={product} onAdd={handleProductAdd} addText={__("Add")} />,
            ]}
          >
            <List.Item.Meta
              avatar={<img src={`/assets/${(product.images || [])[0]?.link}`} />}
              title={
                <>
                  <div>{product.title}</div>
                  {!product.isService && (
                    <span style={{ color: product.totalUnits === 0 ? "red" : "inherit" }}>
                      {t("In Stock")}: {nf(product.totalUnits)}{" "}
                    </span>
                  )}
                  <span>
                    {__("Price")}: {cf(product.price)}
                  </span>
                </>
              }
            ></List.Item.Meta>
          </List.Item>
        )}
      ></List>
    </div>
  );
}

export default ProductSelect;
