import React from "react";
import { Typography } from "@material-tailwind/react";
import { useWeb3React } from "@web3-react/core";
import Item from "../../Item";

export default function PastSaleList() {
  const { account } = useWeb3React();
  React.useEffect(() => {}, []);

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="w-full border p-5 mt-3 mb-3 lg:mr-3  lg:w-7/12 lg:mb-0">
        <Typography variant="h5" className="mb-5  lg:mb-0">
          Past sales perks
        </Typography>
        <div className="py-3 mb-3 border-b-2 border-dashed"></div>
        <div className="flex flex-col lg:flex-row mb-5  lg:mb-0">
          <Item
            type={"chain"}
            label={"WINR Protocol / JustBet CLOSED"}
            value={"Whitelist allocation"}
          />
          <Typography variant="small" className="pt-2 ">
            03/09/2023
          </Typography>
        </div>
        <div className="py-3 mb-3 border-b-2 border-dashed"></div>
        <div className="flex flex-col lg:flex-row mb-5  lg:mb-0">
          <Item type={"chain"} label={"Arbitrove CLOSED"} value={"Airdrop"} />
          <Typography variant="small" className="pt-2 ">
            03/15/2023
          </Typography>
        </div>
        <div className="py-3 mb-3 border-b-2 border-dashed"></div>
        <div className="flex flex-col lg:flex-row mb-5  lg:mb-0">
          <Item
            type={"chain"}
            label={"Perpy CLOSED"}
            value={"Whitelist allocation"}
          />
          <Typography variant="small" className="pt-2 ">
            03/20/2023
          </Typography>
        </div>
      </div>
      <div className="w-full h-full lg:w-5/12"></div>
    </div>
  );
}
