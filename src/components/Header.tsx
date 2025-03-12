import { SignedIn, SignedOut, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { FiUserPlus } from "react-icons/fi"; // Feather icons
export default function Header() {
  return (
    <header className="flex flex-row justify-end items-center p-4 gap-4 h-16 bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 right-0 left-0 z-50 border-b border-gray-100">
      <SignedOut>
        <SignInButton>
          <button className="hover:underline flex flex-row items-center">
            <FiUserPlus className="mr-2 h-4 w-4" />
            登入
          </button>
        </SignInButton>
        <SignUpButton>
          <button className="hover:underline flex flex-row items-center">
            <FiUserPlus className="mr-2 h-4 w-4" />
            註冊
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
