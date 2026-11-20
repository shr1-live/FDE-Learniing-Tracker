import { lazy, Suspense } from "react";
import { PageHeader } from "../components/PageHeader";
import { Tabs, TabPanel, useTab } from "../components/Tabs";
import { PageSkeleton } from "../components/States";

const StudyNotes = lazy(() => import("./StudyNotes"));
const StackGuide = lazy(() => import("./StackGuide"));
const Readiness = lazy(() => import("./Readiness"));
const Docs = lazy(() => import("./Docs"));

const TABS = [{ id: "notes", label: "Study notes" }, { id: "stack", label: "Stack guide" }, { id: "readiness", label: "Readiness" }, { id: "downloads", label: "Downloads" }];
const SUB: Record<string, string> = {
  notes: "Every topic in plain words, with one example and where to read more.",
  stack: "The stack-specific pieces for each layer of the programme.",
  readiness: "Rate yourself against the outline's skills, at the start and at the end.",
  downloads: "The outline, plans and scaffolds you can open or keep.",
};

/** Resources: notes, stack guide, readiness and downloads, one tab each. */
export default function Resources() {
  const tab = useTab(TABS);
  return (
    <>
      <PageHeader overline="Tools" title="Resources" sub={SUB[tab]} />
      <Tabs tabs={TABS} current={tab} label="Resources views" />
      <TabPanel label={TABS.find((t) => t.id === tab)!.label}>
        <Suspense fallback={<PageSkeleton />}>
          {tab === "notes" ? <StudyNotes /> : tab === "stack" ? <StackGuide /> : tab === "readiness" ? <Readiness /> : <Docs />}
        </Suspense>
      </TabPanel>
    </>
  );
}
