import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";

import { useColorMode } from "@docusaurus/theme-common";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const { colorMode, setColorMode } = useColorMode();
  const bgColor = colorMode === "dark" ? "#1B1B1D" : "#FFFFFF";
  const textColor = colorMode === "dark" ? "#fff" : "#007398";

  return (
    <header
      className={clsx("hero hero--primary", styles.heroBanner)}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="container">
        <div id="logo">
          <img src="img/logo-gb.jpg"></img>
        </div>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="docs/category/postman"
          >
            See my blog →
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Z0057393`}
      description="Juste un site pour des docs & tuto "
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
