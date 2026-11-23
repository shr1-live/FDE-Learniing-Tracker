import { useEffect, useMemo, useState } from "react";
import { READINESS } from "../data/types";
import { useStore } from "../lib/store";
import { useView } from "../lib/viewAs";
import { API_URL, ApiError } from "../lib/api";
import * as rep from "../lib/reportsApi";
import { Kpi } from "../components/Kpi";
import { Tabs, TabPanel, useTab } from "../components/Tabs";
import { EmptyState, ErrorState, Loading, TableSkeleton } from "../components/States";

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);
const fmt = (n: number | null) => (n === null ? "-" : String(n));
const gain = (a: number | null, b: number | null) => (a === null || b === null ? null : Math.round((b - a) * 10) / 10);
const sign = (n: number | null) => (n === null ? "-" : n > 0 ? `+${n}` : String(n));

/** Everyone's self-ratings for reviewers and the admin: a person by skill heatmap, plus the averages that show where the group is weak. */
function Everyone() {
  const [rows, setRows] = useState<rep.ReadinessPerson[] | null>(null);
  const [err, setErr] = useState("");
  const [sort, setSort] = useState<"name" | "final" | "gain">("name");
  const load = () => { setErr(""); rep.readinessEveryone().then(setRows).catch((e) => { setErr(e instanceof ApiError ? e.message : "Could not load the ratings. Try again."); setRows([]); }); };
  useEffect(load, []);

  const people = useMemo(() => {
    const list = (rows ?? []).map((p) => {
      const b = Object.values(p.base), f = Object.values(p.final);
      return { ...p, a1: avg(b), a10: avg(f), g: gain(avg(b), avg(f)) };
    });
    const by = { name: (a: typeof list[number], c: typeof list[number]) => a.name.localeCompare(c.name), final: (a: typeof list[number], c: typeof list[number]) => (c.a10 ?? -1) - (a.a10 ?? -1), gain: (a: typeof list[number], c: typeof list[number]) => (c.g ?? -99) - (a.g ?? -99) }[sort];
    return list.sort(by);
  }, [rows, sort]);

  const perSkill = useMemo(() => READINESS.map((_, i) => {
    const b = (rows ?? []).map((p) => p.base[i]).filter((x): x is number => x !== undefined);
    const f = (rows ?? []).map((p) => p.final[i]).filter((x): x is number => x !== undefined);
    return { a1: avg(b), a10: avg(f), g: gain(avg(b), avg(f)) };
  }), [rows]);

  if (!API_URL) return <EmptyState icon="inbox" title="Not connected">This site is not connected to its server, so other people's ratings cannot be read.</EmptyState>;
  if (rows === null) return <Loading label="Loading everyone's ratings"><TableSkeleton rows={5} /></Loading>;
  if (err) return <ErrorState title="Could not load the ratings" message={err} onRetry={load} />;
  if (rows.length === 0) return <EmptyState icon="target" title="Nobody has rated yet">When people rate themselves on the Readiness page (Day 1 and Day 10), their ratings show up here.</EmptyState>;

  const all1 = people.flatMap((p) => Object.values(p.base)), all10 = people.flatMap((p) => Object.values(p.final));
  const weakest = perSkill.map((s, i) => ({ i, v: s.a10 ?? s.a1 })).filter((x): x is { i: number; v: number } => x.v !== null).sort((a, b) => a.v - b.v).slice(0, 3);
  return (
    <>
      <div className="kpis" aria-label="Totals">
        <Kpi icon="user" label="People rated" value={String(people.length)} sub={`${people.filter((p) => p.a10 !== null).length} have a Day 10 rating`} />
        <Kpi icon="target" label="Average on Day 1" value={fmt(avg(all1))} sub="out of 5, all skills" />
        <Kpi icon="check" label="Average on Day 10" value={fmt(avg(all10))} sub="out of 5, all skills" tone="ok" />
        <Kpi icon="chart" label="Average gain" value={sign(gain(avg(all1), avg(all10)))} sub="Day 10 minus Day 1" />
      </div>
      {weakest.length > 0 && (
        <p className="rd-weak"><b>Weakest skills right now:</b> {weakest.map((w) => `${READINESS[w.i]!.skill} (${w.v})`).join(" · ")}</p>
      )}
      <div className="rd-controls" role="group" aria-label="Sort people">
        <span className="meta">Sort by</span>
        {([["name", "Name"], ["final", "Day 10 average"], ["gain", "Biggest gain"]] as const).map(([v, l]) => <button key={v} type="button" className="fchip" aria-pressed={sort === v} onClick={() => setSort(v)}>{l}</button>)}
      </div>
      <div className="tablewrap rd-wrap" role="region" aria-label="Readiness ratings by person and skill" tabIndex={0}>
        <table className="rd-table">
          <thead>
            <tr>
              <th scope="col" className="rd-name">Person</th>
              <th scope="col" className="rd-sum">Day 1</th><th scope="col" className="rd-sum">Day 10</th><th scope="col" className="rd-sum">Gain</th>
              {READINESS.map((r, i) => <th key={r.skill} scope="col" className="rd-skill" title={r.skill}><span>{r.skill}</span><small className="sr">, skill {i + 1}</small></th>)}
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.user_id}>
                <th scope="row" className="rd-name">{p.name}{p.batch_name && <small className="meta"> {p.batch_name}</small>}</th>
                <td className="rd-sum">{fmt(p.a1)}</td><td className="rd-sum">{fmt(p.a10)}</td>
                <td className={"rd-sum" + ((p.g ?? 0) > 0 ? " up" : (p.g ?? 0) < 0 ? " down" : "")}>{sign(p.g)}</td>
                {READINESS.map((r, i) => {
                  const b = p.base[i], f = p.final[i];
                  const shown = f ?? b;
                  const label = `${p.name}, ${r.skill}: Day 1 ${b ?? "not rated"}, Day 10 ${f ?? "not rated"}`;
                  return <td key={i} className={"rd-cell " + (shown ? `r${shown}` : "none") + (f === undefined && b !== undefined ? " base-only" : "")} title={label}><span aria-label={label}>{shown ?? ""}</span></td>;
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><th scope="row" className="rd-name">Group average, Day 1</th><td colSpan={3} />{perSkill.map((s, i) => <td key={i} className="rd-sum">{fmt(s.a1)}</td>)}</tr>
            <tr><th scope="row" className="rd-name">Group average, Day 10</th><td colSpan={3} />{perSkill.map((s, i) => <td key={i} className="rd-sum">{fmt(s.a10)}</td>)}</tr>
            <tr><th scope="row" className="rd-name">Gain</th><td colSpan={3} />{perSkill.map((s, i) => <td key={i} className={"rd-sum" + ((s.g ?? 0) > 0 ? " up" : "")}>{sign(s.g)}</td>)}</tr>
          </tfoot>
        </table>
      </div>
      <p className="meta rd-legend"><span className="rd-cell r1" aria-hidden="true" />1 <span className="rd-cell r3" aria-hidden="true" />3 <span className="rd-cell r5" aria-hidden="true" />5 · The colour shows the Day 10 rating; a dashed border means only Day 1 is rated so far. Hover a square for both ratings.</p>
    </>
  );
}

/** Your own ratings: the Day 1 and Day 10 self-assessment against the outline's skills table. */
function Mine() {
  const { entries, setEntry } = useStore();
  const sel = (k: string, label: string) => (
    <select aria-label={label} value={String(entries[k] ?? "")} onChange={(e) => setEntry(k, e.target.value === "" ? null : Number(e.target.value))}>
      <option value="">-</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
    </select>
  );
  return (
    <>
      <header className="ph"><p className="muted">Rate yourself from 1 to 5 against the outline's skills table. Do it on Day 1 and again on Day 10.</p></header>
      <div className="tablewrap"><table>
        <thead><tr><th>Skill</th><th>Target proficiency</th><th>Practised</th><th>Day 1</th><th>Day 10</th></tr></thead>
        <tbody>{READINESS.map((r, i) => (
          <tr key={r.skill}><td>{r.skill}</td><td>{r.target}</td><td>{r.where}</td><td>{sel(`rate:base:${i}`, r.skill + " day 1")}</td><td>{sel(`rate:final:${i}`, r.skill + " day 10")}</td></tr>))}</tbody>
      </table></div>
    </>
  );
}

export default function Readiness() {
  const { reviewerView } = useView();
  const tabs = [{ id: "everyone", label: "Everyone" }, { id: "mine", label: "My ratings" }];
  const tab = useTab(tabs);
  if (!reviewerView) return <Mine />;
  return (
    <>
      <Tabs tabs={tabs} current={tab} label="Readiness" />
      <TabPanel label={tab === "everyone" ? "Everyone's readiness" : "My readiness ratings"}>{tab === "everyone" ? <Everyone /> : <Mine />}</TabPanel>
    </>
  );
}
