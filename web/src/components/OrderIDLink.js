import React from "react";
import { Link } from "@reach/router";

const OrderIDLink = ({ order }) => (order ? <Link to={`/orders/view/${order._id}`}>{order.orderId}</Link> : null);

export default OrderIDLink;
