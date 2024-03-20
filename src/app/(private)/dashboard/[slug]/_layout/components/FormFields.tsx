export const FormField = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-2 mb-4">{children}</div>;
};

export const Label = ({ children }: { children: React.ReactNode }) => {
  return <label className="block text-sm font-semibold">{children}</label>;
};
