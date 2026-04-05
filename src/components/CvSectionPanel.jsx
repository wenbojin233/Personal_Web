function CvGroup({ label, items, inlineRole = false }) {
  return (
    <section className="cv-group">
      <div className="cv-group-label">{label}</div>
      <div className="cv-group-list">
        {items.map((item) => (
          <article key={`${item.title}-${item.org}-${item.date}`} className="cv-item">
            <div className="cv-item-main">
              {inlineRole ? (
                <h3 className="cv-item-inline">
                  <span className="cv-item-inline-org">{item.org}</span>
                  <span className="cv-item-inline-sep">{"\uFF5C"}</span>
                  <span className="cv-item-inline-title">{item.title}</span>
                </h3>
              ) : (
                <>
                  <h3 className="cv-item-title">{item.title}</h3>
                  <p className="cv-item-org">{item.org}</p>
                </>
              )}
            </div>
            <div className="cv-item-date">{item.date}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function CvSectionPanel({ section }) {
  return (
    <div className="content-wrapper cv-wrapper">
      <header className="cv-hero">
        <h1>{section.title}</h1>
        <p>{section.subtitle}</p>
      </header>

      <CvGroup label="Education" items={section.education} />
      <CvGroup label="Work Experience" items={section.experience} inlineRole={true} />
    </div>
  );
}
