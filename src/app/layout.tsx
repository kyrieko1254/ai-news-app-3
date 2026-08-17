import type { Metadata } from "next";
import { ClerkProvider, Show, SignInButton } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 뉴스 콜렉터",
  description: "해외 AI 뉴스를 한국어로 번역/요약해 보여주는 개인용 뉴스 콜렉터",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider localization={koKR}>
      <html
        lang="ko"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Show
            when="signed-in"
            fallback={
              <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 font-sans dark:bg-black">
                <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
                  AI 뉴스 콜렉터
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                  계속하려면 로그인해 주세요.
                </p>
                <SignInButton mode="modal">
                  <button className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]">
                    로그인
                  </button>
                </SignInButton>
              </div>
            }
          >
            {children}
          </Show>
        </body>
      </html>
    </ClerkProvider>
  );
}
