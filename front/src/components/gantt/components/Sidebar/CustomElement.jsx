import React from "react";

export default function CustomElement({ items, style }) {
  return (
    <div className="rt-custom-timebar-key-flex" style={style}>
      {items &&
        items.map((item, index) => (
          <div key={index} className="rt-custom-timebar-child">
            <span className="rt-custom-track-key__title">{item}</span>
          </div>
        ))}
    </div>
  );
}
