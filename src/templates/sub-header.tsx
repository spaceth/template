/**
 * Sub-Header text. The first line keeps the template size.
 * Text after the user presses Enter is 20% smaller.
 */
export function SubHeader({ className, value }: { className: string; value: string }) {
  const text = value.trim();
  if (!text) return null;

  const newline = text.indexOf("\n");
  const first = newline === -1 ? text : text.slice(0, newline);
  const rest = newline === -1 ? "" : text.slice(newline + 1);

  return (
    <p className={className}>
      {first}
      {rest ? (
        <span className="sub-header__next" style={{ display: "block", fontSize: "80%" }}>
          {rest}
        </span>
      ) : null}
    </p>
  );
}
