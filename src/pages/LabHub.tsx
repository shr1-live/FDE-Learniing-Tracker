import { lazy, Suspense, useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Tabs, TabPanel, useTab } from "../components/Tabs";
import { GeminiKeyPanel } from "../components/GeminiKeyPanel";
import { PageSkeleton } from "../components/States";
import { API_URL, getUsage, type Usage } from "../lib/assistantApi";
import { useOwnKey } from "../lib/llmKey";
import { ALL_NOTEBOOKS, colabUrl } from "../data/builtWork";

const Lab = lazy(() => import("./Lab"));
const Assistant = lazy(() => import("./Assistant"));
const TaskAssistant = lazy(() => import("./TaskAssistant"));
const Rag = lazy(() => import("./Rag"));
const VectorLab = lazy(() => import("./VectorLab"));
const DocQA = lazy(() => import("./DocQA"));
const Notebooks = lazy(() => import("./Notebooks"));

const TABS = [{ id: "lab", label: "Lab" }, { id: "recruit", label: "Recruitment assistant" }, { id: "tasks", label: "Task assistant" }, { id: "rag", label: "Document assistant" }, { id: "vector", label: "Vector search" }, { id: "docqa", label: "Ask your documents" }, { id: "notebooks", label: "Notebooks" }];
const SUB: Record<string, string> = {
  lab: "Run the practicals, compare models on the same fixed tests, and keep the runs as proof.",
  recruit: "Match candidate profiles to a job description, with quotes as evidence.",
  tasks: "Manage your own tasks in plain words; the server checks every request.",
  rag: "Week 2: answer questions from your approved documents, with citations, and measure how the settings change the results.",
  vector: "Week 2, Day 3: live vector search on Postgres with pgvector. Compare vector, keyword and hybrid search, Top K and metadata filters.",
  docqa: "Week 2, Day 5: upload documents, ask questions, get answers with citations and follow-ups. The server decides who may read which document.",
  notebooks: "Practise every day's ideas step by step in Google Colab, then compare with the live tools.",
};

// These tabs do not call the Gemini model, so the key panel is hidden there.
const NO_GEMINI_TABS = ["vector", "docqa", "notebooks"];

// Which notebooks belong to which tab (file names without .ipynb). Shown as a short "Practise this" strip under the tab bar.
const TAB_NOTEBOOKS: Record<string, string[]> = {
  lab: ["week1-day1-llm-fundamentals", "week1-day4-evaluation-guardrails"],
  recruit: ["week1-day2-prompt-engineering", "week1-day5-end-to-end-assistant"],
  tasks: ["week1-day3-structured-outputs-tools"],
  rag: ["week2-day1-rag-architecture", "week2-day2-chunking-embeddings"],
  vector: ["week2-day3-vector-search", "week2-day4-rag-evaluation"],
  docqa: ["week2-day5-document-assistant"],
};

/** A short strip under the tab bar: the notebooks that explain what this tab does. */
function PractiseStrip({ tab }: { tab: string }) {
  const items = (TAB_NOTEBOOKS[tab] ?? []).flatMap((f) => ALL_NOTEBOOKS.filter((n) => n.file === f));
  if (items.length === 0) return null;
  return (
    <aside className="callout ok" aria-label="Practise this in Google Colab">
      <b>Practise this step by step:</b>{" "}
      {items.map((n, i) => (
        <span key={n.file}>{i > 0 && " · "}<a href={colabUrl(n.file)} target="_blank" rel="noopener noreferrer">{n.built.week}, {n.built.d.length > 1 ? n.label : n.built.days}: {n.built.title}<span className="sr"> (opens in a new tab)</span></a></span>
      ))}
    </aside>
  );
}

/** Practice lab: the lab and both assistants in one place, with ONE "Use your own Gemini key" panel above them. */
export default function LabHub() {
  const tab = useTab(TABS);
  const own = useOwnKey();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => { if (API_URL) getUsage().then(setUsage).catch(() => setUsage(null)); }, [tick, own?.key]);
  return (
    <>
      <PageHeader overline="Tools" title="Practice lab" sub={SUB[tab]} />
      <Tabs tabs={TABS} current={tab} label="Practice lab views" />
      {API_URL && !NO_GEMINI_TABS.includes(tab) && <GeminiKeyPanel serverModel={usage && !usage.using_own_key ? usage.model : null} serverConfigured={usage ? usage.configured || !!usage.using_own_key : undefined} onChange={() => setTick((t) => t + 1)} />}
      <PractiseStrip tab={tab} />
      <TabPanel label={TABS.find((t) => t.id === tab)!.label}>
        <Suspense fallback={<PageSkeleton />}>
          {tab === "lab" ? <Lab key={tick} /> : tab === "recruit" ? <Assistant key={tick} /> : tab === "rag" ? <Rag /> : tab === "vector" ? <VectorLab /> : tab === "docqa" ? <DocQA /> : tab === "notebooks" ? <Notebooks /> : <TaskAssistant key={tick} />}
        </Suspense>
      </TabPanel>
    </>
  );
}
