type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-semibold text-slate-500">هيكل المتجر</p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-4 max-w-2xl leading-8 text-slate-600">{description}</p>
      <a className="mt-8 w-fit font-semibold underline underline-offset-4" href="/">
        العودة إلى البداية
      </a>
    </main>
  );
}
