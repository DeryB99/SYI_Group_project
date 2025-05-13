import React, { useEffect, useMemo, useState } from "react";
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
  Legend
);

export default function App() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedShop, setSelectedShop] = useState("All");

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
            </>
          }
        />
      </div>
    </SalesStatsContext.Provider>
  );
}
