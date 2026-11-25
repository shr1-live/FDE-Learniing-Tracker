# Week 2 (RAG): evidence

The document assistant lives in the app at **Practice lab, Document assistant** (`/lab?tab=rag`). The API is `api/rag/*` in the API repository, with 10 tests (275 in the whole suite, all passing).

## What was built, day by day

| Day | Requirement | Where it is |
|---|---|---|
| 1. RAG architecture | A basic RAG pipeline: ingest approved documents, expose a query API | `POST /api/rag/documents`, `POST /api/rag/ask`. Documents are private to the person who adds them. |
| 2. Chunking and embeddings | At least two chunking strategies, embeddings for the same documents, compare retrieval on a fixed question set | `fixed` (260-character windows, 60 overlap) and `paragraph` (long paragraphs cut at sentence ends). Embedding: local feature hashing (256 numbers per text). The comparison table runs both on the same 18 questions. |
| 3. Vector search | Vector retrieval with metadata filters, different Top-K, semantic versus keyword or hybrid | Modes `semantic` (cosine), `keyword` (BM25) and `hybrid` (reciprocal rank fusion). Top-K 1 to 10. Document tags filter before ranking. |
| 4. Quality evaluation | 15 to 20 questions with expected answers and source documents; evaluate retrieval and answers | 18 questions (10 plain, 6 hard, 2 not in the documents). Measures: retrieval hit rate, MRR, answer correct, citation correct, refuses when unanswerable. `GET /api/rag/eval` and `/api/rag/eval/compare`. |
| 5. RAG application | End to end: add approved documents, ask, get evidence-based answers with citations | The Document assistant tab. Every answer cites numbered sources; the model's answer is accepted only if its citations are real, otherwise the quoted answer is used. |

## Measured results (18 questions, 16 answerable and 2 not in the documents)

Produced by the code in the repository (`RagEval.Compare()`), not typed by hand.

| Chunking | Search | Top K | Retrieval hit | MRR | Answer correct | Citation correct | Refuses unanswerable |
|---|---|---|---|---|---|---|---|
| fixed | semantic | 1 | 93.8% | 0.938 | 68.8% | 68.8% | 100% |
| fixed | semantic | 3 | 93.8% | 0.938 | 68.8% | 68.8% | 100% |
| fixed | semantic | 5 | 93.8% | 0.938 | 68.8% | 68.8% | 100% |
| fixed | keyword | 1 | 87.5% | 0.875 | 68.8% | 68.8% | 100% |
| fixed | keyword | 3 | 100% | 0.938 | 68.8% | 68.8% | 100% |
| fixed | keyword | 5 | 100% | 0.938 | 68.8% | 68.8% | 100% |
| fixed | hybrid | 1 | 93.8% | 0.938 | 68.8% | 68.8% | 100% |
| fixed | hybrid | 3 | 100% | 0.969 | 68.8% | 68.8% | 100% |
| fixed | hybrid | 5 | 100% | 0.969 | 68.8% | 68.8% | 100% |
| paragraph | semantic | 1 | 87.5% | 0.875 | 68.8% | 68.8% | 100% |
| paragraph | semantic | 3 | 87.5% | 0.875 | 68.8% | 68.8% | 100% |
| paragraph | semantic | 5 | 93.8% | 0.891 | 68.8% | 68.8% | 100% |
| paragraph | keyword | 1 | 87.5% | 0.875 | 68.8% | 68.8% | 100% |
| paragraph | keyword | 3 | 100% | 0.938 | 68.8% | 68.8% | 100% |
| paragraph | keyword | 5 | 100% | 0.938 | 68.8% | 68.8% | 100% |
| paragraph | hybrid | 1 | 93.8% | 0.938 | 68.8% | 68.8% | 100% |
| paragraph | hybrid | 3 | 100% | 0.969 | 68.8% | 68.8% | 100% |
| paragraph | hybrid | 5 | 100% | 0.969 | 68.8% | 68.8% | 100% |

## What the numbers say

- **Hybrid search with Top K 3 or more finds the right document for every answerable question** (100%, MRR 0.969). A single result (Top K 1) misses some questions with either strategy.
- **Chunking matters little on this small set.** Both strategies reach the same best result; the difference shows at Top K 1 for pure vector search (fixed windows 93.8%, paragraph 87.5%).
- **The assistant never answers what the documents do not cover** (100% refusal on the 2 unanswerable questions).
- **The weak point is the answer step: 68.8%.** The five failures are all hard questions that use other words than the documents ("vacation" for "annual leave", "work from home" for "remote", "ill" for "sick"). The retrieval finds the right part, but the quoting step needs shared words, so it refuses instead of guessing. A model-written answer (when a model is configured) handles these; it is accepted only with valid citations.

## Limits, stated plainly

- The embedding is a local hashed one, with no trained model. It matches shared words and phrases, not meaning. A real embedding model would score better on the hard questions and is the next step.
- The evaluation runs on four invented handbook documents, not real company documents. The numbers show how the settings compare, not how the assistant does on your own data.
- The day-by-day task wording is the programme's; passing the numbers above does not replace the learner's own submission and review in the tracker.
