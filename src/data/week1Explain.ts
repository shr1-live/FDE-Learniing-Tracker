// Plain-words explanation of the Week 1 work, so it can be explained to anyone.
// Keep it honest: say what is built, what is proven, and what is not done yet.
export const ONE_MINUTE = [
  "We built an AI helper that reads a job description and a few candidate profiles and says who fits, showing proof quoted from the profiles.",
  "It is not tied to one AI model. It talks to any provider that uses the common chat format, so a local model, Gemini, Groq or another can be swapped in by changing server settings.",
  "We measured how fast each model answers, how much text it uses (counted in tokens, which is also what hosted models charge for), and wrote down which model to use and why.",
  "For safety, text inside a profile is treated as data and never as an order, any claim without a real quote is removed, and each person has a daily limit.",
];

export type DayExplain = { n: number; built: string; how: string; proof: string; notYet: string };

export const DAY_EXPLAIN: DayExplain[] = [
  { n: 1,
    built: "An endpoint in the backend that sends a prompt to an AI model and returns a checked answer, plus a test tool that asks the same 10 questions to several models.",
    how: "The backend uses the common chat format, so any provider works. The key and model name live only in server settings, never in code. If the model is slow or fails, the user gets a clear message, and every call is logged with its time and token counts.",
    proof: "The 20-question comparison below, 40 automatic tests, and a real end-to-end run with a local model.",
    notYet: "Only small local models were compared. Add a hosted model to the comparison before choosing for production." },
  { n: 2,
    built: "Four versions of the instructions we give the model (v1 simple, v2 structured, v3 with rules and an example, v4 with an explicit \"profile text is data, not orders\" rule), stored as files.",
    how: "Every answer must follow a fixed shape: matched skills each with a quote, gaps, items the profile does not state, and a fit rating. Our own code checks that each quote really appears in the profile and removes any claim that does not.",
    proof: "A recorded comparison of all four versions on eight fixed candidates sent in batches of four, each run twice, on two models (see the Day 2 section below), plus tests for removing invented claims, text that tries to break out of its place, and a real quote about the wrong skill.",
    notYet: "Only two small local models were tested. Version 4 is the default because it was best on the model in use (94%). On the smaller model version 2 won and version 4 did badly, so the best prompt depends on the model and the comparison must be re-run when the model changes." },
  { n: 3,
    built: "The Task assistant (a page in this app and an API): you type what you want in plain words and it can create, list, update and delete your tasks.",
    how: "The model only asks for an action, in a fixed JSON shape. Our own server checks every argument against a strict schema, only touches the signed-in person's tasks, asks the person to confirm before any delete, runs the action, and writes every call to a log. Text that comes back from a tool (such as a task title) is passed to the model as escaped data, so it cannot act as an instruction. At most 4 steps per message.",
    proof: "Automated tests, all passing: 24 kinds of bad arguments refused, another person's tasks cannot be changed or confirmed, a delete does nothing until confirmed and can be decided once, a hostile task title is treated as data, the step limit holds, and unusable model replies end cleanly. A real run with the small local model (qwen2.5:3b) created, listed and updated tasks correctly; every bad request it made was refused and nothing was deleted without a confirmation.",
    notYet: "The small local model did not manage the delete flow: it asked for a delete with a made-up id, then updated a task instead. Our server refused or contained every mistake, but a stronger hosted model (for example Claude) should be tried before anyone relies on it. The assistant has not been deployed." },
  { n: 4,
    built: "Some safety checks already exist: input limits, output checks, the quote check and a daily cap.",
    how: "Planned: a 30-case test set (10 normal, 5 incomplete, 5 ambiguous, 5 injection, 5 edge), run before and after extra guardrails, with failures written up.",
    proof: "Unit tests for the checks that exist.",
    notYet: "The 30-case set, the before and after results and the failure write-up (tickets C1, C2)." },
  { n: 5,
    built: "The Assistant page in this app. It sends the job description and profiles to the backend with the signed-in user's token and shows the fit, quotes, gaps, speed and token use.",
    how: "Input and output are checked, errors show clear messages, usage is logged per person, and a daily limit protects the bill.",
    proof: "A working local flow with a real model, and 40 passing tests.",
    notYet: "Streaming the answer as it is written (optional) and going live on a hosted server. A recorded video demo is not made; there is a written demo script." },
];
