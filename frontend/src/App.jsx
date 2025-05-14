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
              <AlignedContainer>
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
      </div>
    </SalesStatsContext.Provider>
  );
}
