import React from "react";
import PropTypes from "prop-types";

const AlignedContainer = ({ children, columns = 3, gap = 16 }) => {
  const basis = `calc(${100 / columns}% - ${gap}px)`;
  const items = React.Children.toArray(children);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: `${gap}px` }}>
      {items.map((child, i) => (
        <div
          key={i}
          style={{
            flex: `1 1 ${basis}`,
            minWidth: 0,
            boxSizing: "border-box",
            width: "100%",
            height: "300px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

AlignedContainer.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.number,
  gap: PropTypes.number,
};

export default AlignedContainer;
