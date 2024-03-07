export default function Title({
  children,
  component,
}: {
  children: React.ReactNode;
  component?: JSX.Element;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="font-semibold text-lg md:text-2xl dark:text-neutral-100">
        {children}
      </h1>
      {!!component && component}
    </div>
  );
}
