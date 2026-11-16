import { Link } from "react-router-dom";
import { DAYS } from "../data/types";
import { useStore } from "../lib/store";
import PrivateDoc from "../components/PrivateDoc";

export default function Curated() {
  const { isAdmin } = useStore();
  return (
    <>
      <header className="ph"><h1>Curated path: .NET with Azure</h1>
        <p className="muted">Shivanshu's route: strong C#, Azure Functions, Service Bus, App Service, Azure SQL and IoT Hub; new to LLMs, RAG, agents and MCP. Capstone: IoT OpsCopilot, built one layer a day.</p></header>
      <div className="two">
        <section className="card">
          <h2>Before Day 1</h2>
          <ol className="plain">
            <li>Install Ollama; pull <code>phi3</code> and <code>nomic-embed-text</code>.</li>
            <li>Install the .NET SDK and create the <code>ops-copilot</code> repo from the scaffold.</li>
            <li>Ask for Azure OpenAI access (one chat model, one embedding model, a Key Vault). Do not wait for it.</li>
            <li>No Azure access by 9 am on Day 1: you are on Track B. Write it in your tracker and go.</li>
          </ol>
          {isAdmin && <p><PrivateDoc name="FDE-Start-Tomorrow-Playbook.pdf" label="Start-tomorrow playbook (PDF)" /></p>}
          <p><a href="/docs/ops-copilot-scaffold.zip">Repo scaffold (zip)</a></p>
        </section>
        <section className="card">
          <h2>Rules that keep it layer by layer</h2>
          <ul className="plain">
            <li>One layer a day. Start layer N+1 only when layer N's checks are done.</li>
            <li>Every day ends with a test and something you can run.</li>
            <li>Days 1 to 8: core logic by hand. Day 9: use AI deliberately, then review it yourself.</li>
            <li>Practice hour: break it on purpose, then rewrite one core function from a blank page.</li>
            <li>Videos were checked to exist, not watched. The reading links carry the content.</li>
          </ul>
        </section>
      </div>
      <h2>Your ten days</h2>
      <ol className="daylist">{DAYS.map((d) => (<li key={d.n}><Link to={`/plan/${d.n}`}><span className="dn">Day {d.n}</span><span className="dt"><b>{d.name}</b><small>{d.goal}</small></span></Link></li>))}</ol>
    </>
  );
}
