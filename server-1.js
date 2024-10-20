const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const port = 8081;

// 1) MIDDLEWARE
app.use(express.json());
console.log("Hello from middleware");

const warehousePath = path.join(
  __dirname,
  "dev-data",
  "data",
  "warehouse.json"
);

const readWarehouseData = () => {
  const data = fs.readFileSync(warehousePath, "utf-8");
  return JSON.parse(data);
};

const writeWarehouseData = (data) => {
  fs.writeFile(warehousePath, JSON.stringify(data, null, 2), "utf-8");
};

// 2) ROUTE HANDLERS

const createProduct = (req, res) => {
  const warehouseData = readWarehouseData();

  const newId = Object.keys(warehouseData).length
    ? Math.max(...Object.keys(warehouseData).map((id) => parseInt(id))) + 1
    : 1;

  const newProduct = Object.assign({ id: newId }, req.body);

  warehouseData[newId] = newProduct;

  writeWarehouseData(warehouseData);

  res.status(201).json({
    status: "success",
    data: {
      product: newProduct,
    },
  });
};

const updateProduct = (req, res) => {
  const warehouseData = readWarehouseData();
  const { id, name, quantity } = req.body;

  if (!id || !name || !quantity || isNaN(quantity)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid product data",
    });
  }

  if (!warehouseData[id]) {
    return res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
  }

  warehouseData[id].quantity += quantity;

  writeWarehouseData(warehouseData);

  res.status(200).json({
    status: "success",
    message: `Product ${name} updated. New quantity: ${warehouseData[id].quantity}`,
    data: {
      product: warehouseData[id],
    },
  });
};

// 3) ROUTES
const productRouter = express.Router();

productRouter.route("/").post(createProduct);
productRouter.route("/:id").patch(updateProduct);

app.use("/api/v1/products", productRouter);

// 4) START SERVER
app.listen(port, () => {
  console.log(`Warehouse server running on port ${port}`);
});
