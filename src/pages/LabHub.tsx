import { lazy, Suspense, useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Tabs, TabPanel, useTab } from "../components/Tabs";
import { GeminiKeyPanel } from "../components/GeminiKeyPanel";
import { PageSkeleton } from "../components/States";
import { API_URL, getUsage, type Usage } from "../lib/assistantApi";
import { useOwnKey } from "../lib/llmKey";

const Lab = lazy(() => import("./Lab"));
const Assistant = lazy(() => import("./Assistant"));
const TaskAssistant = lazy(() => import("./TaskAssistant"));
const Rag = lazy(() => import("./Rag"));

const TABS = [{ id: "lab", label: "Lab" }, { id: "recruit", label: "Recruitment assistant" }, { id: "tasks", label: "Task assistant" }, { id: "rag", label: "Document assistant" }];
const SUB: Record<string, string> = {
  lab: "Run the practicals, compare models on the same fixed tests, and keep the runs as proof.",
  recruit: "Match candidate profiles to a job description, with quotes as evidence.",
  tasks: "Manage your own tasks in plain words; the server checks every request.",
  rag: "Week 2: answer questions from your approved documents, with citations, and measure how the settings change the results.",
};

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
      {API_URL && <GeminiKeyPanel serverModel={usage && !usage.using_own_key ? usage.model : null} serverConfigured={usage ? usage.configured || !!usage.using_own_key : undefined} onChange={() => setTick((t) => t + 1)} />}
      <TabPanel label={TABS.find((t) => t.id === tab)!.label}>
        <Suspense fallback={<PageSkeleton />}>
          {tab === "lab" ? <Lab key={tick} /> : tab === "recruit" ? <Assistant key={tick} /> : tab === "rag" ? <Rag /> : <TaskAssistant key={tick} />}
        </Suspense>
      </TabPanel>
    </>
  );
}
