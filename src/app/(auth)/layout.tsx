import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative h-screen w-full">
    <div className="absolute size-full">
      <Image
        src="/images/auth-bg.jpg"
        alt="background"
        fill
        className="size-full"
      />
    </div>
    <div className="flex flex-col items-center justify-center h-screen opacity-85">
        {children}
    </div>
  </main>
  );
}