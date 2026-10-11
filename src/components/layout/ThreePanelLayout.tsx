import React, { useState } from 'react';
import { ShoppingBag, ListChecks, Map } from 'lucide-react';
interface ThreePanelLayoutProps { leftPanel: React.ReactNode; centerPanel: React.ReactNode; rightPanel: React.ReactNode; }
export const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({leftPanel, centerPanel, rightPanel}) => {
  const [active, setActive] = useState('plan');
  const tabs = [{id:'plan', label:'Plan', icon:ShoppingBag}, {id:'trip', label:'Map & trip', icon:Map}];
  return <div className="workspace">
    <nav className="workspace-nav" aria-label="Shopping workspace">{tabs.map(({id,label,icon:Icon}) => <button key={id} aria-current={active === id ? 'page' : undefined} aria-controls={`view-${id}`} onClick={() => setActive(id)}><Icon size={18} aria-hidden="true" />{label}</button>)}</nav>
    <section id="view-plan" aria-label="Shopping plan" hidden={active !== 'plan'}><div className="combined-plan"><div className="list-column"><h2 className="column-title">My list & pantry</h2>{leftPanel}</div><div className="plan-column"><h2 className="column-title">Your plan</h2>{centerPanel}</div></div></section>
    <section id="view-trip" aria-label="Map and trip" hidden={active !== 'trip'}>{rightPanel}</section>
    <p className="workspace-footnote">Chapel Hill & Durham · Sample prices, availability and travel estimates.</p>
  </div>;
};
