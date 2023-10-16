import React from "react";
import { Link } from "react-router-dom";

import DiscordIcon from "../../../components/Icons/DiscordIcon";
import TwitterIcon from "../../../components/Icons/TwitterIcon";
import MediumIcon from "../../../components/Icons/MediumIcon";
import GithubIcon from "../../../components/Icons/GithubIcon";
import GitbookIcon from "../../../components/Icons/GitbookIcon";

export default function SocialMenu() {
  return (
    <React.Fragment>
      <ul className="flex gap-3">
        <li>
          <Link to="">
            <DiscordIcon />
          </Link>
        </li>
        <li>
          <Link href="https://twitter.com/@KojikiDEX" target>
            <TwitterIcon />
          </Link>
        </li>
        <li>
          <a href="https://medium.com/@kojikidex" target="_blank">
            <MediumIcon />
          </a>
        </li>
        <li>
          <a href="https://github.com/KojikiDEX" target="_blank">
            <GithubIcon />
          </a>
        </li>
        <li>
          <a href="https://kojikidex.gitbook.io/kojiki/" target="_blank">
            <GitbookIcon />
          </a>
        </li>
      </ul>
    </React.Fragment>
  );
}
