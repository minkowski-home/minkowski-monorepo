import { brandColors, typography } from "../styles/brand";

const navGroups = [
  {
    label: "About",
    links: [
      { label: "Studio Overview", href: "#studio-overview" },
      { label: "Leadership", href: "#leadership" },
      { label: "Press & Awards", href: "#press" }
    ]
  },
  {
    label: "Services",
    links: [
      { label: "Spatial Design", href: "#spatial-design" },
      { label: "Product Direction", href: "#product-direction" },
      { label: "Retail Implementation", href: "#retail-implementation" }
    ]
  },
  {
    label: "Careers",
    links: [
      { label: "Design Sense Test", href: "#design-sense-test" },
      { label: "Open Roles", href: "#careers" },
      { label: "Life at Minkowski", href: "#culture" }
    ]
  }
];

export function TopNavigation() {
  return (
    <header style={styles.topBar}>
      <div style={styles.topBarInner}>
        <a href="https://minkowskihome.com" style={styles.logoLink}>
          <div style={styles.logoPlaceholder} aria-hidden="true" />
          <span style={styles.logoSrOnly}>Minkowski Home</span>
        </a>
        <nav style={styles.topNav} aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div key={group.label} style={styles.navGroup}>
              <span style={styles.navTrigger}>{group.label}</span>
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    backgroundColor: brandColors.primary,
    color: brandColors.background,
    padding: "0.75rem 1.5rem"
  },
  topBarInner: {
    margin: "0 auto",
    maxWidth: "min(1200px, 92vw)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "2rem"
  },
  logoLink: {
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none"
  },
  logoPlaceholder: {
    width: "156px",
    height: "44px",
    borderRadius: "6px",
    border: "2px solid rgba(243, 242, 236, 0.65)",
    backgroundColor: "rgba(243, 242, 236, 0.15)"
  },
  logoSrOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    border: 0
  },
  topNav: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem"
  },
  navGroup: {
    position: "relative"
  },
  navTrigger: {
    fontFamily: typography.heading,
    fontWeight: 700,
    fontSize: "0.82rem",
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    color: brandColors.background
  }
};
