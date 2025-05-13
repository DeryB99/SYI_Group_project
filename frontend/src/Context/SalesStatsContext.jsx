import { createContext, useContext } from "react";

const SalesStatsContext = createContext(null);

export const useSalesStats = () => {
  const ctx = useContext(SalesStatsContext);
  if (!ctx)
    throw new Error("useSalesStats must be inside a SalesStatsProvider");
  return ctx;
};

export default SalesStatsContext;
