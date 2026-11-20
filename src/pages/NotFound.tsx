import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";

export default function NotFound() {
  return (
    <div className="notfound">
      <p className="nf-code" aria-hidden="true">404</p>
      <h1>Page not found</h1>
      <p className="page-sub">This address does not lead anywhere. It may be an old link or a typing slip.</p>
      <Link className="btn" to="/"><Icon name="home" size={16} />Back to Home</Link>
    </div>
  );
}
