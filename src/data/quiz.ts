// Self-check quizzes, three questions per programme day (Weeks 1 and 2). Auto-scored in the browser; the answers are explained.
// A new day is one more entry: key "w{week}d{day}". Questions follow the day's key ideas, not trick questions.
export type Question = { q: string; options: string[]; answer: number; why: string };

export const QUIZ: Record<string, Question[]> = {
  w1d1: [
    { q: "What is a token?", options: ["A whole sentence", "A small piece of text the model reads and writes", "An API password", "One model parameter"], answer: 1, why: "Models work on tokens, small pieces of text. Size, cost and the context limit are all counted in tokens." },
    { q: "Which setting gives the most repeatable answers?", options: ["Temperature 0", "Temperature 2", "A longer prompt", "More tokens"], answer: 0, why: "Temperature 0 makes the model pick its most likely words, so the same question gives nearly the same answer." },
    { q: "How should you choose between two models?", options: ["Pick the newest", "Pick the cheapest", "Run the same fixed questions on both and compare", "Ask the model which is better"], answer: 2, why: "Evidence beats opinion: the same prompts on both, compared on quality, speed and cost." },
  ],
  w1d2: [
    { q: "Where should the rules for the model go?", options: ["In the system message", "In the user's question only", "In the API key", "In a comment"], answer: 0, why: "The system message holds the stable rules; the user message holds the request." },
    { q: "Why show the model a few examples (few-shot)?", options: ["To make it faster", "To show the exact format and style you want", "To lower the price", "To avoid tokens"], answer: 1, why: "Examples show the pattern; the model copies the format and tone." },
    { q: "What is a good way to check a prompt change?", options: ["Try it once and see", "Run it on the same set of test inputs before and after", "Ask a colleague", "Make it longer"], answer: 1, why: "A fixed test set shows if a change really helped, and where it hurt." },
  ],
  w1d3: [
    { q: "Why ask for structured output (JSON with a schema)?", options: ["It looks nicer", "Code can check and use it safely", "It is cheaper", "The model likes it"], answer: 1, why: "A schema lets your code validate the answer instead of guessing what free text means." },
    { q: "In tool calling, who runs the tool?", options: ["The model", "Your code", "The user", "The provider's database"], answer: 1, why: "The model only asks for a tool call. Your code checks the arguments and runs it." },
    { q: "A tool would delete data. What should happen first?", options: ["Run it at once", "Ask the person to confirm", "Retry three times", "Hide the result"], answer: 1, why: "Destructive actions need an explicit confirmation from the person." },
  ],
  w1d4: [
    { q: "What is a hallucination?", options: ["A slow answer", "A confident answer not supported by the evidence", "A formatting error", "A refused request"], answer: 1, why: "The model states something as fact that the sources do not support." },
    { q: "Text in a document says \"ignore your rules\". What is this?", options: ["A new instruction to follow", "A prompt injection to treat as data, not as an order", "A bug in the API", "A good prompt"], answer: 1, why: "Content from outside is data. Instructions inside it must not be obeyed." },
    { q: "Why keep a fixed evaluation set?", options: ["To compare before and after on the same cases", "To train the model", "To save tokens", "To hide failures"], answer: 0, why: "The same cases before and after show whether a guardrail helped and what it broke." },
  ],
  w1d5: [
    { q: "What makes an end-to-end LLM feature \"done\"?", options: ["It runs once on your machine", "It works, is tested, handles errors and has evidence of it working", "The prompt is long", "It uses the biggest model"], answer: 1, why: "Done means it works for real inputs, fails safely, is tested and you can show proof." },
    { q: "A model call times out. What is the best response?", options: ["Crash", "Retry a limited number of times, then give a clear error", "Retry forever", "Ignore it"], answer: 1, why: "Limited retries with a clear final error keep the app reliable and honest." },
    { q: "What should you log for every model call?", options: ["Nothing", "The time and tokens used (and any error)", "The API key", "The user's password"], answer: 1, why: "Time and tokens show cost and speed. Never log secrets." },
  ],
  w2d1: [
    { q: "What does RAG do before the model answers?", options: ["Retrains the model", "Fetches relevant pieces of your documents and adds them to the request", "Deletes old documents", "Lowers the temperature"], answer: 1, why: "Retrieval-augmented generation gives the model your documents at question time." },
    { q: "Which is a cost of long-context (stuffing everything in)?", options: ["It is always free", "More tokens, more cost and slower answers", "It cannot be used", "It removes citations"], answer: 1, why: "Every extra token is paid for and slows the answer; retrieval keeps the request small." },
    { q: "If nothing relevant is found, the app should…", options: ["Guess an answer", "Say the documents do not contain enough evidence", "Use a random document", "Return an empty page"], answer: 1, why: "A clear fallback avoids made-up answers." },
  ],
  w2d2: [
    { q: "Why split documents into chunks?", options: ["To make files smaller on disk", "So retrieval returns focused pieces that fit the context", "To hide the source", "Because models cannot read files"], answer: 1, why: "Chunks let you retrieve just the relevant part instead of a whole document." },
    { q: "What is an embedding?", options: ["A list of numbers that represents the meaning of text", "A compressed file", "A kind of prompt", "A database table"], answer: 0, why: "Similar meanings give similar vectors, which is what makes semantic search work." },
    { q: "Why overlap neighbouring chunks a little?", options: ["To save space", "So an idea cut at a boundary is not lost", "To confuse the model", "To speed up indexing"], answer: 1, why: "Overlap keeps sentences that straddle a boundary retrievable." },
  ],
  w2d3: [
    { q: "How does vector search rank results?", options: ["Alphabetically", "By how close the meaning (vector) is to the question", "By file size", "By date only"], answer: 1, why: "It compares the question's vector with each chunk's vector, usually by cosine similarity." },
    { q: "What does top-k mean?", options: ["Keep the k best matches", "Delete k chunks", "Use k models", "Wait k seconds"], answer: 0, why: "You take the k most similar chunks. Too few misses answers; too many adds noise." },
    { q: "Keyword search finds exact words; vector search finds…", options: ["Only numbers", "Similar meaning even with different words", "Only titles", "Nothing different"], answer: 1, why: "Vector search can match meaning; many systems combine both (hybrid search)." },
  ],
  w2d4: [
    { q: "A good RAG answer is…", options: ["Long", "Correct, supported by the retrieved sources and cited", "Confident", "Fast only"], answer: 1, why: "Correctness and support by the sources matter most; citations make it checkable." },
    { q: "The right chunk was never retrieved. Which part failed?", options: ["Generation", "Retrieval", "The user", "The citation format"], answer: 1, why: "Measure retrieval and generation separately; a missing chunk is a retrieval problem." },
    { q: "How do you know a change improved quality?", options: ["It feels better", "Re-run the same question set and compare scores", "Ask the model", "Add more documents"], answer: 1, why: "A fixed set of questions with expected answers gives a before and after comparison." },
  ],
  w2d5: [
    { q: "For the RAG application, what must the answer show?", options: ["Only the final text", "The answer with its sources", "The raw embeddings", "The API key"], answer: 1, why: "Sources and citations make the answer traceable." },
    { q: "Someone asks about something not in the documents. Best behaviour?", options: ["Answer from general knowledge without saying so", "Say the documents do not contain it", "Return the nearest document", "Crash"], answer: 1, why: "State the limit honestly instead of inventing." },
    { q: "Which belongs in your proof for the day?", options: ["A screenshot or link of the running app and a short note on how you tested it", "Only the code", "Nothing", "Your API key"], answer: 0, why: "Proof shows it working; never include secrets." },
  ],
};

/** Where a day's best score is kept (with the person's other progress). */
export const quizKey = (week: number, day: number) => `quiz:w${week}d${day}`;
export type QuizScore = { best: number; last: number; of: number; at: string };
