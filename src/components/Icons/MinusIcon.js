import React from "react";

export default function MinusIcon(props) {
  const { color } = props;
  return (
    <React.Fragment>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4"
        style={{ color: color != undefined && color }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
      </svg>
    </React.Fragment>
  );
}
