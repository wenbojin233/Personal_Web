const heroCopy = {
  send: "\u53d1\u9001",
};

export default function ChatPanel({
  section,
  inputRef,
  inputValue,
  placeholder,
  responseText,
  isStreaming,
  quickAsks,
  onInputChange,
  onSubmit,
  onQuickAsk,
}) {
  return (
    <div className="content-wrapper">
      <div className="headline">
        <h1>{section.title}</h1>
        <p>{section.subtitle}</p>
      </div>

      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          value={inputValue}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit(inputValue);
            }
          }}
        />

        <button
          type="button"
          className="enter-icon"
          aria-label={heroCopy.send}
          onClick={() => onSubmit(inputValue)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <div className="chips">
        {quickAsks.map((item) => (
          <button key={item.label} type="button" className="chip" onClick={() => onQuickAsk(item.prompt)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="response-area">
        {responseText ? (
          <>
            <span className="response-content">{responseText}</span>
            {isStreaming ? <span className="cursor" /> : null}
          </>
        ) : (
          <span className="response-hint">{section.emptyResponse}</span>
        )}
      </div>
    </div>
  );
}
