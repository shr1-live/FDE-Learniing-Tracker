import { useEffect, type ReactNode } from "react";
import { usePopover } from "../../lib/usePopover";
import { Avatar } from "../Avatar";
import { Icon } from "../Icon";
import ThemeSwitch from "../ThemeSwitch";
import { DevPersonaBar } from "../DevPersonaBar";

/** The person's name at the bottom of the side panel; opens their email, role, theme switch and Sign out. */
export function AccountMenu({ name, email, role, batch, children, onSignOut }: { name: string; email: string; role: string; batch?: string; children?: ReactNode; onSignOut: () => void }) {
  const pop = usePopover();
  useEffect(() => { if (pop.open) pop.box.current?.querySelector<HTMLElement>(".account-pop button, .account-pop a")?.focus(); }, [pop.open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="account-wrap" ref={pop.box}>
      {pop.open && (
        <div id="account-pop" className="account-pop pop" role="group" aria-label="Your account">
          <div className="account-head">
            <Avatar name={name} />
            <div className="account-text">
              <span className="account-name">{name}<span className="badge">{role}</span></span>
              <span className="account-mail" title={email}>{email}</span>
              {batch && <span className="account-mail">Batch: {batch}</span>}
            </div>
          </div>
          {children && <div className="pop-section">{children}</div>}
          <div className="pop-section">
            <p className="overline">Theme</p>
            <ThemeSwitch />
          </div>
          <div className="pop-section dev-only"><DevPersonaBar /></div>
          <div className="pop-foot">
            <button type="button" className="pop-link" onClick={() => { void pop.hide(false); onSignOut(); }}><Icon name="logout" size={16} />Sign out</button>
          </div>
        </div>
      )}
      <button ref={pop.btn} type="button" className="account" aria-expanded={pop.open} aria-controls={pop.open ? "account-pop" : undefined} onClick={pop.toggle} data-tip={name}>
        <Avatar name={name} size="sm" />
        <span className="account-text">
          <span className="account-name">{name}</span>
          <span className="account-mail">{role}</span>
        </span>
        <Icon name="updown" size={16} />
        <span className="sr">. Account, theme and sign out</span>
      </button>
    </div>
  );
}
