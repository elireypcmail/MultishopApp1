import "@s/_index.scss"
import type { AppProps } from "next/app"
import { useState } from "react"
import { NextUIProvider } from "@nextui-org/react"
import { SessionProvider } from "@g/session"
import { Toaster } from "sileo"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <NextUIProvider>
          <SessionProvider>
            <Component {...pageProps} />
          </SessionProvider>
        </NextUIProvider>
        <Toaster />
      </QueryClientProvider>
    </>
  )
}
