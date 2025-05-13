import React from "react";

const MainContainer = ({ children }) => {
  const containerStyle = {
    borderRadius: "15px",
    margin: "20px",
    padding: "20px",
    border: "1px solid #ccc",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  };

  return <div style={containerStyle}>{children}</div>;
};

export default MainContainer;
