export default function ProductSectionPanel({ section }) {
  return (
    <div className="content-wrapper product-wrapper">
      <header className="product-header">
        <div className="product-kicker-row">
          <span className="product-kicker-line" />
          <p className="product-kicker">{section.subtitle}</p>
        </div>
        <h1 className="product-title">{section.title}</h1>
        {section.intro ? <p className="product-intro">{section.intro}</p> : null}
      </header>

      <div className="product-list">
        {section.works.map((work) => (
          <section
            key={work.index}
            className={`product-work product-work-${work.accent || "primary"}`}
          >
            <div className="product-work-copy">
              <span className="product-work-index">{work.index}</span>

              <div className="product-work-meta">
                <h2>{work.title}</h2>
                <p>{work.description}</p>

                <div className="product-tags">
                  {work.tags.map((tag) => (
                    <span key={tag} className="product-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="product-work-side">
              <div className="product-work-glow" />
            </div>
          </section>
        ))}
      </div>

      <section className="product-cta">
        <h3>{section.ctaTitle}</h3>
        <a href="#" className="product-cta-link">
          <span>{section.ctaText}</span>
          <span className="product-cta-arrow" aria-hidden="true">
            {"\u2192"}
          </span>
        </a>
      </section>

      <footer className="product-footer">
        <span className="product-footer-note">{section.footerNote}</span>
        <div className="product-footer-links">
          {section.footerLinks.map((item) => (
            <a key={item} href="#">
              {item}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
