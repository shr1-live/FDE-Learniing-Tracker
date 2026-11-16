import { getPersonas, setActive, useDevPersona } from "../lib/devPersona";

/** DEV BUILDS ONLY: switch between test accounts (member, reviewer, admin) to try the review flow locally. Renders nothing in production. */
export function DevPersonaBar() {
  const active = useDevPersona();
  if (!import.meta.env.DEV) return null;
  const names = Object.keys(getPersonas());
  if (names.length === 0) return null;
  return (
    <div className="devbar" role="group" aria-label="Test accounts (development only)">
      <small>Test account (dev only)</small>
      <div className="themesw">
        {names.map((n) => <button key={n} type="button" aria-pressed={active === n} onClick={() => setActive(n)}>{n}</button>)}
      </div>
    </div>
  );
}
