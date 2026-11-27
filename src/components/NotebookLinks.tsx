import { colabUrl, type Notebook } from "../data/builtWork";

/** Links that open practice notebooks in Google Colab (a new tab). One notebook shows one link; several show one link each, with its label. */
export function NotebookLinks({ notebooks, className = "btn secondary" }: { notebooks?: Notebook[]; className?: string }) {
  if (!notebooks?.length) return null;
  return (
    <>
      {notebooks.map((n) => (
        <a key={n.file} className={className} href={colabUrl(n.file)} target="_blank" rel="noopener noreferrer">
          Practise in Colab{notebooks.length > 1 ? `: ${n.label}` : ""}<span className="sr"> (opens in a new tab)</span>
        </a>
      ))}
    </>
  );
}
