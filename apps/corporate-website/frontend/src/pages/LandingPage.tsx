import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { brandColors, typography } from "../styles/brand";
import { useTestSession } from "../context/TestSessionContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { resetSession } = useTestSession();
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const handleBegin = () => {
    resetSession();
    navigate("/start");
  };

  return (
    <section style={styles.heroSection}>
      <div style={styles.heroContent}>
        <span style={styles.badge}>Design Sense Test</span>
        <h1 style={styles.title}>Brand-led hiring for Minkowski design ops</h1>
        <p style={styles.subtitle}>
          A gated assessment to surface candidates with non-negotiable aesthetic judgment before
          hands-on training. Complete the applicant information to begin the timed, one question
          at a time screening sequence.
        </p>
        <button type="button" style={styles.cta} onClick={handleBegin}>
          Begin Test
        </button>
      </div>

      <div style={styles.rubricGrid}>
        {focusAreas.map((area) => (
          <div
            key={area.title}
            style={{
              ...styles.rubricCard,
              boxShadow:
                activeCard === area.title
                  ? "0 18px 36px rgba(0, 0, 0, 0.16)"
                  : styles.rubricCard.boxShadow,
              transform: activeCard === area.title ? "translateY(-6px)" : "none"
            }}
            onMouseEnter={() => setActiveCard(area.title)}
            onMouseLeave={() => setActiveCard(null)}
            onFocus={() => setActiveCard(area.title)}
            onBlur={() => setActiveCard(null)}
            tabIndex={0}
          >
            <h3 style={styles.rubricTitle}>{area.title}</h3>
            <p style={styles.rubricSummary}>{area.summary}</p>
            <span style={styles.rubricHint}>Hover for rubric details</span>
            {activeCard === area.title ? (
              <div style={styles.popover} role="dialog" aria-label={area.title}>
                {area.sections.map((section) => (
                  <div key={section.heading} style={styles.popoverSection}>
                    <h4 style={styles.popoverHeading}>{section.heading}</h4>
                    <ul style={styles.popoverList}>
                      {section.bullets.map((bullet) => (
                        <li key={bullet} style={styles.popoverItem}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

const focusAreas = [
  {
    title: "Palette Description",
    summary: "Protect the 50/20/10 palette split and track mix shifts in real time.",
    sections: [
      {
        heading: "Core Palette Targets",
        bullets: [
          "Anchor assortment with 50% off-white; pause submissions past 55%",
          "Keep white accents around 20% with a hard ceiling at 25%",
          "Guarantee at least one burgundy accent every 10 new items",
          "Matte black support pieces stay below a 15% share",
          "Limit wood and stone textures to a maximum of 10% each"
        ]
      },
      {
        heading: "Accent Discipline",
        bullets: [
          "Log every SKU ratio in the shared sheet before publishing",
          "Favor calm architectural neutrals (sand, taupe, greige) for filler",
          "Avoid high gloss or plastic sheen across all finishes"
        ]
      },
      {
        heading: "Hard Stops",
        bullets: [
          "Decline bright primaries, neons, or shiny metallic finishes",
          "Reject printed graphics, slogans, or obvious trend motifs"
        ]
      }
    ]
  },
  {
    title: "Material",
    summary: "Curate tactile, slow-living finishes that age gracefully and feel premium.",
    sections: [
      {
        heading: "Approved Surfaces",
        bullets: [
          "Ash, oak, walnut, or bleached timbers with visible grain",
          "Matte ceramic and stoneware glazes only",
          "Stone, concrete, or plaster textures with subtle variation",
          "Matte metal accents that reinforce calm architectural lines"
        ]
      },
      {
        heading: "Disqualifiers",
        bullets: [
          "Glossy plastics (bio-plastic is a rare exception)",
          "Mass-market marketplace finds or logo-heavy goods",
          "Printed designs, slogan pieces, or novelty silhouettes"
        ]
      },
      {
        heading: "Feasibility Gate",
        bullets: [
          "Weight < 0.7 kg and ships without freight",
          "Avoid fragile builds (lighting, glass-heavy constructions)",
          "No trademarked IP; ship from Canada/US only"
        ]
      }
    ]
  },
  {
    title: "General Aesthetics",
    summary: "Enforce Minkowski’s calm, expensive minimalism across every vignette.",
    sections: [
      {
        heading: "Desired Mood",
        bullets: [
          "Wooden, ceramic, matte, minimalist", 
          "Atmosphere must feel calm, timeless, subtly expensive"
        ]
      },
      {
        heading: "Category Guardrails",
        bullets: [
          "Wall art stays abstract and textural—no typography or pop culture",
          "Decor objects lean organic and handcrafted—not cartoonish",
          "Furniture is clean-lined and uncluttered; avoid bulky plastic builds",
          "Textiles stay neutral, natural fibers only, no synthetic shine"
        ]
      },
      {
        heading: "Page Ritual",
        bullets: [
          "Hero image on #f3f2ec background with neutral lighting",
          "Title format: Material · Form · Function",
          "Two styled images + two live-setting videos per SKU",
          "Apply tagging matrix and flag inventory when nearing 80 SKUs"
        ]
      }
    ]
  }
];

const styles: Record<string, React.CSSProperties> = {
  heroSection: {
    display: "grid",
    gap: "var(--space-lg)",
    padding: "var(--space-lg) 0 calc(var(--space-lg) * 1.5)"
  },
  heroContent: {
    display: "grid",
    gap: "var(--space-sm)",
    maxWidth: "720px"
  },
  badge: {
    display: "inline-flex",
    alignSelf: "flex-start",
    alignItems: "center",
    padding: "0.375rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: brandColors.primary,
    backgroundColor: "rgba(141, 39, 41, 0.08)"
  },
  title: {
    fontFamily: typography.heading,
    fontSize: "clamp(2.25rem, 4vw, 3rem)",
    margin: 0,
    color: brandColors.text
  },
  subtitle: {
    fontSize: "1.15rem",
    maxWidth: "60ch",
    color: brandColors.muted,
    margin: 0,
    lineHeight: 1.6
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: "var(--space-sm)",
    border: "none",
    borderRadius: "var(--radius-md)",
    backgroundColor: brandColors.primary,
    color: brandColors.background,
    fontFamily: typography.heading,
    fontWeight: 600,
    fontSize: "1rem",
    padding: "0.75rem 1.5rem",
    cursor: "pointer"
  },
  rubricGrid: {
    display: "grid",
    gap: "var(--space-md)",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    paddingBottom: "calc(var(--space-lg) * 2)"
  },
  rubricCard: {
    position: "relative",
    display: "grid",
    gap: "0.5rem",
    padding: "var(--space-md)",
    borderRadius: "var(--radius-lg)",
    backgroundColor: brandColors.surface,
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.08)",
    outline: "none"
  },
  rubricTitle: {
    margin: 0,
    fontFamily: typography.heading,
    fontSize: "1.35rem",
    color: brandColors.text
  },
  rubricSummary: {
    margin: 0,
    color: brandColors.muted,
    lineHeight: 1.5
  },
  rubricHint: {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: brandColors.muted
  },
  popover: {
    position: "absolute",
    inset: "calc(100% + 0.5rem) auto auto 0",
    zIndex: 10,
    width: "100%",
    padding: "1.25rem",
    borderRadius: "var(--radius-lg)",
    backgroundColor: brandColors.surface,
    boxShadow: "0 18px 40px rgba(0, 0, 0, 0.2)",
    border: "1px solid rgba(32, 24, 24, 0.08)",
    display: "grid",
    gap: "1rem"
  },
  popoverSection: {
    display: "grid",
    gap: "0.5rem"
  },
  popoverHeading: {
    margin: 0,
    fontFamily: typography.heading,
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: brandColors.primary
  },
  popoverList: {
    margin: 0,
    paddingLeft: "1.1rem",
    display: "grid",
    gap: "0.35rem"
  },
  popoverItem: {
    color: brandColors.muted,
    fontSize: "0.9rem",
    lineHeight: 1.4
  }
};
