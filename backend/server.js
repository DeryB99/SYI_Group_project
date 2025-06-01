const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require("cors");
const cron = require("node-cron");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(
  "integration_db",
  "avnadmin",
  "AVNS_A3IWeluW_UNMDjDT_Es",
  {
    host: "pg-6b17c39-baseldery-61f0.d.aivencloud.com",
    dialect: "postgres",
    port: 23219,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  }
);

const Sale = sequelize.define(
  "Sale",
  {
    shop: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    benefits: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    time_of_sale: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "sales",
    timestamps: false,
  }
);

const uploadDir = path.join(__dirname, "uploads");

const processCSVFiles = () => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return console.error("Error reading directory:", err);

    files
      .filter((f) => f.endsWith(".csv"))
      .forEach((file) => {
        const filePath = path.join(uploadDir, file);
        const records = [];

        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (data) => {
            if (
              data.product &&
              data.category &&
              data.quantity &&
              data.price &&
              data.benefits &&
              data.time_of_sale &&
              data.shop
            ) {
              records.push({
                shop: data.shop,
                product: data.product,
                category: data.category,
                quantity: parseInt(data.quantity, 10),
                price: parseFloat(data.price),
                benefits: parseFloat(data.benefits),
                time_of_sale: new Date(data.time_of_sale),
              });
            }
          })
          .on("end", async () => {
            try {
              await Sale.bulkCreate(records);
              console.log(`Inserted ${records.length} records from ${file}`);
              fs.unlinkSync(filePath);
            } catch (error) {
              console.error("Error inserting data:", error.message);
            }
          });
      });
  });
};

cron.schedule("*/5 * * * *", () => {
  console.log("Checking for new CSV files...");
  processCSVFiles();
});

processCSVFiles();

app.get("/stats", async (req, res) => {
  try {
    const revenueRes = await Sale.findAll({
      attributes: [
        [sequelize.literal("SUM(quantity * price)"), "totalRevenue"],
      ],
      raw: true,
    });
    const totalRevenue = parseFloat(revenueRes[0].totalRevenue) || 0;

    const avgRes = await Sale.findAll({
      attributes: [[sequelize.fn("AVG", sequelize.col("price")), "avgPrice"]],
      raw: true,
    });
    const averagePrice = parseFloat(avgRes[0].avgPrice).toFixed(2);

    const topCategoryRes = await Sale.findAll({
      attributes: [
        "category",
        [sequelize.fn("SUM", sequelize.col("quantity")), "qty"],
      ],
      group: ["category"],
      order: [[sequelize.literal("qty"), "DESC"]],
      limit: 1,
      raw: true,
    });
    const topCategory = topCategoryRes[0]?.category || "N/A";

    res.json({ totalRevenue, averagePrice, topCategory });
  } catch (err) {
    console.error("[STATS ERROR]", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/sales", async (req, res) => {
  try {
    const sales = await Sale.findAll({ order: [["time_of_sale", "DESC"]] });
    res.json(sales);
  } catch (err) {
    console.error("[SALES ERROR]", err);
    res.status(500).json({ error: err.message });
  }
});

sequelize.sync().then(() => {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
