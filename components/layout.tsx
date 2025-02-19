export default function Layout({children, className}: {children: React.ReactNode, className?: string}) {
  return (
    <main className={`p-4 md:p-8 max-w-screen-lg mx-auto ${className} pt-12 md:pt-0`}>
      { children }
    </main>
  );
}