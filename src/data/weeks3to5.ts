// Weeks 3 to 5 as published in the programme sheet (FDE - Practical Job-Readiness Guide): topics, practical task, acceptance points and evidence.
// Weeks 1 and 2 have their own files. The acceptance points of each day are its tick boxes; the "Evidence" line of the sheet becomes the proof hint.
import type { WeekDay } from "./weekPlan";
import type { DayExpectation } from "./weekExpect";

type Spec = { title: string; topics: string[]; task: string; done: string[]; evidence: string; summary: string; ideas: string[] };

const HOW = [
  "Read the day's topics first, then write down what you will build and how you will know it works.",
  "Build it in small steps and test each step before the next. Keep real keys out of the code.",
  "Collect the proof for every point as you go (a link, a screenshot or a log), not at the end.",
];

function build(weekGoal: string, specs: Spec[]): { days: WeekDay[]; expect: Record<number, DayExpectation> } {
  const days: WeekDay[] = specs.map((s, i) => ({ n: i + 1, title: s.title, topics: s.topics, task: s.task, how: HOW, done: s.done, summary: s.summary, keyIdeas: s.ideas }));
  const expect: Record<number, DayExpectation> = {};
  specs.forEach((s, i) => {
    expect[i + 1] = {
      goal: weekGoal,
      learnHint: `In your own words: ${s.ideas[0]!.charAt(0).toLowerCase()}${s.ideas[0]!.slice(1)}`,
      items: s.done.map((d) => ({ means: d, proof: `${s.evidence} Link or screenshot that shows this point working.` })),
    };
  });
  return { days, expect };
}

const W3 = build("Show that you can build agents, workflows and MCP tools that stay inside clear limits and ask a person before anything consequential.", [
  { title: "MCP fundamentals",
    topics: ["MCP architecture: hosts, clients and servers", "Primitives: tools, resources and prompts", "Capability discovery and negotiation", "Transports and the connection lifecycle", "Tool input and output schemas and validation", "Authentication, authorization and secure configuration", "Error handling, timeouts and integration testing"],
    task: "Build or configure one MCP server that exposes a safe, read-only tool, and connect a client to it.",
    done: ["The server exposes a read-only tool.", "A client connects to it and calls the tool.", "Inputs are validated.", "Unauthorized and malformed calls are tested.", "The setup is documented."],
    evidence: "MCP server, tool schema, connection instructions.",
    summary: "MCP is a standard way for a model's host application to discover and call tools that a separate server provides. The server describes each tool with a schema; your code validates every call and refuses what is not allowed.",
    ideas: ["A tool is a described, validated function the client may call.", "Read-only and authenticated by default; test the bad calls too."] },
  { title: "Agent fundamentals",
    topics: ["The observe, decide, act loop", "Task planning and decomposition", "Tool selection, invocation and reading results", "Agent state across steps", "Short-term and persistent memory", "Stopping conditions and iteration limits", "Bounded autonomy and permissions", "Workflows instead of agents when they fit"],
    task: "Build a single-agent workflow that uses two tools with explicit step limits.",
    done: ["The agent uses two controlled tools.", "A step limit and a time limit are enforced.", "Every decision is logged.", "Failure and termination are tested."],
    evidence: "Agent workflow, trace or log output.",
    summary: "An agent is a loop: look at the state, decide the next step, call a tool, read the result, repeat. Your code runs the tools, caps the steps and the time, and writes down every decision.",
    ideas: ["The model decides; your code runs the tool and enforces the limits.", "Cap steps and time, and log each decision so a run can be replayed."] },
  { title: "Workflow orchestration",
    topics: ["State machines and the execution lifecycle", "Graph orchestration and dependencies", "Branching and routing on results", "Retry policy, backoff and timeouts", "Checkpoints and resumable runs", "Persisting state and intermediate results", "Idempotency and no duplicate side effects", "Failure recovery and end-to-end tests"],
    task: "Implement a stateful workflow with branching and recoverable failures (LangGraph is a good fit).",
    done: ["Two branches are demonstrated.", "A transient failure is simulated.", "The run resumes from a checkpoint without duplicate side effects."],
    evidence: "Workflow graph, tests, execution traces.",
    summary: "A workflow is a graph of named steps with saved state. Failures are expected: retry the step, resume from the last checkpoint, and make each side effect safe to repeat so nothing happens twice.",
    ideas: ["Save a checkpoint after every step so a failed run resumes, not restarts.", "An action that repeats must have the same effect as doing it once (idempotent)."] },
  { title: "Human approval and security",
    topics: ["Human-in-the-loop intervention points", "Least-privilege access for agents and tools", "Approval for sensitive or irreversible actions", "Prompt injection and instruction conflicts", "Validating untrusted tool responses and external content", "Audit trails of agent decisions", "Testing approval, rejection and unauthorized actions"],
    task: "Add an approval step before a consequential action, then test malicious and irrelevant instructions against it.",
    done: ["An action without approval is blocked.", "Malicious inputs are tested.", "Approvals and denied actions are recorded."],
    evidence: "Approval flow, threat cases, security notes.",
    summary: "Give an agent the least access it needs and put a person in front of anything that cannot be undone. Treat text from tools and documents as data, never as orders, and keep a record of every approval and refusal.",
    ideas: ["A consequential action waits for an explicit, recorded approval.", "Content that arrives from outside is data, not an instruction."] },
  { title: "Agent quality and capstone proposal",
    topics: ["Agent evaluation sets", "Task completion and success rates", "Tool selection and invocation accuracy", "Execution traces and debugging multi-step failures", "End-to-end latency and token use", "Cost analysis and resource limits", "Failure analysis and regression tests", "Capstone scoping and measurable success criteria"],
    task: "Complete a multi-step business workflow agent, evaluate it, and submit a capstone proposal and scope.",
    done: ["At least 10 scenarios are evaluated.", "Failures and improvements are recorded.", "A feasible capstone scope and success metrics are submitted."],
    evidence: "Working agent, evaluation report, capstone proposal.",
    summary: "Measure the agent on a fixed set of scenarios: did it finish, did it pick the right tool, how many steps, how long, how many tokens. Record the failures, fix them, and use what you learned to scope a capstone you can really finish.",
    ideas: ["Score the whole run (tools, steps, time, tokens), not only the last answer.", "A capstone needs a scope small enough to finish and a number that proves success."] },
]);

const W4 = build("Show that you can use AI coding tools in a controlled way and deliver a reviewed, tested, deployed change.", [
  { title: "Agentic coding workflow",
    topics: ["Exploring and understanding an existing repository", "Planning before changing code", "Bounded implementation and scope control", "Reviewing generated changes and diffs", "Writing and running relevant tests", "Human review of AI-generated changes", "Version control, commits and safe rollback", "Human oversight throughout"],
    task: "Use an agentic coding tool to implement a bounded feature in a starter or existing repository.",
    done: ["A reviewed feature is delivered with a plan, tests and a clean diff.", "You can explain the generated code independently."],
    evidence: "Plan, commits or PR, tests, short session summary.",
    summary: "Let the tool explore the repository and write a plan first. Keep the change small, read every line of the diff, run the tests, and commit in steps so a bad change can be rolled back. You stay responsible for the code.",
    ideas: ["Plan first, change a small bounded part, then review the whole diff.", "You must be able to explain every line the tool wrote."] },
  { title: "Context engineering",
    topics: ["Repository maps and finding relevant code", "Project instructions and coding conventions", "Choosing relevant context for a task", "Architecture notes and dependencies", "Context window limits and prioritisation", "Spotting outdated or conflicting instructions", "Keeping secrets out of the context"],
    task: "Create project context files and ask the coding agent to implement a feature against them.",
    done: ["Reusable context files are created.", "Results with and without the context are compared.", "Accuracy is verified and no secret is exposed."],
    evidence: "Context files, generated plan, diff review.",
    summary: "The agent is only as good as what it can see. Write a short, current file of rules and a map of the code, give it only the relevant parts, never put secrets in it, and compare the same task with and without the file.",
    ideas: ["A short, current context file beats a long outdated one.", "Compare with and without context, and keep secrets out of both."] },
  { title: "Skills, subagents and MCP",
    topics: ["Reusable skills and task instructions", "Subagents and separation of responsibilities", "Hooks and automated checks", "MCP integration with development tools", "Tool permissions and least privilege", "Delegating tasks and validating results", "Isolating agent tasks and environments"],
    task: "Create one reusable development skill or agent workflow and integrate a safe MCP tool.",
    done: ["A reusable workflow is created.", "A safe tool is integrated.", "Repeatable execution and permission tests are shown."],
    evidence: "Skill or agent config, usage example, tests.",
    summary: "Turn a job you repeat into a skill or subagent with its own instructions and the smallest set of permissions. Connect a safe tool, run it twice to show it repeats, and test that it cannot do what it was not allowed to.",
    ideas: ["A skill is a repeatable instruction with limited permissions.", "Validate what a delegated agent returns before relying on it."] },
  { title: "AI-assisted QA and code review",
    topics: ["Test-driven development with AI", "Generating unit, integration and regression tests", "Static analysis and quality checks", "Dependency vulnerability and compatibility checks", "Reviewing generated code for correctness", "Security testing and common vulnerabilities", "Independently verifying AI test results and fixes"],
    task: "Use AI to propose tests and review a change, then independently verify its findings and fixes.",
    done: ["Meaningful regression tests are added.", "AI findings are verified manually.", "Confirmed defects are fixed.", "A reviewed PR is submitted."],
    evidence: "Test report, review comments, corrected PR.",
    summary: "Let the AI suggest tests and review comments, then check each one yourself: reproduce the problem, fix only what is confirmed, and add a regression test so it cannot come back. An unverified AI finding is only a guess.",
    ideas: ["Reproduce every AI finding before fixing it.", "Each confirmed defect gets a regression test."] },
  { title: "Production delivery",
    topics: ["CI/CD pipelines and quality gates", "Containers and reproducible builds", "Environment configuration and deployment", "Secrets management", "Health checks and readiness", "Structured logging and error reporting", "Monitoring and alerting", "Rollback and recovery"],
    task: "Deploy the Week 4 feature to a non-production environment with basic observability.",
    done: ["It is deployed to a non-production or reproducible local environment.", "Health checks and logs are demonstrated.", "The rollback procedure is demonstrated."],
    evidence: "Deployment URL or run instructions, pipeline, logs, rollback notes.",
    summary: "Build the same container everywhere, keep secrets out of the image, add a health check and structured logs, and let a pipeline run the tests before deploying. Practise the rollback before you need it.",
    ideas: ["The same build runs in every environment; only configuration changes.", "A rollback you have not practised is not a rollback."] },
]);

const W5 = build("Show that you can take a customer problem from discovery to a deployed, evaluated and demonstrated solution.", [
  { title: "Capstone discovery and design",
    topics: ["Customer discovery and stakeholder requirements", "Problem framing and business outcome", "Personas and representative workflows", "Technical, business and operational constraints", "Functional and non-functional acceptance criteria", "Solution architecture and trade-offs", "Milestones and implementation plan"],
    task: "Confirm the capstone problem, users, requirements, assumptions and technical design.",
    done: ["A scoped brief, architecture, risk register and measurable success criteria are submitted.", "A mentor review is obtained."],
    evidence: "Problem brief, user stories, architecture, delivery plan.",
    summary: "Agree what problem you are solving, for whom, and how you will know it worked, before you build. Write it down with the architecture, the risks and the milestones, and have a mentor review it.",
    ideas: ["Success is a number agreed before building.", "Write down assumptions and risks so a mentor can challenge them."] },
  { title: "Capstone implementation I",
    topics: ["Building in end-to-end vertical slices", "Data modelling and persistence", "API contracts and validation", "User interface or interaction layer", "Authentication and authorization boundaries", "Integration tests of core workflows"],
    task: "Build the core application workflow, data model and primary APIs or UI.",
    done: ["A runnable core workflow with persistence and tests is delivered.", "Progress against the acceptance criteria is demonstrated."],
    evidence: "Working vertical slice, repository, tests.",
    summary: "Build one thin path through the whole system first (screen, API, data), with tests, then widen it. A working slice shows real progress against the acceptance criteria.",
    ideas: ["A thin working slice beats many half-built parts.", "Validate at the API edge and test the core workflow end to end."] },
  { title: "Capstone implementation II",
    topics: ["Integrating AI capabilities", "Model choice by quality, latency and cost", "RAG or agents only when the requirement calls for them", "External tools and services", "Evaluation sets and AI quality measures", "Guardrails, validation and fallbacks"],
    task: "Implement the AI capability and the external integration, and add evaluation and safety controls.",
    done: ["An AI workflow with representative evaluation cases is delivered.", "Unsupported inputs and an integration failure are tested.", "Cost and latency are recorded."],
    evidence: "AI workflow, integration, evaluation results.",
    summary: "Add the AI part where the requirement needs it, pick the model by measured quality, latency and cost, and surround it with guardrails and a fallback. Evaluation cases and recorded cost and latency are the proof.",
    ideas: ["Choose the model and method by measured results, not preference.", "Test what happens when input is unsupported and when an integration fails."] },
  { title: "Capstone hardening",
    topics: ["Functional and security testing", "Performance testing and bottlenecks", "Logs, metrics and traces", "Deployment and environment readiness", "Documentation and runbooks", "Incident recovery and rollback"],
    task: "Fix defects, complete the tests, deploy, and prepare the demo and documentation.",
    done: ["Critical defects are resolved.", "Deployment and recovery are demonstrated.", "Test results, a README and known limitations are provided."],
    evidence: "Deployment, README, test and security checklist.",
    summary: "Close the critical bugs, run the functional, security and load checks, deploy, and show you can recover. Write a README that lets a new person run it, and list the known limitations honestly.",
    ideas: ["Fix critical defects first and show the proof they are fixed.", "Document known limitations as clearly as the features."] },
  { title: "Final demonstration and evaluation",
    topics: ["A customer-facing demonstration of real workflows", "Business value and measurable outcomes", "Explaining the architecture", "Justifying decisions and trade-offs", "Cost estimates and operations", "Security controls and access boundaries", "Limitations, failure modes and recovery", "Customer handover and support documents"],
    task: "Demonstrate the solution and answer questions on architecture, AI quality, security, cost and failure modes.",
    done: ["The solution is demonstrated end to end against the agreed criteria.", "Code, architecture, evaluation results and handover are submitted.", "Reviewer questions are answered."],
    evidence: "Demo, source code, architecture, final scorecard.",
    summary: "Show the solution working on real scenarios against the criteria you agreed, explain why it is built this way, give the cost and the limits honestly, and hand over documents someone else can support.",
    ideas: ["Show it working against the agreed criteria, then explain the decisions.", "Honest limits, costs and failure modes build trust."] },
]);

export const WEEK3 = { title: "Week 3: MCP, agents, workflows and approval, day by day", ...W3 };
export const WEEK4 = { title: "Week 4: agentic coding and production delivery, day by day", ...W4 };
export const WEEK5 = { title: "Week 5: capstone, day by day", ...W5 };
