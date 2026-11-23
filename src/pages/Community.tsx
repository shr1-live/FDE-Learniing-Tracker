import { useCallback, useEffect, useState } from "react";
import { API_URL, ApiError } from "../lib/api";
import * as c from "../lib/communityApi";
import * as sub from "../lib/submissionsApi";
import { taskTitle } from "../data/programme";
import { PageHeader } from "../components/PageHeader";
import { Tabs, TabPanel, useTab } from "../components/Tabs";
import { Chip } from "../components/Chip";
import { EmptyState, ErrorState, Loading, TableSkeleton } from "../components/States";

const msg = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Try again.");

/** Work from people in your batch that you have not commented on yet. Comments are advice only: a reviewer still decides. */
function Peer() {
  const [items, setItems] = useState<c.PeerItem[] | null>(null);
  const [text, setText] = useState<Record<string, string>>({});
  const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  const load = useCallback(() => { setItems(null); setErr(""); c.peerQueue().then(setItems).catch((e) => { setErr(msg(e)); setItems([]); }); }, []);
  useEffect(load, [load]);
  const send = async (id: string) => {
    setErr(""); setOk("");
    try { await c.peerComment(id, text[id] ?? ""); setItems((xs) => (xs ?? []).filter((x) => x.id !== id)); setOk("Comment sent."); } catch (e) { setErr(msg(e)); }
  };
  if (err && items === null) return <ErrorState title="Could not load" message={err} onRetry={load} />;
  if (items === null) return <Loading label="Loading classmates' work"><TableSkeleton cols={3} /></Loading>;
  return (
    <>
      <header className="ph"><p className="muted">Read a classmate's handed-in day and say one useful thing: what worked, or what would make it clearer. Be kind and specific. Only reviewers approve work.</p></header>
      {err && <p className="banner err" role="alert">{err}</p>}
      <p className="small" role="status" aria-live="polite">{ok}</p>
      {items.length === 0 ? <EmptyState icon="users" title="Nothing to comment on">Work from people in your batch shows up here once they hand it in. You need to be in a batch.</EmptyState> : (
        <div className="stackcards">
          {items.map((i) => (
            <section key={i.id} className="card">
              <h2>{i.author}: {taskTitle(i.task_key)}</h2>
              {i.note && <><h3>What they did</h3><p className="wrap">{i.note}</p></>}
              {i.learned && <><h3>What they learned</h3><p className="wrap">{i.learned}</p></>}
              <label htmlFor={`pc-${i.id}`}>Your comment</label>
              <textarea id={`pc-${i.id}`} rows={2} maxLength={1000} value={text[i.id] ?? ""} onChange={(e) => setText((t) => ({ ...t, [i.id]: e.target.value }))} placeholder="One thing that worked, one thing to try" />
              <div className="row"><button type="button" className="btn" disabled={!(text[i.id] ?? "").trim()} onClick={() => void send(i.id)}>Send comment</button></div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

/** What classmates said about my own handed-in days. */
function OnMine() {
  const [rows, setRows] = useState<{ task: string; comments: c.PeerComment[] }[] | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    sub.mine().then(async (list) => {
      const days = list.filter((r) => r.status !== "draft");
      const all = await Promise.all(days.map(async (r) => ({ task: r.task_key, comments: await c.peerOnMine(r.task_key).catch(() => [] as c.PeerComment[]) })));
      setRows(all.filter((x) => x.comments.length > 0));
    }).catch((e) => { setErr(msg(e)); setRows([]); });
  }, []);
  if (rows === null) return <Loading label="Loading comments"><TableSkeleton cols={2} /></Loading>;
  if (err) return <p className="banner err" role="alert">{err}</p>;
  if (rows.length === 0) return <EmptyState icon="inbox" title="No comments yet">When a classmate comments on a day you handed in, it shows here.</EmptyState>;
  return (
    <div className="stackcards">
      {rows.map((r) => (
        <section key={r.task} className="card"><h2>{taskTitle(r.task)}</h2>
          <ul className="plain">{r.comments.map((m, i) => <li key={i}><b>{m.author}:</b> {m.comment} <small className="meta">{new Date(m.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</small></li>)}</ul>
        </section>
      ))}
    </div>
  );
}

/** Your batch, ranked by approved days. Only people who switched it on appear, and only their own batch sees it. */
function Board() {
  const [b, setB] = useState<c.Board | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => { setErr(""); c.leaderboard().then(setB).catch((e) => setErr(msg(e))); }, []);
  useEffect(load, [load]);
  const toggle = async () => { if (!b) return; try { await c.joinBoard(!b.on); load(); } catch (e) { setErr(msg(e)); } };
  if (err && !b) return <ErrorState title="Could not load" message={err} onRetry={load} />;
  if (!b) return <Loading label="Loading the leaderboard"><TableSkeleton cols={4} /></Loading>;
  return (
    <>
      <header className="ph"><p className="muted">A friendly look at who is moving. It is off until you switch it on, and then only people in your batch who also switched it on can see you.</p></header>
      <label className="check-row"><input type="checkbox" checked={b.on} onChange={() => void toggle()} /><span><b>Show me on my batch's leaderboard</b></span></label>
      {err && <p className="banner err" role="alert">{err}</p>}
      {!b.in_batch ? <EmptyState icon="users" title="You are not in a batch yet">The admin puts people into a batch. The leaderboard works inside a batch.</EmptyState>
        : b.rows.length === 0 ? <EmptyState icon="chart" title="Nobody is on it yet">Switch it on to be the first.</EmptyState> : (
          <div className="tablewrap" tabIndex={0} role="region" aria-label="Leaderboard">
            <table><thead><tr><th scope="col">#</th><th scope="col">Person</th><th scope="col">Approved days</th><th scope="col">Handed in</th></tr></thead>
              <tbody>{b.rows.map((r, i) => <tr key={r.user_id}><td className="tnum">{i + 1}</td><td>{r.name} {r.me && <Chip tone="info">you</Chip>}</td><td className="tnum">{r.approved}</td><td className="tnum">{r.handed_in}</td></tr>)}</tbody></table>
          </div>
        )}
    </>
  );
}

export default function Community() {
  const tabs = [{ id: "peer", label: "Comment on classmates" }, { id: "mine", label: "Comments on my work" }, { id: "board", label: "Leaderboard" }];
  const tab = useTab(tabs);
  if (!API_URL) return <><PageHeader overline="Community" title="Community" /><div className="card"><p className="muted">The backend is not connected for this site.</p></div></>;
  return (
    <>
      <PageHeader overline="Community" title="Learn with your batch" sub="Comment on classmates' work, read what they said about yours, and (if you like) see the batch leaderboard." />
      <Tabs tabs={tabs} current={tab} label="Community views" />
      <TabPanel label={tabs.find((t) => t.id === tab)!.label}>{tab === "peer" ? <Peer /> : tab === "mine" ? <OnMine /> : <Board />}</TabPanel>
    </>
  );
}
