export default function Badge({ tone, children }) {
  return <span data-tone={tone}>{children}</span>
}
