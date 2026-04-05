import { CvIcon, GithubIcon, HomeIcon, ProductTilesIcon } from "./icons";

const iconMap = {
  home: HomeIcon,
  cv: CvIcon,
  products: ProductTilesIcon,
};

function NavButton({ sectionKey, label, isActive, onClick }) {
  const Icon = iconMap[sectionKey];

  return (
    <button
      type="button"
      className={`nav-item ${isActive ? "nav-item-active" : ""}`}
      title={label}
      onClick={onClick}
    >
      {Icon ? <Icon /> : null}
      <span className="tooltip">{label}</span>
    </button>
  );
}

export default function Sidebar({ sections, activeSection, onSelectSection }) {
  return (
    <nav className="sidebar">
      <div className="nav-group">
        {sections.map((section) => (
          <NavButton
            key={section.key}
            sectionKey={section.key}
            label={section.navLabel}
            isActive={activeSection === section.key}
            onClick={() => onSelectSection(section.key)}
          />
        ))}
      </div>

      <div className="sidebar-bottom nav-group">
        <a
          href="https://github.com/wenbojin233"
          className="nav-item"
          title="GitHub"
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon />
          <span className="tooltip">GitHub</span>
        </a>
      </div>
    </nav>
  );
}
