import React from 'react';
import { ShoppingBag } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="app-header"><div className="header-inner">
        <a href="#main-content" className="wordmark"><ShoppingBag size={23} aria-hidden="true" />Shopsmarter<span className="brand-dot">.</span></a>
      </div></header>
    </>
  );
};
