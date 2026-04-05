export default function StaticSectionPanel({ section }) {
  return (
    <div className="content-wrapper static-wrapper">
      <div className="headline">
        <h1>{section.title}</h1>
        <p>{section.subtitle}</p>
      </div>

      <div className="static-intro">{section.intro}</div>

      <div className="static-grid">
        {section.blocks.map((block) => (
          <section key={block.title} className="static-card">
            <div className="static-card-index">{block.title}</div>
            <p>{block.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
