import React from "react";
import ReactDOM from "react-dom/client";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import App from "./App";
import GlobalDataContextProvider from "./context/GlobalData";
import "./assets/css/style.css";
import "./assets/css/waves.css";

function getLibrary(provider) {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 60000;
  return library;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <GlobalDataContextProvider>
        <App />
      </GlobalDataContextProvider>
    </Web3ReactProvider>
  </React.StrictMode>
);
