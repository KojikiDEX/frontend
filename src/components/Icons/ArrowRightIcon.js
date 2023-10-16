import React from "react";

export default function ArrowRightIcon(props) {
  const { color } = props;
  return (
    <React.Fragment>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="#80beff"
        className="w-4 h-4"
        style={{ color: color != undefined && color }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </React.Fragment>
  );
}
