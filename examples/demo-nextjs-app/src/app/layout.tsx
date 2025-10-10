export const metadata = {
  title: 'Demo Next.js App',
  description: 'Lattice plugin demo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
