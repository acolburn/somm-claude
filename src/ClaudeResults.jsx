import ReactMarkdown from "react-markdown";

export default function ClaudeResults(props) {
  return (
    <section>
      <h2>Somm Claude Recommends:</h2>
      <article className="suggested-wines-container" aria-live="polite">
        <ReactMarkdown>{props.wines}</ReactMarkdown>
        {/* {props.recipe} */}
      </article>
    </section>
  );
}
