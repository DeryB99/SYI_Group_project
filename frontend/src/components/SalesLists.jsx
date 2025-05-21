import React, { useState, useEffect, useMemo } from "react";
import { useSalesStats } from "../Context/SalesStatsContext";

export default function SalesList() {
  const { sales } = useSalesStats();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShop, setSelectedShop] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const initialDisplayCount = 10;

  useEffect(() => {
    if (sales.length > 0) {
      setLoading(false);
    }
  }, [sales]);

  const shops = useMemo(() => {
    const unique = Array.from(new Set(sales.map((sale) => sale.shop)));
    unique.sort();
    return unique;
  }, [sales]);

  const filteredSales =
    selectedShop === "All"
      ? sales
      : sales.filter((sale) => sale.shop === selectedShop);

  const displayedSales = showAll
    ? filteredSales
    : filteredSales.slice(0, initialDisplayCount);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">Loading sales...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-5xl">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800">
          Sales Records' Table
        </h2>

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

        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700">Shop</th>
                <th className="px-4 py-2 text-left text-gray-700">Product</th>
                <th className="px-4 py-2 text-left text-gray-700">Category</th>
                <th className="px-4 py-2 text-right text-gray-700">Quantity</th>
                <th className="px-4 py-2 text-right text-gray-700">
                  Price (€)
                </th>
                <th className="px-4 py-2 text-right text-gray-700">
                  Benefits (€)
                </th>
                <th className="px-4 py-2 text-left text-gray-700">
                  Time of Sale
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 text-gray-800">{sale.shop}</td>
                  <td className="px-4 py-2 text-gray-800">{sale.product}</td>
                  <td className="px-4 py-2 text-gray-800">{sale.category}</td>
                  <td className="px-4 py-2 text-right text-gray-800">
                    {sale.quantity}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-800">
                    {sale.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-800">
                    {sale.benefits.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-gray-800">
                    {new Date(sale.time_of_sale).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length > initialDisplayCount && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
