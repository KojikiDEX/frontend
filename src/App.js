import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useWeb3React } from "@web3-react/core";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { TokenContext, KojikiContext } from "./context/context";

import logoImg from "./assets/img/icon/sake.png";

import { ethers } from "ethers";
import { getTokens } from "./hooks/tokenHelper";
import { getLpTokens } from "./hooks/lpTokenHelper";
import { useKojikiContext } from "./hooks/useKojikiContext";
import LaunchpadDetail from "./pages/launchpadDetail/LaunchpadDetail";
import NitroPoolsDetails from "./pages/nitro_pools/NitroPoolsDetail";
import { ADMIN_ACCOUNT, CHAIN_ID } from "./hooks/connectors";

import MainLayout from "./layout/MainLayout";
import LoadingIcon from "./components/Icons/LoadingIcon";

const Swap = lazy(() => import("./pages/swap/Swap"));
const Pools = lazy(() => import("./pages/pool/Pools"));
const Positions = lazy(() => import("./pages/pool/Positions"));
const Wizard = lazy(() => import("./pages/pool/Wizard"));
const Overview = lazy(() => import("./pages/pool/Overview"));
const MyPosition = lazy(() => import("./pages/pool/MyPosition"));
const Deposit = lazy(() => import("./pages/pool/Deposit"));
const Withdraw = lazy(() => import("./pages/pool/Withdraw"));
const Liquidity = lazy(() => import("./pages/liquidity/Liquidity"));
const MyPositions = lazy(() => import("./pages/my_positions/MyPositions"));
const YieldFarms = lazy(() => import("./pages/yield_farms/YieldFarms"));
const YieldFarmDetail = lazy(() =>
  import("./pages/yield_farms/YieldFarmDetail")
);
const NitroPools = lazy(() => import("./pages/nitro_pools/NitroPools"));
const GenesisPools = lazy(() => import("./pages/genesis_pools/GenesisPools"));
const GenesisPoolsDetail = lazy(() =>
  import("./pages/genesis_pools/GenesisPoolsDetail")
);
const XSAKE = lazy(() => import("./pages/xsake/XSAKE"));
const Dividends = lazy(() => import("./pages/dividends/Dividends"));
const Yieldbooster = lazy(() => import("./pages/yieldbooster/Yieldbooster"));
const Launchpad = lazy(() => import("./pages/launchpad/Launchpad"));
const XsakeLaunchpad = lazy(() =>
  import("./pages/xsakeLaunchpad/XsakeLaunchpad")
);
const Info = lazy(() => import("./pages/info/Info"));
const Calculator = lazy(() => import("./pages/calculator/Calculator"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const ComingSoon = lazy(() => import("./pages/coming/ComingSoon"));

const renderLoader = () => (
  <div className="w-full h-[calc(100vh-100px)] flex justify-center items-center">
    <img src={logoImg} className="animate-pulse  " />
  </div>
);

function App() {
  let { account } = useWeb3React();
  const [tokens, setTokens] = useState({});
  const [lpTokens, setLpTokens] = useState({});

  const context = useKojikiContext();

  const queryString = window.location.search;
  const parameters = new URLSearchParams(queryString);
  const newReferral = parameters.get("ref");

  const initData = async () => {
    const tokenList = await getTokens(account);
    const lpTokenList = await getLpTokens(account);
    setTokens(tokenList);
    setLpTokens(lpTokenList);
  };

  useEffect(() => {
    const referral = window.localStorage.getItem(
      "LAUNCHPAD_REFERRAL" + CHAIN_ID
    );

    if (!ethers.utils.isAddress(referral)) {
      if (ethers.utils.isAddress(newReferral)) {
        window.localStorage.setItem(
          "LAUNCHPAD_REFERRAL" + CHAIN_ID,
          newReferral
        );
      } else {
        window.localStorage.setItem(
          "LAUNCHPAD_REFERRAL" + CHAIN_ID,
          ADMIN_ACCOUNT
        );
      }
    }
  }, [newReferral]);

  useEffect(() => {
    initData();
  }, [account]);

  return (
    <KojikiContext.Provider value={context}>
      <TokenContext.Provider
        value={{ tokens, setTokens, lpTokens, setLpTokens }}
      >
        <div className="App">
          <Router>
            <MainLayout>
              <Suspense fallback={renderLoader()}>
                <Routes>
                  <Route path="/" element={<Navigate replace to="/swap" />} />
                  <Route path="/swap" element={<Swap />} />
                  <Route path="/pools" element={<Pools />} />
                  <Route path="/positions" element={<Positions />} />
                  <Route path="/wizard" element={<Wizard />} />
                  <Route path="/pool/overview/:lpAddr" element={<Overview />} />
                  <Route
                    path="/pool/myposition/:lpAddr"
                    element={<MyPosition />}
                  />
                  <Route path="/pool/deposit/:lpAddr" element={<Deposit />} />
                  <Route path="/pool/withdraw/:lpAddr" element={<Withdraw />} />
                  <Route path="liquidity" element={<Liquidity />} />
                  <Route path="my-positions" element={<MyPositions />} />
                  <Route path="yield-farms" element={<YieldFarms />} />
                  <Route
                    path="yield-farms/detail"
                    element={<YieldFarmDetail />}
                  />
                  <Route path="raito-pools" element={<NitroPools />} />
                  <Route
                    path="raito-pools/detail"
                    element={<NitroPoolsDetails />}
                  />
                  <Route path="core-pools" element={<GenesisPools />} />
                  <Route
                    path="core-pools/detail"
                    element={<GenesisPoolsDetail />}
                  />
                  <Route path="xsake" element={<XSAKE />} />
                  <Route path="xsake/dividends" element={<Dividends />} />
                  <Route path="xsake/yieldbooster" element={<Yieldbooster />} />
                  <Route path="xsake/launchpad" element={<XsakeLaunchpad />} />
                  <Route path="launchpad" element={<Launchpad />} />
                  <Route
                    path="launchpad/:token"
                    element={<LaunchpadDetail />}
                  />
                  <Route path="calculator" element={<Calculator />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="*" element={<Navigate replace to="/swap" />} />
                </Routes>
              </Suspense>
            </MainLayout>
            <ToastContainer pauseOnFocusLoss={true} position="bottom-right" />
          </Router>
        </div>
      </TokenContext.Provider>
    </KojikiContext.Provider>
  );
}

export default App;
