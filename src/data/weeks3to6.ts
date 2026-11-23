// DRAFT Weeks 3 to 6, written from the company outline (agents and MCP, agentic development and production readiness, capstone).
// The programme sheets for these weeks are not published yet: when they are, replace the entry for that week in this file
// (or add a week file like week2.ts) and the Week page, Review page, heatmap and quizzes pick it up. Every title says "draft".
import type { WeekDay } from "./weekPlan";
import type { DayExpectation } from "./weekExpect";

type Spec = { title: string; topics: string[]; task: string; done: string[]; summary: string; ideas: string[] };

const HOW = [
  "Read the day's topics first, then write down what you will build and how you will know it works.",
  "Build it in small steps and test each step before the next. Keep real keys out of the code.",
  "Collect the proof for every point as you go (a link, a screenshot or a log), not at the end.",
];
const PROOF = [
  "Link to the code, plus a screenshot or log showing it working.",
  "A test, log or screenshot that shows this behaviour.",
  "The file or note in the repository (link) and one real example.",
  "A short note with your result and how you checked it.",
];

function build(weekGoal: string, specs: Spec[]): { days: WeekDay[]; expect: Record<number, DayExpectation> } {
  const days: WeekDay[] = specs.map((s, i) => ({ n: i + 1, title: s.title, topics: s.topics, task: s.task, how: HOW, done: s.done, summary: s.summary, keyIdeas: s.ideas }));
  const expect: Record<number, DayExpectation> = {};
  specs.forEach((s, i) => {
    expect[i + 1] = {
      goal: weekGoal,
      learnHint: `In your own words: ${s.ideas[0]!.charAt(0).toLowerCase()}${s.ideas[0]!.slice(1)}`,
      items: s.done.map((d, j) => ({ means: d, proof: PROOF[j % PROOF.length]! })),
    };
  });
  return { days, expect };
}

const W3 = build("Show that you can build an agent that reasons, uses tools and stays inside clear limits.", [
  { title: "Agent basics and tool use", topics: ["What an agent is: a model that decides the next step", "Tools, arguments and results", "The reason-act-observe loop"],
    task: "Build a small agent that answers a question by calling at least two tools (for example a calculator and a lookup) in a loop until it can answer.",
    done: ["The agent chooses between at least two tools and calls them with valid arguments.", "The loop stops by itself when the answer is ready, and also after a maximum number of steps.", "Every tool call and result is logged so a run can be replayed.", "A tool that fails returns a clear error and the agent recovers or says it cannot continue."],
    summary: "An agent is a model that decides what to do next, calls tools your code provides, reads the results and repeats until it can answer. Your code runs the tools and sets the limits. A step limit and a log keep it safe and debuggable.",
    ideas: ["The model asks for a tool call; your code checks and runs it.", "Always cap the number of steps and log each one."] },
  { title: "Planning and multi-step workflows", topics: ["Breaking a goal into steps", "Fixed workflows versus open agents", "State and memory between steps"],
    task: "Turn a multi-step task (for example research, summarise, then draft an email) into a workflow with explicit steps and saved state between them.",
    done: ["The task is split into named steps that run in a clear order.", "State from one step is passed to the next and can be inspected.", "One step can be re-run on its own without redoing the others.", "The workflow reports which step failed and why."],
    summary: "Many jobs are better as a fixed workflow with a few model calls than as a free agent. Name the steps, save the state between them, and make each step testable and re-runnable.",
    ideas: ["Prefer a fixed workflow when the steps are known.", "Save state between steps so a failure can be resumed."] },
  { title: "Reliability, guardrails and human approval", topics: ["Validating tool arguments", "Actions that need a person's approval", "Prompt injection through tool results"],
    task: "Add guardrails to your agent: validate arguments, ask a person before risky actions, and treat tool output as data, not instructions.",
    done: ["Tool arguments are validated before anything runs.", "A risky action (delete, send, pay) waits for explicit approval.", "Text inside a tool result that tries to give the agent orders is ignored, with a test.", "Refused or failed actions are logged with the reason."],
    summary: "The more an agent can do, the more must be checked. Validate every argument, put a person in the loop for actions that cannot be undone, and never obey instructions that arrive inside data.",
    ideas: ["Approval for irreversible actions.", "Content from outside is data, not an instruction."] },
  { title: "Evaluating an agent", topics: ["Test cases with expected outcomes", "Scoring tool choice and final answers", "Cost, latency and step counts"],
    task: "Write at least ten test cases for your agent and score them automatically: right tool, right answer, steps used, time and tokens.",
    done: ["At least ten cases cover normal, incomplete, ambiguous and hostile inputs.", "A script runs all cases and prints a score table.", "Steps, time and tokens are reported for each run.", "A short note names the worst failures and what you changed."],
    summary: "You cannot improve an agent you cannot measure. A fixed set of cases, an automatic scorer and a table of steps, time and tokens turn opinions into evidence.",
    ideas: ["Test the whole run, not only the last answer.", "Track steps, time and tokens as well as correctness."] },
  { title: "End-to-end agent demo", topics: ["Putting the agent behind an API or screen", "Error messages a person can understand", "A short demo and write-up"],
    task: "Wrap your agent in a simple API or page, run it on three real scenarios and record a short demo with a write-up of its limits.",
    done: ["A person can start the agent from an API call or a page.", "Three real scenarios run end to end and are recorded.", "Errors reach the person in plain words.", "The write-up states what the agent can and cannot do."],
    summary: "Finish by making it usable: one entry point, plain error messages and an honest description of its limits, shown on real scenarios.",
    ideas: ["Be honest about the limits.", "A demo on real scenarios is the proof."] },
]);

const W4 = build("Show that you can connect a model to real tools through MCP with sensible limits and human oversight.", [
  { title: "MCP concepts", topics: ["What the Model Context Protocol is for", "Servers, clients and tools", "Resources and prompts"],
    task: "Run an existing MCP server and connect a client to it. List its tools and call one from code.",
    done: ["An MCP server runs locally and a client connects to it.", "The client lists the server's tools with their descriptions.", "One tool is called with valid arguments and the result is shown.", "A short note explains in your own words why MCP is used."],
    summary: "MCP is a common way for a model-based app to discover and call tools and data exposed by servers. A client connects, lists what is offered and calls it, so tools can be reused across apps.",
    ideas: ["A server exposes tools; a client discovers and calls them.", "One protocol means a tool can be reused by many apps."] },
  { title: "Build an MCP server", topics: ["Defining a tool with a schema", "Returning results and errors", "Keeping a server small and safe"],
    task: "Build a small MCP server with two tools that read from a company-style data source (a file or database).",
    done: ["The server exposes two tools with clear names, descriptions and argument schemas.", "Bad arguments return a helpful error, not a crash.", "The tools can only read what they should (no path tricks).", "The server is tested with a client."],
    summary: "A good tool has a clear name, a precise schema and narrow permissions. Return errors as data, and make sure a tool cannot reach beyond what it is meant to.",
    ideas: ["Narrow permissions and clear schemas.", "Errors are returned as data."] },
  { title: "Using MCP tools from an agent", topics: ["Giving an agent MCP tools", "Choosing the right tool", "Handling slow or failed tools"],
    task: "Connect your agent from Week 3 to your MCP server and answer questions that need both tools.",
    done: ["The agent discovers the MCP tools at start-up.", "It picks the right tool for at least five test questions.", "A slow or failing tool is handled with a timeout and a clear message.", "Calls are logged with arguments and results."],
    summary: "The agent no longer has hard-coded tools: it discovers them from the server. Add timeouts and logs, and test that it picks the right tool.",
    ideas: ["Discover tools instead of hard-coding them.", "Timeouts and logs for every tool call."] },
  { title: "Human oversight and permissions", topics: ["Approval before risky actions", "Least privilege for tools", "Audit trail"],
    task: "Add approval and an audit trail: risky tools ask a person first, and every action is recorded with who approved it.",
    done: ["Risky tools wait for an explicit approval.", "Each tool only has the access it needs.", "An audit log records tool, arguments, result and approver.", "A denied action is respected and reported."],
    summary: "Oversight is a feature: ask before risky actions, give each tool the least access it needs, and keep an audit trail you can read later.",
    ideas: ["Least privilege for every tool.", "An audit log answers who did what and who approved it."] },
  { title: "MCP integration demo", topics: ["A realistic business scenario", "Testing end to end", "Write-up and limits"],
    task: "Demonstrate an agent using your MCP server to complete a realistic business task, with the approval step shown.",
    done: ["The scenario runs end to end with real data.", "The approval step appears and works.", "A recorded demo or screenshots show the run.", "The write-up lists limits and next steps."],
    summary: "Show the whole chain on a believable task: agent, MCP server, approval and audit log, with an honest note about limits.",
    ideas: ["Prove the chain on a realistic task.", "Say what it does not do yet."] },
]);

const W5 = build("Show that you can deliver AI-assisted work with tests, review, security and deployment you can defend.", [
  { title: "AI-assisted development workflow", topics: ["Using a coding assistant well", "Writing the task and tests first", "Reviewing generated code"],
    task: "Build a small feature using a coding assistant, writing the tests first and reviewing every generated change.",
    done: ["Tests were written before the code and fail first.", "Every generated change was reviewed and understood.", "At least one wrong suggestion was caught and fixed.", "A short note says what the assistant did well and badly."],
    summary: "An assistant speeds you up but you own the result. Write the tests first, read everything it produces and keep a note of where it was wrong.",
    ideas: ["Tests first, review always.", "You own the code the assistant writes."] },
  { title: "Testing and code review", topics: ["Unit and integration tests", "Review checklists", "Test data and edge cases"],
    task: "Add unit and integration tests to a feature and review a classmate's pull request with a checklist.",
    done: ["Unit tests cover the main paths and the edge cases.", "At least one integration test runs the real flow.", "A written review with specific comments was given.", "Tests run in one command and pass."],
    summary: "Tests protect you from your own changes. Cover the edges, test the real flow once, and review with a checklist so comments are specific.",
    ideas: ["Edge cases matter more than the happy path.", "Review with a checklist."] },
  { title: "Security basics for AI apps", topics: ["Secrets and configuration", "Prompt injection and data leaks", "Input validation and rate limits"],
    task: "Run a security pass on your app: secrets, injection, validation and limits, and fix what you find.",
    done: ["No secret is in the code or the git history.", "Untrusted text cannot change the app's rules (tested).", "Inputs are validated and size-limited.", "A rate limit or cap protects expensive calls."],
    summary: "Most AI app incidents are ordinary: leaked keys, unvalidated input, no limits. Keep secrets out of code, treat outside text as data and cap what a user can spend.",
    ideas: ["Secrets live in the environment, never in git.", "Cap what a single user can cost."] },
  { title: "Deployment and monitoring", topics: ["Deploying a web service", "Health checks and logs", "Alerts and cost tracking"],
    task: "Deploy your app and add a health check, structured logs and a simple way to see errors and cost.",
    done: ["The app runs on a public address from a clean build.", "A health endpoint reports the app and its database.", "Logs show errors and the tokens used.", "A short runbook says how to restart and where to look."],
    summary: "Deployed means someone else can use it and you can tell when it breaks. Add a health check, useful logs and a short runbook.",
    ideas: ["A health check and logs are part of the feature.", "Write the runbook before you need it."] },
  { title: "Production readiness review", topics: ["A readiness checklist", "Known risks and mitigations", "Handing over"],
    task: "Review your app against a readiness checklist and present the risks, what you fixed and what remains.",
    done: ["The checklist covers tests, security, monitoring, cost and data.", "Each gap has a fix or an accepted risk.", "A handover note explains how to run and support it.", "You presented the review to a reviewer."],
    summary: "Readiness is a short, honest list: what is covered, what is not, and who accepts the remaining risk. End with a handover someone else can use.",
    ideas: ["Name the remaining risks and who accepts them.", "Hand over so others can run it."] },
]);

const W6 = build("Show a complete, demonstrable solution with documentation and a clear explanation of your decisions.", [
  { title: "Capstone: scope and design", topics: ["Choosing a real problem", "Scope, success measures and risks", "Architecture and plan"],
    task: "Pick your capstone problem, write the scope and success measures, and draw the architecture and plan.",
    done: ["The problem and the user are stated clearly.", "Success is measured by numbers you will check.", "The architecture shows data, models, tools and limits.", "The plan has milestones for the week."],
    summary: "A capstone starts with a real problem, a way to measure success and a design you can build in a week. Keep the scope small enough to finish.",
    ideas: ["Define success before you build.", "A small finished solution beats a large unfinished one."] },
  { title: "Capstone: build the core", topics: ["The thinnest end-to-end slice", "Tests as you go", "Daily progress notes"],
    task: "Build the thinnest end-to-end slice of your capstone that works for one real scenario, with tests.",
    done: ["One real scenario works end to end.", "Core logic has tests.", "Secrets and configuration are handled safely.", "Progress is recorded in notes."],
    summary: "Build a thin slice through the whole system first, then widen it. It proves the design early and leaves time to improve.",
    ideas: ["Thin end-to-end slice first.", "Tests and notes as you go."] },
  { title: "Capstone: quality and evaluation", topics: ["An evaluation set", "Measuring against your success measures", "Fixing the worst failures"],
    task: "Evaluate the capstone on a fixed set of cases against your success measures and fix the worst failures.",
    done: ["An evaluation set with expected results exists.", "Results are compared with the success measures.", "The worst failures were fixed and re-measured.", "Remaining weaknesses are written down."],
    summary: "Measure the solution against the numbers you set at the start, fix the worst failures, then measure again and report what remains.",
    ideas: ["Measure before and after.", "Report the remaining weaknesses honestly."] },
  { title: "Capstone: documentation", topics: ["README and architecture notes", "How to run and test", "Decisions and trade-offs"],
    task: "Write the documentation: what it does, how to run and test it, the architecture and your decisions with their trade-offs.",
    done: ["A new person can run it from the README.", "The architecture is explained with a diagram.", "Key decisions and trade-offs are written down.", "Limits and next steps are listed."],
    summary: "Documentation turns a project into something others can use and trust. Explain how to run it, why it is built this way and where it stops.",
    ideas: ["A new person must be able to run it from the README.", "Write down trade-offs, not only choices."] },
  { title: "Capstone: final presentation", topics: ["A clear demo", "Explaining decisions", "Answering questions"],
    task: "Present the capstone: a live or recorded demo, your decisions and trade-offs, results and what you would do next.",
    done: ["The demo shows the solution on a real scenario.", "Decisions and trade-offs are explained.", "Results are shown against the success measures.", "Questions from reviewers are answered honestly."],
    summary: "The presentation is the proof: demo it, explain why it is built this way, show the numbers and be honest about the limits.",
    ideas: ["Show, then explain.", "Honest limits build trust."] },
]);

export const WEEK3 = { title: "Week 3 (draft): agents and tool use, day by day", ...W3 };
export const WEEK4 = { title: "Week 4 (draft): MCP and human oversight, day by day", ...W4 };
export const WEEK5 = { title: "Week 5 (draft): AI-assisted delivery and production readiness, day by day", ...W5 };
export const WEEK6 = { title: "Week 6 (draft): capstone and final evaluation, day by day", ...W6 };
