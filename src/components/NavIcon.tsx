const P: Record<string, string> = {
  "/": "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  "/plan": "M4 6h16M4 12h16M4 18h10",
  "/myplan": "M12 5v14M5 12h14M4 4h16v16H4z",
  "/outline": "M5 4h14v16H5zM9 8h6M9 12h6M9 16h3",
  "/stack": "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  "/curated": "M5 21V4m0 0h12l-2 4 2 4H5",
  "/readiness": "M4 20V10m6 10V4m6 16v-8m4 8H2",
  "/docs": "M12 4v12m0 0l-4-4m4 4l4-4M5 20h14",
  "/admin": "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z",
};

export default function NavIcon({ to }: { to: string }) {
  return (
    <svg className="ni" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[to] ?? P["/"]} />
    </svg>
  );
}
