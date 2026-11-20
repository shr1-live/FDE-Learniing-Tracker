import { Icon, IconName } from "./Icon";

export function Kpi({ icon, label, value, sub, tone }: { icon: IconName; label: string; value: string; sub: string; tone?: "ok" | "bad" }) {
  return (
    <div className={"kpi" + (tone ? " " + tone : "")}>
      <span className="kpi-ic"><Icon name={icon} size={20} /></span>
      <div className="kh">{label}</div><div className="kv">{value}</div><div className="ks">{sub}</div>
    </div>
  );
}
