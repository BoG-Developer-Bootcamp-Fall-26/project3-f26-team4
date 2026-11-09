import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Header() {
    return (
        <header className={`${openSans.className} flex items-center gap-2 bg-white border-b border-gray-200 px-7 py-3`}>
            <img src="/images/appLogo.png" alt="Progress Logo" />
            <h1 className="text-black font-extrabold text-4xl">Progress</h1>
        </header>
    )
}