// Build status of the Week 1 project work, per acceptance criterion. Update the flags as tickets are finished.
// "done" means built and checked on its feature branch. It does not mean merged or deployed: see DELIVERY below.
export type Criterion = { text: string; done: boolean; ticket?: string };
export type DayStatus = { n: number; title: string; criteria: Criterion[] };

export const DELIVERY = [
  { text: "Backend assistant (branch feature/llm-assistant)", state: "Built and tested, waiting for the pull request" },
  { text: "Day 1 model comparison (branch feature/evals-day1-model-comparison)", state: "Built, waiting for the pull request" },
  { text: "Assistant page in this app (branch feature/assistant-page)", state: "Built, waiting for the pull request" },
  { text: "Hosted backend on Render and a hosted LLM", state: "Not set up yet (needs the owner)" },
];

export const WEEK1_STATUS: DayStatus[] = [
  { n: 1, title: "LLM Fundamentals and Model Selection", criteria: [
    { text: "Successful API integration", done: true },
    { text: "Secure configuration", done: true },
    { text: "Handles timeout and API errors", done: true },
    { text: "Captures latency and token usage", done: true },
    { text: "Compares outputs on a fixed test set", done: true, ticket: "A1" },
    { text: "Recommends a model with reasons", done: true, ticket: "A1" },
  ] },
  { n: 2, title: "Advanced Prompt Engineering", criteria: [
    { text: "Consistent output structure", done: true },
    { text: "Prompt versions are stored", done: true },
    { text: "Test cases are repeatable", done: false, ticket: "A2" },
    { text: "Three prompt versions compared on the same inputs", done: false, ticket: "A2" },
    { text: "Missing information is identified rather than invented", done: true },
    { text: "Output is grounded in supplied candidate evidence", done: true },
  ] },
  { n: 3, title: "Structured Outputs and Tool Calling", criteria: [
    { text: "Schema validation", done: false, ticket: "B2" },
    { text: "Invalid arguments handled", done: false, ticket: "B2" },
    { text: "Tools execute only in application code", done: false, ticket: "B1" },
    { text: "Authentication and permission checks", done: false, ticket: "B1" },
    { text: "Tool failures handled", done: false, ticket: "B2" },
    { text: "Destructive actions require confirmation", done: false, ticket: "B2" },
    { text: "Execution is logged", done: false, ticket: "B1" },
  ] },
  { n: 4, title: "LLM Evaluation, Reliability and Guardrails", criteria: [
    { text: "All test categories represented (30 cases)", done: false, ticket: "C1" },
    { text: "Expected behaviour defined", done: false, ticket: "C1" },
    { text: "Before-and-after results recorded", done: false, ticket: "C2" },
    { text: "Failure cases documented", done: false, ticket: "C2" },
    { text: "Prompt-injection tests do not override trusted instructions", done: false, ticket: "C2" },
    { text: "No unsupported candidate claims", done: false, ticket: "C2" },
  ] },
  { n: 5, title: "End-to-End LLM Application", criteria: [
    { text: "Working end-to-end flow", done: true },
    { text: "Structured and validated response", done: true },
    { text: "At least two tools or functions", done: true },
    { text: "Input and output validation", done: true },
    { text: "Failure handling", done: true },
    { text: "Basic logs and token/latency tracking", done: true },
    { text: "Tests", done: true },
    { text: "Documentation and a demo", done: false, ticket: "D1" },
  ] },
];
