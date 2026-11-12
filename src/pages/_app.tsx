import type { AppProps } from "next/app";
import "../styles/globals.css";
import AppLayout from "@/components/AppLayout";
import { AuthProvider } from "@/context/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </AuthProvider>
  );
}