import React from "react";
import { useBetween } from "use-between";

// Make a custom hook with your future shared state
const useFormState = () => {
  const initialValue = [
    {
      fromToken: 'https://bitcoinnft-verification.web.app/img/token/OT.png',
      toToken: `https://bitcoinnft-verification.web.app/img/token/ETH.png`,
      fromTokenSymbol: "OT",
      toTokenSymbol: "ETH",
      tvl: "$1.5M",
      deposits: "yes",
      apr: "64.46%",
      total_deposit: "0",
      pending: "0",
      boostAmount: "0.0001",
      boostMultiplier: "2.5",
      amount: "0.255",
      id: "3591",
      positionID: {
        8453:3591,
        84531:3591,
      },
      positionAddress: {
        8453:"0x3Dc23ccC24482b618d434Da6976bFfa60dC471f1",
        84531:"0x23c4526941037e01a7CA7Ea666830e7D15fb0C9f",
      },
    },
    {
      fromToken: `https://bitcoinnft-verification.web.app/img/token/SAKE.png`,
      toToken: `https://bitcoinnft-verification.web.app/img/token/USDC.png`,
      fromTokenSymbol: "SAKE",
      toTokenSymbol: "USDC",
      tvl: "$1.5M",
      deposits: "yes",
      apr: "64.46%",
      total_deposit: "0",
      pending: "0",
      boostAmount: "0.0001",
      boostMultiplier: "2",
      amount: "0.1548",
      id: "3592",
      positionID: {
        8453:3592,
        84531:3592,
      },
      positionAddress: {
        8453:"0x82cf66e9a45Df1CD3837cF623F7E73C1Ae6DFf1e",
        84531:"0xB39AC8CB3e91EFD0f9b72Fe5B6EC4bE318d46722",
      },
    },
  ];

  const [tableDatas, setTableDatas] = React.useState(initialValue);

  return {
    tableDatas,
    setTableDatas,
  };
};

const useSharedState = () => useBetween(useFormState);

export default useSharedState;
