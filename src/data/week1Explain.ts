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
    proof: "The 10-question comparison below, 22 automatic tests, and a real end-to-end run with a local model.",
    notYet: "Only small local models were compared. Add a hosted model to the comparison before choosing for production." },
  { n: 2,
    built: "Three versions of the instructions we give the model (v1 simple, v2 structured, v3 with rules, an example and a defence against hidden orders), stored as files.",
    how: "Every answer must follow a fixed shape: matched skills each with a quote, gaps, items the profile does not state, and a fit rating. Our own code checks that each quote really appears in the profile and removes any claim that does not.",
    proof: "Tests cover removing invented claims, text that tries to break out of its place, and a real quote that is about the wrong skill.",
    notYet: "The three versions have not yet been run side by side on the same candidates with the results recorded (ticket A2)." },
  { n: 3,
    built: "Nothing yet. The two helper functions we have (find skills, score a match) are plain code, not model tool calls.",
    how: "Planned: the model extracts task details into a fixed schema; only our code runs the create, list, update and delete tools; deleting asks for confirmation; every action is checked for permission and logged.",
    proof: "None yet.",
    notYet: "The whole Day 3 task (tickets B1 to B3)." },
  { n: 4,
    built: "Some safety checks already exist: input limits, output checks, the quote check and a daily cap.",
    how: "Planned: a 30-case test set (10 normal, 5 incomplete, 5 ambiguous, 5 injection, 5 edge), run before and after extra guardrails, with failures written up.",
    proof: "Unit tests for the checks that exist.",
    notYet: "The 30-case set, the before and after results and the failure write-up (tickets C1, C2)." },
  { n: 5,
    built: "The Assistant page in this app. It sends the job description and profiles to the backend with the signed-in user's token and shows the fit, quotes, gaps, speed and token use.",
    how: "Input and output are checked, errors show clear messages, usage is logged per person, and a daily limit protects the bill.",
    proof: "A working local flow with a real model, and 22 passing tests.",
    notYet: "Written guide and demo (D1), streaming the answer as it is written (D2, optional), and going live on a hosted server." },
];
