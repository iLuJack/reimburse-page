import Header from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return ( 
    <body>
      <Header />
      <main className="flex-1 pt-16">{children}</main>  
    </body>
  );
}