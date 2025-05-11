const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize('integration_db', 'avnadmin', 'AVNS_A3IWeluW_UNMDjDT_Es', {
  host: 'pg-6b17c39-baseldery-61f0.d.aivencloud.com',
  dialect: 'postgres',
  port: 23219,
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  }
});

const ProductData = sequelize.define('ProductData', {
  product: DataTypes.STRING,
  category: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  price: DataTypes.FLOAT
});

const uploadDir = path.join(__dirname, 'uploads');

const processCSVFiles = () => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return console.error('Error reading directory:', err);

    files.filter(f => f.endsWith('.csv')).forEach(file => {
      const filePath = path.join(uploadDir, file);
      const records = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          if (data.product && data.category && data.quantity && data.price) {
            records.push({
              product: data.product,
              category: data.category,
              quantity: parseInt(data.quantity),
              price: parseFloat(data.price)
            });
          }
        })
        .on('end', async () => {
          try {
            await ProductData.bulkCreate(records);
            console.log(`Inserted ${records.length} records from ${file}`);
            fs.unlinkSync(filePath);
          } catch (error) {
            console.error('Error inserting data:', error.message);
          }
        });
    });
  });
};

cron.schedule('*/5 * * * *', () => {
  console.log('Checking for new CSV files...');
  processCSVFiles();
});

processCSVFiles();

app.get('/stats', async (req, res) => {
  try {
    const totalRevenue = await ProductData.findAll({
      attributes: [[sequelize.literal('SUM(quantity * price)'), 'revenue']]
    });

    const avgResult = await ProductData.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('price')), 'avgPrice']],
      raw: true
    });
    const averagePrice = parseFloat(avgResult.avgPrice || 0).toFixed(2);

    const topCategory = await ProductData.findAll({
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('quantity')), 'qty']],
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 1
    });

    res.json({
      totalRevenue: totalRevenue[0].dataValues.revenue || 0,
      averagePrice,
      topCategory: topCategory[0]?.category || 'N/A'
    });
  } catch (err) {
    console.error('[STATS ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

sequelize.sync().then(() => {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
