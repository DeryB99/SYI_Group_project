import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

export default function App() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    averagePrice: 0,
    topCategory: "N/A",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:3001/stats");
      setStats({
        ...res.data,
        averagePrice: parseFloat(res.data.averagePrice || 0),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const generateProductCategoryJson = async () => {
    try {
      const res = await axios.get("http://localhost:3001/products");
      const products = res.data;
      console.log("Products:", products);

      const productCategoryMap = products.reduce((acc, item) => {
        const { category, product } = item;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({ product });
        return acc;
      }, {});

      const json = JSON.stringify(productCategoryMap, null, 2);
      console.log("Product-Category JSON:", json);

      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "product-category.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating product-category JSON:", error);
    }
  };

  //generateProductCategoryJson();

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>📊 CSV Data Dashboard</h1>
      <div style={{ marginBottom: "1.5rem" }}>
        <p>
          <strong>Total Revenue:</strong> $
          {Number(stats.totalRevenue).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p>
          <strong>Average Price:</strong> ${stats.averagePrice.toFixed(2)}
        </p>
        <p>
          <strong>Top Category:</strong> {stats.topCategory}
        </p>
      </div>

      <div style={{ maxWidth: "400px", margin: "auto", marginBottom: "2rem" }}>
        <h3>Total Revenue</h3>
        <Bar
          data={{
            labels: ["Total Revenue"],
            datasets: [
              {
                label: "Revenue",
                data: [stats.totalRevenue],
                backgroundColor: ["#4caf50"],
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>

      <div style={{ maxWidth: "300px", margin: "auto", marginBottom: "2rem" }}>
        <h3>Average Price</h3>
        <Bar
          data={{
            labels: ["Average Price"],
            datasets: [
              {
                label: "Avg Price",
                data: [stats.averagePrice],
                backgroundColor: ["#2196f3"],
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>

      <div style={{ maxWidth: "300px", margin: "auto" }}>
        <h3>Top Category Share</h3>
        <Pie
          data={{
            labels: ["Top Category", "Other"],
            datasets: [
              {
                data: [80, 20],
                backgroundColor: ["#ff9800", "#cfd8dc"],
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { position: "bottom" } },
          }}
        />
      </div>
    </div>
  );
}
