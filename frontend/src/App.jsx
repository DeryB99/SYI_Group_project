import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bar, Pie, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import SalesList from "./components/SalesLists";
import MainContainer from "./components/MainContainer";
import AlignedContainer from "./components/AlignedContainer";
import { fetchSalesData, fetchStats } from "./Online/SalesData";
import SalesStatsContext from "./Context/SalesStatsContext";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement
);

export default function App() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedShop, setSelectedShop] = useState("All");
  const [showAll, setShowAll] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState("All");

  const shops = useMemo(() => {
    const unique = Array.from(new Set(sales.map((sale) => sale.shop)));
    unique.sort();
    return unique;
  }, [sales]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSalesData();
        setSales(data);
      } catch (err) {
        console.error("Erreur fetchSalesData :", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        console.error("Erreur fetchStats :", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    console.log("Sales data:", sales);
    console.log("Stats data:", stats);
  }, [sales, stats]);

  const categories = Array.from(
    new Set(
      sales
        .filter((sale) => selectedShop === "All" || sale.shop === selectedShop)
        .map((sale) => sale.category)
    )
  );

  const priceData = categories.map((category) =>
    sales
      .filter(
        (sale) =>
          (selectedShop === "All" || sale.shop === selectedShop) &&
          sale.category === category
      )
      .reduce((sum, sale) => sum + sale.price, 0)
  );

  const benefitsData = categories.map((category) =>
    sales
      .filter(
        (sale) =>
          (selectedShop === "All" || sale.shop === selectedShop) &&
          sale.category === category
      )
      .reduce((sum, sale) => sum + sale.benefit, 0)
  );

  console.log({ categories, priceData, benefitsData });

  // Filter sales based on selected shop, category, and product
  const filteredSales = sales.filter(
    (sale) =>
      (selectedShop === "All" || sale.shop === selectedShop) &&
      (selectedCategory === "All" ||
        !selectedCategory ||
        sale.category === selectedCategory) &&
      (selectedProduct === "All" ||
        !selectedProduct ||
        sale.product === selectedProduct)
  );

  // Get all shops for x-axis
  const filteredShops = Array.from(
    new Set(
      sales
        .filter(
          (sale) =>
            (selectedCategory === "All" ||
              !selectedCategory ||
              sale.category === selectedCategory) &&
            (selectedProduct === "All" ||
              !selectedProduct ||
              sale.product === selectedProduct)
        )
        .map((sale) => sale.shop)
    )
  ).sort();

  // Aggregate price and benefits by shop
  const priceByShop = filteredShops.map((shop) =>
    sales
      .filter(
        (sale) =>
          sale.shop === shop &&
          (selectedCategory === "All" ||
            !selectedCategory ||
            sale.category === selectedCategory) &&
          (selectedProduct === "All" ||
            !selectedProduct ||
            sale.product === selectedProduct)
      )
      .reduce((sum, sale) => sum + sale.price, 0)
  );

  const benefitsByShop = filteredShops.map((shop) =>
    sales
      .filter(
        (sale) =>
          sale.shop === shop &&
          (selectedCategory === "All" ||
            !selectedCategory ||
            sale.category === selectedCategory) &&
          (selectedProduct === "All" ||
            !selectedProduct ||
            sale.product === selectedProduct)
      )
      .reduce((sum, sale) => sum + (sale.benefit ?? sale.benefits ?? 0), 0)
  );

  // Calculate benefits/quantity ratio by shops
  const benefitsByShopRatio = filteredShops.map(
    (shop) =>
      sales
        .filter(
          (sale) =>
            sale.shop === shop &&
            (selectedCategory === "All" ||
              !selectedCategory ||
              sale.category === selectedCategory) &&
            (selectedProduct === "All" ||
              !selectedProduct ||
              sale.product === selectedProduct)
        )
        .reduce((sum, sale) => sum + (sale.benefit ?? sale.benefits ?? 0), 0) /
      sales
        .filter(
          (sale) =>
            sale.shop === shop &&
            (selectedCategory === "All" ||
              !selectedCategory ||
              sale.category === selectedCategory) &&
            (selectedProduct === "All" ||
              !selectedProduct ||
              sale.product === selectedProduct)
        )
        .reduce((sum, sale) => sum + sale.quantity, 0)
  );

  // Helper: Aggregate sales per minute
  function aggregateSalesPerMinute(salesArr) {
    const map = new Map();
    salesArr.forEach((sale) => {
      // Parse and format to 'YYYY-MM-DD HH:mm'
      const date = new Date(sale.time_of_sale);
      if (isNaN(date)) return;
      const key = date.toISOString().slice(0, 16).replace("T", " "); // 'YYYY-MM-DD HH:mm'
      if (!map.has(key)) {
        map.set(key, { price: 0, benefit: 0 });
      }
      map.get(key).price += sale.price;
      map.get(key).benefit += sale.benefit ?? sale.benefits ?? 0;
    });
    // Sort by time
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([minute, values]) => ({
        minute,
        ...values,
      }));
  }

  const salesPerMinute = aggregateSalesPerMinute(filteredSales);

  return (
    <SalesStatsContext.Provider value={{ sales, stats }}>
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
            <strong>Average Price:</strong> ${stats.averagePrice}
          </p>
          <p>
            <strong>Top Category:</strong> {stats.topCategory}
          </p>
        </div>
        <MainContainer
          children={
            <>
              <h2 style={{ marginBottom: "1rem" }}>Global Sales Records</h2>
              <SalesList />

              <AlignedContainer>
                <Bar
                  data={{
                    labels: categories,
                    datasets: [
                      {
                        label: "Average Price",
                        data: categories.map((category) => {
                          const catSales = sales.filter(
                            (sale) => sale.category === category
                          );
                          return catSales.length
                            ? catSales.reduce(
                                (sum, sale) => sum + sale.price,
                                0
                              ) / catSales.length
                            : 0;
                        }),
                        backgroundColor: "#42a5f5",
                      },
                      {
                        label: "Average Benefits",
                        data: categories.map((category) => {
                          const catSales = sales.filter(
                            (sale) => sale.category === category
                          );
                          return catSales.length
                            ? catSales.reduce(
                                (sum, sale) =>
                                  sum + (sale.benefit ?? sale.benefits ?? 0),
                                0
                              ) / catSales.length
                            : 0;
                        }),
                        backgroundColor: "#66bb6a",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
                <Doughnut
                  data={{
                    labels: categories,
                    datasets: [
                      {
                        data: priceData,
                        backgroundColor: [
                          "#ff6384",
                          "#36a2eb",
                          "#cc65fe",
                          "#ffce56",
                          "#66bb6a",
                          "#ffa726",
                          "#ab47bc",
                          "#26a69a",
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
                <Line
                  data={{
                    labels: salesPerMinute.map((d) => d.minute),
                    datasets: [
                      {
                        label: "Price per minute",
                        data: salesPerMinute.map((d) => d.price),
                        fill: false,
                        borderColor: "#42a5f5",
                        backgroundColor: "#42a5f5",
                        tension: 0.2,
                      },
                      {
                        label: "Benefits per minute",
                        data: salesPerMinute.map((d) => d.benefit),
                        fill: false,
                        borderColor: "#66bb6a",
                        backgroundColor: "#66bb6a",
                        tension: 0.2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                    scales: {
                      x: {
                        title: { display: true, text: "Minute" },
                        ticks: { autoSkip: true, maxTicksLimit: 10 },
                      },
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: "Amount" },
                      },
                    },
                  }}
                />
              </AlignedContainer>
            </>
          }
        />

        <MainContainer
          children={
            <>
              <div>
                <h2 style={{ marginBottom: "1rem" }}>Filter by Shop</h2>
                <div className="mb-4 flex items-center">
                  <label htmlFor="shop-select" className="mr-2 text-gray-700">
                    Filter by shop:
                  </label>
                  <select
                    id="shop-select"
                    value={selectedShop}
                    onChange={(e) => {
                      setSelectedShop(e.target.value);
                      setShowAll(false);
                    }}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option value="All">All Shops</option>
                    {shops.map((shop) => (
                      <option key={shop} value={shop}>
                        {shop}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <h2 style={{ marginBottom: "1rem" }}>
                Sales Records for {selectedShop}
                {selectedShop !== "All" && (
                  <span className="text-gray-500">
                    {" "}
                    ({sales.filter((sale) => sale.shop === selectedShop).length}
                    records)
                  </span>
                )}
              </h2>
              <Line
                data={{
                  labels: salesPerMinute.map((d) => d.minute),
                  datasets: [
                    {
                      label: "Price per minute",
                      data: salesPerMinute.map((d) => d.price),
                      fill: false,
                      borderColor: "#42a5f5",
                      backgroundColor: "#42a5f5",
                      tension: 0.2,
                    },
                    {
                      label: "Benefits per minute",
                      data: salesPerMinute.map((d) => d.benefit),
                      fill: false,
                      borderColor: "#66bb6a",
                      backgroundColor: "#66bb6a",
                      tension: 0.2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top" } },
                  scales: {
                    x: {
                      title: { display: true, text: "Minute" },
                      ticks: { autoSkip: true, maxTicksLimit: 10 },
                    },
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Amount" },
                    },
                  },
                }}
              />
              <AlignedContainer>
                <Doughnut
                  data={{
                    labels: filteredShops,
                    datasets: [
                      {
                        data: priceByShop,
                        backgroundColor: [
                          "#ff6384",
                          "#36a2eb",
                          "#cc65fe",
                          "#ffce56",
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
                <Doughnut
                  data={{
                    labels: filteredShops,
                    datasets: [
                      {
                        data: benefitsByShopRatio,
                        backgroundColor: [
                          "#66bb6a",
                          "#ffa726",
                          "#ab47bc",
                          "#26a69a",
                        ],
                        label: "Benefists/Quantity Ratio",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
                <Radar
                  data={{
                    labels: Array.from(
                      new Set(
                        sales
                          .filter(
                            (sale) =>
                              selectedShop === "All" ||
                              sale.shop === selectedShop
                          )
                          .map((sale) => sale.category)
                      )
                    ),
                    datasets: [
                      {
                        label: "Total Price by Category",
                        data: Array.from(
                          new Set(
                            sales
                              .filter(
                                (sale) =>
                                  selectedShop === "All" ||
                                  sale.shop === selectedShop
                              )
                              .map((sale) => sale.category)
                          )
                        ).map((category) =>
                          sales
                            .filter(
                              (sale) =>
                                (selectedShop === "All" ||
                                  sale.shop === selectedShop) &&
                                sale.category === category
                            )
                            .reduce((sum, sale) => sum + sale.price, 0)
                        ),
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                      },
                      {
                        label: "Total Benefits by Category",
                        data: Array.from(
                          new Set(
                            sales
                              .filter(
                                (sale) =>
                                  selectedShop === "All" ||
                                  sale.shop === selectedShop
                              )
                              .map((sale) => sale.category)
                          )
                        ).map((category) =>
                          sales
                            .filter(
                              (sale) =>
                                (selectedShop === "All" ||
                                  sale.shop === selectedShop) &&
                                sale.category === category
                            )
                            .reduce((sum, sale) => sum + sale.benefits, 0)
                        ),
                        backgroundColor: "rgba(255, 99, 132, 0.2)",
                        borderColor: "rgba(255, 99, 132, 1)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                    scales: {
                      r: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </AlignedContainer>
            </>
          }
        />

        <MainContainer
          children={
            <>
              <div>
                <h2 style={{ marginBottom: "1rem" }}>
                  Filter by Category & Product
                </h2>
                <div className="mb-4 flex items-center">
                  <label
                    htmlFor="category-select"
                    className="mr-2 text-gray-700"
                  >
                    Category:
                  </label>
                  <select
                    id="category-select"
                    value={selectedCategory || "All"}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedProduct("All");
                    }}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <br />
                  <label
                    htmlFor="product-select"
                    className="ml-4 mr-2 text-gray-700"
                  >
                    Product:
                  </label>
                  <select
                    id="product-select"
                    value={selectedProduct || "All"}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option value="All">All Products</option>
                    {Array.from(
                      new Set(
                        sales
                          .filter(
                            (sale) =>
                              (selectedShop === "All" ||
                                sale.shop === selectedShop) &&
                              (selectedCategory === "All" ||
                                !selectedCategory ||
                                sale.category === selectedCategory)
                          )
                          .map((sale) => sale.product)
                      )
                    ).map((prod) => (
                      <option key={prod} value={prod}>
                        {prod}
                      </option>
                    ))}
                  </select>
                </div>
                <h3 style={{ marginBottom: "1rem" }}>
                  Filtered Sales
                  {selectedCategory &&
                    selectedCategory !== "All" &&
                    ` in ${selectedCategory}`}
                  {selectedProduct &&
                    selectedProduct !== "All" &&
                    ` - ${selectedProduct}`}
                </h3>
              </div>
              <Bar
                data={{
                  labels: filteredShops,
                  datasets: [
                    {
                      label: "Total Price",
                      data: priceByShop,
                      backgroundColor: "#42a5f5",
                    },
                    {
                      label: "Total Benefits",
                      data: benefitsByShop,
                      backgroundColor: "#66bb6a",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "top" } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
              <AlignedContainer>
                <div>
                  <h3 style={{ marginBottom: "1rem" }}> Records best shops</h3>
                  <ul>
                    {filteredShops.map((shop, index) => (
                      <li key={index}>
                        {shop}: $
                        {Number(priceByShop[index]).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </li>
                    ))}
                  </ul>
                  <h3 style={{ marginBottom: "1rem" }}>
                    Records best benefits
                  </h3>
                  <ul>
                    {filteredShops.map((shop, index) => (
                      <li key={index}>
                        {shop}: $
                        {Number(benefitsByShop[index]).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <Doughnut
                  data={{
                    labels: filteredShops,
                    datasets: [
                      {
                        data: priceByShop,
                        backgroundColor: [
                          "#ff6384",
                          "#36a2eb",
                          "#cc65fe",
                          "#ffce56",
                        ],
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
                <Line
                  data={{
                    labels: salesPerMinute.map((d) => d.minute),
                    datasets: [
                      {
                        label: "Price per minute",
                        data: salesPerMinute.map((d) => d.price),
                        fill: false,
                        borderColor: "#42a5f5",
                        backgroundColor: "#42a5f5",
                        tension: 0.2,
                      },
                      {
                        label: "Benefits per minute",
                        data: salesPerMinute.map((d) => d.benefit),
                        fill: false,
                        borderColor: "#66bb6a",
                        backgroundColor: "#66bb6a",
                        tension: 0.2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: "top" } },
                    scales: {
                      x: {
                        title: { display: true, text: "Minute" },
                        ticks: { autoSkip: true, maxTicksLimit: 10 },
                      },
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: "Amount" },
                      },
                    },
                  }}
                />
              </AlignedContainer>
            </>
          }
        />
      </div>
    </SalesStatsContext.Provider>
  );
}
