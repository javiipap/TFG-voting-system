export interface Props extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export default function Table({ children, ...props }: Props) {
  return <table {...props}>{children}</table>;
}

export function Row(props: { children: React.ReactNode }) {
  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted dark:border-neutral-800 dark:text-neutral-200">
      {props.children}
    </tr>
  );
}

export function Td(props: { children: React.ReactNode }) {
  return (
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {props.children}
    </td>
  );
}

export function Th(props: { children: React.ReactNode }) {
  return (
    <td className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 dark:text-white">
      {props.children}
    </td>
  );
}

export function TBody(props: { children: React.ReactNode }) {
  return <tbody className="[&_tr:last-child]:border-0">{props.children}</tbody>;
}

export function THead(props: { children: React.ReactNode }) {
  return (
    <thead className="border-b dark:border-neutral-800">{props.children}</thead>
  );
}
