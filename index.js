const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
require("dotenv").config();
const port = process.env.PORT || 8000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `${process.env.DB_URI}`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const genericCollection = client
      .db("StoreManagement")
      .collection("generics");
    const companyCollection = client
      .db("StoreManagement")
      .collection("company");
    const categoryCollection = client
      .db("StoreManagement")
      .collection("categories");
    const productsCollection = client
      .db("StoreManagement")
      .collection("products");
    const purchaseInvoiceCollection = client
      .db("StoreManagement")
      .collection("purchaseInvoices");
    const soldInvoiceCollection = client
      .db("StoreManagement")
      .collection("soldInvoices");
    const usersCollection = client.db("StoreManagement").collection("users");

    //user api
    app.get("/api/get/users", async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        res.json(users);
      } catch (error) {
        res.status(500).send("Error fetching user data from the database");
      }
    });

    app.post("/api/add/user", async (req, res) => {
      const userData = req.body;

      try {
        // Check if a user with the same email already exists
        const existingUser = await usersCollection.findOne({
          email: userData.email,
        });

        if (existingUser) {
          return res.status(400).send("User with this email already exists");
        }

        // Insert the new user document
        const result = await usersCollection.insertOne(userData);
        res.send(result);
      } catch (error) {
        res.status(500).send("Error inserting user data into the database");
      }
    });

    // generics api
    app.get("/api/get/generics", async (req, res) => {
      try {
        const generics = await genericCollection.find({}).toArray();

        // Send the list of generics as a JSON response
        res.json(generics);
      } catch (error) {
        res.status(500).send("Error fetching generics from the database");
      }
    });

    app.post("/api/add/generic", async (req, res) => {
      const generic = req.body;
      generic.createdDate = new Date();

      try {
        // Check if a document with the same generic name already exists
        const existingGeneric = await genericCollection.findOne({
          generic: generic.generic,
        });

        if (existingGeneric) {
          // If a document with the same name exists, return an error response
          return res.status(400).send("Generic name already exists");
        }

        // If no duplicate exists, insert the new document
        const result = await genericCollection.insertOne(generic);
        res.send(result);
      } catch (error) {
        console.error("Database Insertion Error:", error);
        res.status(500).send("Error inserting data into the database");
      }
    });
    app.delete("/api/delete/generic/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const objectId = new ObjectId(id);

        const result = await genericCollection.deleteOne({ _id: objectId });

        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Generic deleted successfully" });
        } else {
          res.status(404).json({ message: "Generic not found" });
        }
      } catch (error) {
        console.error("Error deleting generic:", error);
        res.status(500).json({ message: "Error deleting generic" });
      }
    });
    // company api
    app.get("/api/get/companies", async (req, res) => {
      try {
        const companies = await companyCollection.find({}).toArray();

        // Send the list of companies as a JSON response
        res.json(companies);
      } catch (error) {
        res.status(500).send("Error fetching companies from the database");
      }
    });

    app.post("/api/add/company", async (req, res) => {
      const company = req.body;
      company.createdDate = new Date();

      try {
        // Check if a document with the same company name already exists
        const existingCompany = await companyCollection.findOne({
          company: company.company,
        });

        if (existingCompany) {
          // If a document with the same name exists, return an error response
          return res.status(400).send("Company name already exists");
        }

        // If no duplicate exists, insert the new document
        const result = await companyCollection.insertOne(company);
        res.send(result);
      } catch (error) {
        res.status(500).send("Error inserting data into the database");
      }
    });

    //category api
    app.get("/api/get/categories", async (req, res) => {
      try {
        const categories = await categoryCollection.find({}).toArray();

        // Send the list of categories as a JSON response
        res.json(categories);
      } catch (error) {
        res.status(500).send("Error fetching categories from the database");
      }
    });
    app.post("/api/add/category", async (req, res) => {
      const category = req.body;
      category.createdDate = new Date();

      try {
        // Check if a document with the same company name already exists
        const existingCategory = await categoryCollection.findOne({
          category: category.category,
        });

        if (existingCategory) {
          // If a document with the same name exists, return an error response
          return res.status(400).send("Category name already exists");
        }

        // If no duplicate exists, insert the new document
        const result = await categoryCollection.insertOne(category);
        res.send(result);
      } catch (error) {
        res.status(500).send("Error inserting data into the database");
      }
    });

    //product api
    app.get("/api/get/products", async (req, res) => {
      try {
        const products = await productsCollection.find({}).toArray();

        // Send the list of products as a JSON response
        res.json(products);
      } catch (error) {
        res.status(500).send("Error fetching products from the database");
      }
    });
    //update
    app.patch("/api/update/product/:id", async (req, res) => {
      const productId = req.params.id;
      const {
        product_purchase_price,
        stock,
        price,
        last_edited_date,
        last_editor_email,
      } = req.body;

      try {
        const result = await productsCollection.updateOne(
          { _id: new ObjectId(productId) },
          {
            $set: {
              product_purchase_price,
              stock,
              price,
              last_edited_date,
              last_editor_email,
            },
          }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Error updating product" });
      }
    });

    //patch for increase product stock
    app.patch("/api/increase/products/stock", async (req, res) => {
      const updatedProducts = req.body; // Array of products to update
      // console.log("Received request to update stock:", updatedProducts);

      try {
        // Assuming you have a database collection called productsCollection
        const productIdsToUpdate = updatedProducts.map(
          (product) => product.product_match_id
        );

        // Check if all product IDs in updatedProducts exist in the database
        const existingProducts = await productsCollection
          .find({
            product_match_id: { $in: productIdsToUpdate },
          })
          .toArray();

        // console.log("Existing products in the database:", existingProducts);

        // If any of the product IDs do not exist in the database, return an error response
        if (existingProducts.length !== updatedProducts.length) {
          const missingProductIds = updatedProducts
            .filter(
              (product) =>
                !existingProducts.some(
                  (p) => p.product_match_id === product.product_match_id
                )
            )
            .map((product) => product.product_match_id);

          return res.status(400).json({
            error: "One or more products do not exist in the database",
            missingProductIds,
          });
        }

        // Update the stock for each product in updatedProducts
        const updatePromises = updatedProducts.map(async (product) => {
          // Find the corresponding product in the database
          const existingProduct = existingProducts.find(
            (p) => p.product_match_id === product.product_match_id
          );

          // Calculate the new stock value by adding product_quantity to existing stock
          const newStock =
            existingProduct.stock + parseInt(product.product_quantity);
          await productsCollection.updateOne(
            { product_match_id: product.product_match_id },
            { $set: { stock: newStock } }
          );
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        console.log("Stock updated successfully");
        res.send("Stock updated successfully");
      } catch (error) {
        console.error("Error updating product stock:", error);
        res.status(500).send("Error updating product stock");
      }
    });
    //patch for decrease product stock
    app.patch("/api/decrease/products/stock", async (req, res) => {
      const decreasedProducts = req.body; // Array of products to decrease stock
      // console.log("Received request to decrease stock:", decreasedProducts);

      try {
        // Assuming you have a database collection called productsCollection
        const productIdsToDecrease = decreasedProducts.map(
          (product) => product.product_match_id
        );

        // Check if all product IDs in decreasedProducts exist in the database
        const existingProducts = await productsCollection
          .find({
            product_match_id: { $in: productIdsToDecrease },
          })
          .toArray();

        // console.log("Existing products in the database:", existingProducts);

        // If any of the product IDs do not exist in the database, return an error response
        if (existingProducts.length !== decreasedProducts.length) {
          const missingProductIds = decreasedProducts
            .filter(
              (product) =>
                !existingProducts.some(
                  (p) => p.product_match_id === product.product_match_id
                )
            )
            .map((product) => product.product_match_id);

          return res.status(400).json({
            error: "One or more products do not exist in the database",
            missingProductIds,
          });
        }

        // Decrease the stock for each product in decreasedProducts
        const updatePromises = decreasedProducts.map(async (product) => {
          // Find the corresponding product in the database
          const existingProduct = existingProducts.find(
            (p) => p.product_match_id === product.product_match_id
          );

          // Calculate the new stock value by subtracting product_quantity from existing stock
          const newStock =
            existingProduct.stock - parseInt(product.product_quantity);

          // Ensure stock does not go below zero
          if (newStock < 0) {
            return res.status(400).json({
              error: "Stock cannot be negative",
              productId: product.product_match_id,
            });
          }

          await productsCollection.updateOne(
            { product_match_id: product.product_match_id },
            { $set: { stock: newStock } }
          );
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);
        res.status(200).send("Stock decreased successfully");
      } catch (error) {
        res.status(500).send("Error decreasing product stock");
      }
    });
    app.post("/api/add/product", async (req, res) => {
      const product = req.body;
      product.createdDate = new Date();

      try {
        // Check if a document with the same product name already exists
        const existingProductName = await productsCollection.findOne({
          title: product.title,
        });

        if (existingProductName) {
          // If a document with the same name exists, return an error response
          return res.status(400).send("Product already exists");
        }

        // If no duplicate exists, insert the new document
        const result = await productsCollection.insertOne(product);
        res.send(result);
      } catch (error) {
        res.status(500).send("Error inserting data into the database");
      }
    });
    //delete
    app.delete("/api/delete/product/:id", async (req, res) => {
      const productId = req.params.id;

      try {
        const result = await productsCollection.deleteOne({
          _id: new ObjectId(productId),
        });

        if (result.deletedCount === 1) {
          res.json({ message: "Product deleted successfully" });
        } else {
          res.status(404).json({ message: "Product not found" });
        }
      } catch (error) {
        res.status(500).send("Error deleting product from the database");
      }
    });

    //api for purchase invoice
    app.get("/api/get/purchaseInvoices/byDate/:date", async (req, res) => {
      try {
        const dateParam = req.params.date;
        const startDate = new Date(dateParam);
        const endDate = new Date(dateParam);
        endDate.setDate(endDate.getDate() + 1); // Set the end date to the next day

        const filteredPurchaseInvoices = await purchaseInvoiceCollection
          .find({
            createdTime: {
              $gte: startDate,
              $lt: endDate,
            },
          })
          .toArray();

        res.status(200).json(filteredPurchaseInvoices);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving data");
      }
    });
    app.get("/api/get/purchaseInvoices", async (req, res) => {
      try {
        const purchaseInvoices = await purchaseInvoiceCollection
          .find({})
          .toArray();
        res.status(200).json(purchaseInvoices);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving data");
      }
    });
    //single purchase invoice
    app.get("/api/get/purchaseInvoice/:id", async (req, res) => {
      try {
        const invoiceId = req.params.id;
        const purchaseInvoice = await purchaseInvoiceCollection.findOne({
          _id: new ObjectId(invoiceId),
        });

        if (!purchaseInvoice) {
          return res
            .status(404)
            .json({ message: "Purchase invoice not found" });
        }

        res.status(200).json(purchaseInvoice);
      } catch (error) {
        // console.error(error);
        res.status(500).send("Error retrieving data");
      }
    });

    app.post("/api/add/purchaseInvoice", async (req, res) => {
      try {
        const invoice = req.body;

        // Check if the request body is an array
        if (!Array.isArray(invoice)) {
          return res
            .status(400)
            .send("Invalid data format. Expected an array.");
        }

        const insertionTime = new Date(); // Add a timestamp for the entire array

        // Create a new document with the invoices array and a createdTime field
        const newDocument = {
          invoice: invoice,
          createdTime: insertionTime,
        };

        const result = await purchaseInvoiceCollection.insertOne(newDocument);

        // Extract the generated _id from the insert result
        const insertedId = result.insertedId;

        res.status(201).json({
          message: "Data inserted successfully",
          insertedId: insertedId,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send("Error inserting data");
      }
    });

    //api for sell invoice
    app.get("/api/get/soldInvoices/byDate/:date", async (req, res) => {
      try {
        const dateParam = req.params.date;
        const startDate = new Date(dateParam);
        const endDate = new Date(dateParam);
        endDate.setDate(endDate.getDate() + 1); // Set the end date to the next day

        const filteredSoldInvoices = await soldInvoiceCollection
          .find({
            createdTime: {
              $gte: startDate,
              $lt: endDate,
            },
          })
          .toArray();

        res.status(200).json(filteredSoldInvoices);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving data");
      }
    });

    app.get("/api/get/soldInvoices", async (req, res) => {
      try {
        // Retrieve all documents from the soldInvoiceCollection
        const soldInvoices = await soldInvoiceCollection.find({}).toArray();

        res.status(200).json(soldInvoices);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving data");
      }
    });

    //single sold invoice finding
    app.get("/api/get/soldInvoice/:id", async (req, res) => {
      try {
        const invoiceId = req.params.id;
        // Find the sold invoice by _id in ObjectId format
        const soldInvoice = await soldInvoiceCollection.findOne({
          _id: new ObjectId(invoiceId),
        });

        if (!soldInvoice) {
          return res.status(404).json({ error: "Sold invoice not found" });
        }

        res.status(200).json(soldInvoice);
      } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving data");
      }
    });

    app.post("/api/add/soldInvoice", async (req, res) => {
      try {
        const invoice = req.body;

        // Check if the request body is an array
        if (!Array.isArray(invoice)) {
          return res
            .status(400)
            .send("Invalid data format. Expected an array.");
        }

        const insertionTime = new Date();

        // Create a new document with the invoices array and a createdTime field
        const newDocument = {
          invoice: invoice, // Updated field name to "invoices"
          createdTime: insertionTime,
        };

        const result = await soldInvoiceCollection.insertOne(newDocument);

        // Extract the generated _id from the insert result
        const insertedId = result.insertedId;

        res.status(201).json({
          message: "Data inserted successfully",
          insertedId: insertedId,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send("Error inserting data");
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Store Management server is running");
});
app.listen(port, () => {
  console.log(`Store Server is running on port, ${port}`);
});
