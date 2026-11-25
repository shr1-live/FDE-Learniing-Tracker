# Week 2, Day 1: RAG architecture and data flow

The document assistant answers questions from a person's own approved documents and says where each answer came from. It is split into three stages that are kept apart in the code, so each can be tested and changed on its own.

```
 add document          ask a question
      |                      |
      v                      v
 +-----------+        +-------------+        +--------------+
 | INGESTION |        |  RETRIEVAL  |        |  GENERATION  |
 +-----------+        +-------------+        +--------------+
 store text + title   embed the question     numbered sources in
 and tags (source)    score every chunk      the prompt: [1] [2] ...
        |             pick the best K               |
        v                    |                      v
 cut into chunks             v               model answers ONLY from
 (paragraph or fixed)   top-K chunks          them and cites [n]
 keep document, part    (the context)                |
 number, tags                |                       v
        |                    +-------------> citations checked
        v                                      (real source numbers?)
 vectors made once                                   |
 and stored for reuse                        yes: model answer
                                             no model / bad citations:
                                             best sentences quoted
                                             nothing found: "I could not
                                             find this in the approved
                                             documents."
```

## Stages and where they are

| Stage | What happens | Code (API repository) |
|---|---|---|
| Ingestion | The text is stored with a title and tags. It is cleaned (whitespace) and cut into chunks. Each chunk keeps the document, its part number and the tags. | `RagService.Add`, `Chunker` in `Services/Rag/RagEngine.cs` |
| Retrieval | The question and each chunk become vectors (256 numbers). Chunks are ranked by vector similarity, by keywords (BM25) or both merged. A tag filter narrows the search before ranking. The best K chunks are the context. | `HashEmbedder`, `Retriever` |
| Generation | A model is told to answer only from the numbered chunks and to cite them. Its answer is accepted only when every `[n]` is a real source. Otherwise the best sentences are quoted. | `RagService.Ask`, `Answerer` |
| Fallback | If no chunk covers the question, the answer is "I could not find this in the approved documents." It is never guessed. | `Answerer.Extractive`, `Answerer.CheckModel` |

## Safety

- Each person's documents are private: every query is filtered by the owner.
- Document and question text are wrapped in tags with angle brackets escaped, and the system prompt says they are data, not instructions.
- Documents, the model call and the answer are all limited in size, and model calls count against the daily limit.

## Day 2: chunking and embeddings

- **Strategies:** `paragraph` (one chunk per paragraph, long paragraphs cut at sentence ends, maximum size configurable) and `fixed` (windows of a configurable size with a configurable overlap, starting and ending at word boundaries). Size 80 to 1000 characters; overlap 0 to half the size.
- **Metadata:** every chunk carries the document title, its part number and the document's tags; answers cite them.
- **Embeddings:** a local hashed embedding (words, word pairs and word pieces hashed into 256 numbers, scaled to length 1). It is generated once for each distinct text and kept in memory for reuse, so a question never re-embeds a chunk it has seen. It is lost on a restart and made again on demand.
- **Comparison:** `GET /api/rag/eval/compare` runs the fixed 18-question set with both strategies, three search modes and three values of K; `GET /api/rag/eval?...&chunk_size=&overlap=` runs one setting with its own size and overlap. Results and the explanation of the choice are in `WEEK2-RAG-EVIDENCE.md`.
