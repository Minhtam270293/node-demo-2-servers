const express = require("express");
const axios = require("axios");
const app = express();
const port = 8080;

// 1) MIDDLEWARE
app.use(express.json());

const warehouseServerURL = "http://localhost:8081/api/v1/products";
// 2) ROUTE HANDLERS

const submitProduct = async (req, res) => {
  const { id, name, quantity } = req.body;

  if (!id || !name || !quantity || isNaN(quantity)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid product data",
    });
  }

  try {
    const response = await axios.post(warehouseServerURL, {
      id,
      name,
      quantity,
    });

    res.status(201).json({
      status: "success",
      message: response.data.message || "Product submitted successfully",
      data: response.data.data,
    });
  } catch (error) {
    console.error(
      "Error communicating with the warehouse server:",
      error.message
    );
    res.status(500).json({
      status: "error",
      message: "Error communicating with the warehouse server",
    });
  }
};

// 3) ROUTES

app.post("/submit_product", submitProduct);

// 4) START SERVER
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
