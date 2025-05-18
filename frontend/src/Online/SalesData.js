import axios from "axios";

export const fetchSalesData = async () => {
  try {
    const response = await axios.get("http://localhost:3001/sales");
    return response.data;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    throw error;
  }
};

export const fetchStats = async () => {
  try {
    const res = await axios.get("http://localhost:3001/stats");
    return {
      totalSales: res.data.totalSales,
      totalRevenue: res.data.totalRevenue,
      averagePrice: parseFloat(res.data.averagePrice || 0),
      topCategory: res.data.topCategory,
      topShop: res.data.topShop,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
};
