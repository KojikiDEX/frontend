import styled from "styled-components";

import DiscordIcon from "../components/Icons/DiscordIcon";

import Header from "./header/Header";
import Footer from "./footer/Footer";

const Page = styled.div`
  min-height: calc(100vh - 200px);
`;

export default function MainLayout(props) {
  return (
    <div>
      <Header />
      <Page className="relative container mx-auto p-2 mb-[100px]">
        {props.children}
        {/* <div>
          <ul>
            <li>
              <DiscordIcon />
            </li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div> */}
      </Page>
      <Footer />
    </div>
  );
}
