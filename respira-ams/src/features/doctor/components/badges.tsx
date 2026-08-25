export function SeverityBadge({ severity }: { severity: string }) {
  const s = severity.toLowerCase()
  if (s === "mild")
    return <span className="inline-block rounded px-1.5 py-0.5 text-md font-medium capitalize bg-primary/10 text-primary">{severity}</span>
  if (s === "moderate")
    return <span className="inline-block rounded px-1.5 py-0.5 text-md font-medium capitalize bg-secondary text-secondary-foreground">{severity}</span>
  if (s === "severe")
    return <span className="inline-block rounded px-1.5 py-0.5 text-md font-medium capitalize bg-destructive/10 text-destructive">{severity}</span>
  return <span className="inline-block rounded px-1.5 py-0.5 text-md font-medium capitalize bg-muted text-muted-foreground">{severity}</span>
}

export function AwareBadge({ category }: { category: string }) {
  const cat = category.toLowerCase()
  if (cat === "access")
    return <span className="inline-block rounded px-1.5 py-0.5 text-md font-medium capitalize bg-primary/10 text-primary">{category}</span>
  if (cat === "accesswatch")
    return <span className="inline-block rounded px-1.5 py-0.5 text-md font-medium capitalize bg-chart-2/10 text-chart-2">{category}</span>
  if (cat === "watch")
    return <span className="inline-block rounded px-1.5 py-0.5 text-md font-medium capitalize bg-sidebar-primary/10 text-sidebar-primary">{category}</span>
  if (cat === "reserve")
    return <span className="inline-block rounded px-1.5 py-0.5 text-md font-medium capitalize bg-destructive/10 text-destructive">{category}</span>
  return <span className="inline-block rounded px-1.5 py-0.5 text-md font-medium capitalize bg-muted text-muted-foreground">{category}</span>
}
