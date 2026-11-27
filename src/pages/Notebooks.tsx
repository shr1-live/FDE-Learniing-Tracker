import { Link } from "react-router-dom";
import { ALL_NOTEBOOKS, colabUrl } from "../data/builtWork";

const WEEKS = [1, 2];
// One programme entry can cover two days (Week 2, Days 1 and 2), each with its own notebook labelled "Day 1: topic".
const combined = (n: (typeof ALL_NOTEBOOKS)[number]) => n.built.d.length > 1;

/** Practice lab, Notebooks tab: one card per day with its Google Colab notebook, the live tool and the evidence page. */
export default function Notebooks() {
  return (
    <>
      <p className="muted small" style={{ marginBottom: 0 }}>Each notebook runs the ideas of one day in small steps you can change. Open it in Google Colab, run the cells from the top (Shift+Enter), then try the exercises at the end. Week 1 notebooks use a labelled stand-in model so they run anywhere; the real model results are on each evidence page.</p>
      {WEEKS.map((w) => (
        <section key={w} aria-labelledby={`nb-w${w}`}>
          <h2 id={`nb-w${w}`} style={{ marginTop: "var(--s-6)" }}>Week {w}</h2>
          <ul className="plain" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--s-3)" }}>
            {ALL_NOTEBOOKS.filter((n) => n.built.w === w).map((n) => (
              <li key={n.file} className="card gap">
                <p className="eyebrow">{n.built.week}, {combined(n) ? n.label.split(":")[0] : n.built.days}</p>
                <h3 style={{ margin: 0 }}>{combined(n) ? n.label.split(": ")[1] : n.built.title}</h3>
                <div className="row">
                  <a className="btn" href={colabUrl(n.file)} target="_blank" rel="noopener noreferrer">Open in Colab<span className="sr"> (opens in a new tab)</span></a>
                  <Link className="btn secondary" to={n.built.open}>Live tool</Link>
                  <a className="btn secondary" href={n.built.evidence} target="_blank" rel="noopener noreferrer">Evidence<span className="sr"> (opens in a new tab)</span></a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="meta" style={{ marginTop: "var(--s-6)" }}>Colab opens the notebook from the public API repository on GitHub. If it says not found, the notebook has not been merged to the main branch yet.</p>
    </>
  );
}
