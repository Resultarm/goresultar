import React, { useState } from "react";
import { Button, ConfigProvider, Input, List, Popover } from "antd";
import { CommentOutlined, DeleteOutlined } from "@ant-design/icons";
import currencyFormatter from "src/helpers/currencyFormatterPrefix";
import DimensionFields from "src/components/DimensionFields";
import { InputNumberFmtd } from "src/components";
import { computeOrderTotal } from "src/helpers";
import "./styles.scss";
import { useMemo } from "react";

const CommentInput = ({ onChange, initialValue }) => {
  const [state, setState] = useState(initialValue);
  const handleAdd = (e) => {
    onChange(state);
  };
  return (
    <form id="comment-form" onSubmit={handleAdd}>
      <Input.TextArea name="comment" onChange={(e) => setState(e.target.value)} defaultValue={state}></Input.TextArea>
      <Button form="comment-form" type="primary" onClick={handleAdd}>
        {__("Add")}
      </Button>
    </form>
  );
};

const CommentInputPopover = ({ initialValue, onChange }) => {
  const [comment, setComment] = useState(initialValue);

  const handleVisibleChange = (visible) => {
    console.log("comment,visible :>> ", comment, visible);
    if (!visible) {
      onChange(comment);
    }
  };

  const commentInputEl = useMemo(() => {
    return <Input.TextArea onChange={(e) => setComment(e.target.value)} defaultValue={initialValue}></Input.TextArea>;
  }, [initialValue]);

  return (
    <Popover content={commentInputEl} onVisibleChange={handleVisibleChange} destroyTooltipOnHide>
      <Button icon={<CommentOutlined />} />
    </Popover>
  );
};

function SelectedProductListItem({ product, onCommentChange, onQuantityChange, onDelete, hideComment }) {
  const { _id, images = [], quantity, chargeDuration = "", comment } = product;
  const handleDelete = () => onDelete(_id);
  const handleQuantityChange = (quantity) => onQuantityChange(_id, quantity, product.measurementValue);
  const handleMeasurementValueChange = (value) => {
    onQuantityChange(_id, quantity, value);
  };

  const handleCommentChange = (value) => onCommentChange(_id, value);

  return (
    <List.Item style={{ display: "block" }}>
      <List.Item.Meta
        className="selected-product-meta"
        avatar={<img src={`/assets/${images[0]?.link}`} />}
        title={
          <div className="space-between">
            <div>{product.title + (chargeDuration ? ` (per ${chargeDuration})` : "")}</div>
            <div className="price">{currencyFormatter.format(computeOrderTotal([product]))}</div>
          </div>
        }
        description={
          <ConfigProvider componentSize="small">
            <div className="fields">
              {__("Q")}:{" "}
              <InputNumberFmtd
                style={{ width: 80, marginRight: 8 }}
                value={quantity}
                onChange={handleQuantityChange}
                step={0.01}
              />
              <DimensionFields
                onChange={handleMeasurementValueChange}
                measurementType={product.measurementType}
                value={product.measurementValue}
              />
              <div className="actions">
                {!hideComment && <CommentInputPopover onChange={handleCommentChange} initialValue={comment} />}
                <Button icon={<DeleteOutlined />} onClick={handleDelete} danger />
              </div>
            </div>
          </ConfigProvider>
        }
      ></List.Item.Meta>
    </List.Item>
  );
}

function SelectedProducts({ products, onQuantityChange, onCommentChange, onDelete, hideComment }) {
  return (
    <List
      className="selected-product-list"
      itemLayout="horizontal"
      dataSource={products}
      renderItem={(product) => (
        <SelectedProductListItem
          product={product}
          onQuantityChange={onQuantityChange}
          onCommentChange={onCommentChange}
          onDelete={onDelete}
          hideComment={hideComment}
        />
      )}
    />
  );
}

export default SelectedProducts;
