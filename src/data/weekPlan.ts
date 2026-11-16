// Week 1 of the company programme, broken into one task per day.
// Topics, practical tasks and acceptance criteria are from the programme table; "how" is a suggested route.
export type WeekDay = {
  n: number;
  title: string;
  topics: string[];
  task: string;
  how: string[];
  done: string[]; // acceptance criteria, each one is a tick box
};

export const WEEK_TITLE = "Week 1: LLM engineering, day by day";

export const WEEK_DAYS: WeekDay[] = [
  {
    n: 1,
    title: "LLM Fundamentals and Model Selection",
    topics: [
      "LLM architecture: high-level transformer concepts.",
      "Tokens, tokenization and context windows.",
      "System prompts, user prompts and assistant messages.",
      "Temperature and output generation parameters.",
      "Context length and token limitations.",
      "Model selection: capability, latency, cost and reliability.",
      "LLM APIs: request, response, streaming and error handling.",
      "Multimodal models: text, images and audio overview.",
      "Input/output token costs and usage tracking.",
      "Model limitations and hallucinations.",
    ],
    task: "Build a minimal LLM-backed endpoint or service using any technology stack. Run the same fixed prompt set against at least two model options or configurations, where access permits.",
    how: [
      "Create a new repo for this week (not this tracker). Keep the API key in an environment variable only.",
      "Add one endpoint that sends a prompt to the model and returns the answer, with a timeout and clear handling of 429, 500 and network errors.",
      "Log the latency and the input/output token counts for every call (the API response includes the counts).",
      "Write a fixed set of about 10 prompts and run them against two models. Save the answers, times and token counts to a file.",
      "Write a short recommendation: which model, and why (quality, speed, cost).",
    ],
    done: [
      "Successful API integration",
      "Secure configuration (key kept in the environment, not in code)",
      "Handles timeout and API errors",
      "Captures latency and token usage",
      "Compares outputs on a fixed test set",
      "Recommends a model with reasons",
    ],
  },
  {
    n: 2,
    title: "Advanced Prompt Engineering",
    topics: [
      "Zero-shot, one-shot and few-shot prompting.",
      "Role prompting and instruction hierarchy.",
      "Prompt structure: context, task, constraints and expected output.",
      "Reasoning-oriented prompting techniques.",
      "Breaking complex tasks into smaller prompt steps.",
      "Providing examples and reference data in prompts.",
      "Prompt templates, variables and reusable components.",
      "Handling ambiguous requests and asking clarifying questions.",
      "Reducing prompt injection and instruction-conflict risks.",
      "Iterating, testing and improving prompts.",
    ],
    task: "Build a recruitment candidate-analysis assistant. Compare at least three prompt versions using the same job description and candidate profiles.",
    how: [
      "Take one job description and three or four sample candidate profiles (made-up people are fine).",
      "Define a fixed output shape: matched skills, gaps, evidence quotes and a list of things the profile does not say.",
      "Keep each prompt version as its own file (v1, v2, v3) and run all of them on the same inputs.",
      "Tell the model to write \"not stated\" instead of guessing, and to quote the profile for every claim.",
      "Compare the three outputs side by side and note which version is best and why.",
    ],
    done: [
      "Consistent output structure",
      "Prompt versions are stored",
      "Test cases are repeatable",
      "Missing information is identified rather than invented",
      "Output is grounded in supplied candidate evidence",
    ],
  },
  {
    n: 3,
    title: "Structured Outputs and Tool Calling",
    topics: [
      "Why structured outputs are useful in LLM applications.",
      "JSON mode and schema-constrained responses.",
      "Defining and validating JSON schemas.",
      "Handling malformed, incomplete and unexpected outputs.",
      "Function/tool calling concepts and workflow.",
      "Defining tool names, descriptions and input parameters.",
      "Passing tool results back to the model.",
      "Multi-step tool calls and orchestration.",
      "Tool errors, retries, timeouts and fallback handling.",
      "Tool permissions and safe execution boundaries.",
    ],
    task: "Build an AI task-management assistant that extracts task details into a schema and calls controlled create, list, and update tools. Require confirmation before destructive actions.",
    how: [
      "Define a task schema (title, due date, priority) and validate the model's output against it; reject or retry bad output.",
      "Define the tools: create, list, update (and delete). The model only asks for a tool; your own code runs it.",
      "Check who the user is and what they may do before running any tool. Reject invalid arguments.",
      "For delete (or anything destructive) stop and ask the user to confirm first.",
      "Write every tool call and its result to a log, and handle tool failures with a clear message.",
    ],
    done: [
      "Schema validation",
      "Invalid arguments handled",
      "Tools execute only in application code",
      "Authentication and permission checks",
      "Tool failures handled",
      "Destructive actions require confirmation",
      "Execution is logged",
    ],
  },
  {
    n: 4,
    title: "LLM Evaluation, Reliability and Guardrails",
    topics: [
      "Defining quality criteria and success metrics for LLM features.",
      "Creating representative test datasets and test cases.",
      "Evaluating accuracy, relevance, completeness and consistency.",
      "Using human review and automated evaluation.",
      "Testing edge cases and adversarial inputs.",
      "Identifying and reducing hallucinations.",
      "Input and output validation.",
      "Guardrails for unsafe, irrelevant or policy-violating responses.",
      "Monitoring latency, failures, token usage and cost.",
      "Regression testing prompts and model changes.",
    ],
    task: "Create a 30-case evaluation set for the recruitment assistant: 10 normal, 5 incomplete, 5 ambiguous, 5 adversarial/prompt-injection, and 5 edge cases. Add guardrails and rerun the evaluation.",
    how: [
      "Write the 30 cases in a file. For each one, write down the expected behaviour before running anything.",
      "Build a small runner that sends every case to the assistant and marks pass or fail.",
      "Run it once and keep the result as the \"before\" baseline.",
      "Add guardrails: check the input, validate the output, wrap candidate text so it is treated as data and never as instructions.",
      "Run it again for the \"after\" result, put both in one table, and write down the cases that still fail.",
    ],
    done: [
      "All test categories represented",
      "Expected behaviour defined",
      "Before-and-after results recorded",
      "Failure cases documented",
      "Prompt-injection tests do not override trusted instructions",
      "No unsupported candidate claims",
    ],
  },
  {
    n: 5,
    title: "End-to-End LLM Application",
    topics: [
      "Understanding the architecture of a basic LLM-powered application.",
      "Connecting an application to an LLM provider API.",
      "Managing API keys and environment configuration securely.",
      "Building the request/response flow from frontend to backend.",
      "Managing conversation history and context.",
      "Implementing streaming responses in the user interface.",
      "Handling loading states, errors, retries and rate limits.",
      "Logging requests and tracking token usage and cost.",
      "Testing the complete application workflow.",
      "Deploying and monitoring a basic LLM application.",
    ],
    task: "Deliver an AI-powered recruitment assistant that analyses supplied candidate profiles against a job description, returns structured, evidence-based output, and uses at least two controlled tools or application functions.",
    how: [
      "Add a simple page where you paste a job description and candidate profiles and press Analyse.",
      "The backend calls the model, streams the answer to the page, and returns a validated, structured result.",
      "Add at least two tools or functions (for example extract skills and score the match) that your code runs.",
      "Add input and output validation, retries for failures, and logs of tokens and latency.",
      "Write tests and a README, and record a short demo. Deploying it is optional.",
    ],
    done: [
      "Working end-to-end flow",
      "Structured and validated response",
      "At least two tools/functions",
      "Input/output validation",
      "Failure handling",
      "Basic logs and token/latency tracking",
      "Tests, documentation, and a demo",
    ],
  },
];

// Stored per person as one small entry per day: wp1:d1 -> [true, false, ...] (one flag per "done" item).
