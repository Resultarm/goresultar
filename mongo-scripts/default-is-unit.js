db.products.find().forEach((p) => {
  if (!p.measurementType || p.measurementType === "unit") {
    db.products.update(
      { _id: p._id },
      { $set: { measurementType: "unit", measurementValue: [] } }
    );
  }
});
