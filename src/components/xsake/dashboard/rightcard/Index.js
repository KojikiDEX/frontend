import React from "react";
import { Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

export default function RightCard(props) {
  const navigate = useNavigate();
  // const [isNavOpen, setIsNavOpen] = React.useState(false);

  const handleManage = () => {
    if (props && props.link) {
      navigate(props.link);
    }
  };

  return (
    <React.Fragment>
      <div className="p-3 border">
        <p className="text-kojiki-blue">{props.label}</p>
        <span className="text-sm">{props.content}</span>
        <p className="mt-3">my allocation</p>
        <div
          className="right-card-end-line"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <p className="text-kojiki-blue">{props.value} xSAKE </p>
          <div>
            <button className="default-outline" onClick={(e) => handleManage()}>
              manage
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
