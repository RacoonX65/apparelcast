"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

function redactString(input: string): string {
  return input
    .replace(/eyJ[0-9A-Za-z_-]+?\.[0-9A-Za-z_-]+?\.[0-9A-Za-z_-]+/g, "[REDACTED_TOKEN]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[REDACTED_UUID]")
    .replace(/\+?\d[\d\s-]{7,}/g, "[REDACTED_PHONE]")
    .replace(/\b\d{13,19}\b/g, "[REDACTED_NUMBER]")
}

function safeStringify(value: unknown): string {
  const sensitiveKeys = [
    "password",
    "token",
    "authorization",
    "auth",
    "secret",
    "apiKey",
    "email",
    "phone",
    "card",
  ]
  try {
    return JSON.stringify(value, (key, val) => {
      if (typeof key === "string" && sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        return "[REDACTED]"
      }
      if (typeof val === "string") {
        return redactString(val)
      }
      return val
    })
  } catch {
    if (typeof value === "string") return redactString(value)
    return "[object]"
  }
}

export function SafeConsole() {
  const { toast } = useToast()
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return

    const originalError = console.error.bind(console)

    const redactArgs = (args: unknown[]) =>
      args.map((a) => (typeof a === "string" ? redactString(a) : safeStringify(a)))

    const noop = () => {}

    console.log = noop
    console.debug = noop
    console.info = noop
    console.warn = function (...args: unknown[]) {
      try {
        originalError("[Warning]", ...redactArgs(args))
      } catch {}
    }
    console.error = function (...args: unknown[]) {
      try {
        originalError("[Error]", ...redactArgs(args))
      } catch {}
    }

    window.onerror = function (message, source, lineno, colno, error) {
      try {
        const m = typeof message === "string" ? redactString(message) : safeStringify(message)
        originalError("[UnhandledError]", m)
      } catch {}
      return true
    }

    window.onunhandledrejection = function (event: PromiseRejectionEvent) {
      try {
        const reason = (event && (event as any).reason) || ""
        const r = typeof reason === "string" ? redactString(reason) : safeStringify(reason)
        originalError("[UnhandledRejection]", r)
      } catch {}
      event.preventDefault?.()
      return true
    }

    // DevTools detection + fun message
    let shown = false
    const devtoolsOpen = () => {
      const threshold = 160
      return (
        Math.abs(window.outerWidth - window.innerWidth) > threshold ||
        Math.abs(window.outerHeight - window.innerHeight) > threshold
      )
    }

    const showFunMessage = () => {
      if (shown) return
      shown = true
      try {
        // Clear to spotlight the message
        console.clear?.()
        const headerStyle =
          "font-size:20px; font-weight:800; padding:8px 12px; color:#00f6ff; background:linear-gradient(90deg,#0a0010,#1a0933); border:1px solid #00f6ff; border-radius:8px; text-shadow:0 0 8px #00f6ff;"
        const asciiStyle =
          "color:#0ff; background:#0a0010; padding:8px 10px; font-family:monospace; font-size:12px; line-height:1.15; border:1px solid #0ff; border-radius:6px;"
        const subStyle =
          "font-size:13px; color:#b3f8ff; background:#0a0010; padding:6px 8px; border-left:2px solid #00f6ff;"

        const ascii = `
███╗   ██╗███████╗ ██████╗ ███╗   ███╗
████╗  ██║██╔════╝██╔═══██╗████╗ ████║
██╔██╗ ██║█████╗  ██║   ██║██╔████╔██║
██║╚██╗██║██╔══╝  ██║   ██║██║╚██╔╝██║
██║ ╚████║███████╗╚██████╔╝██║ ╚═╝ ██║
╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝
   NEON CONSOLE // ACCESS GRANTED
`

        originalError(`%c// CYBERPUNK MODE ENGAGED`, headerStyle)
        originalError(`%c${ascii}`, asciiStyle)
        originalError(
          `%cWe keep secrets safe here. Avoid pasting unknown code.
Neon on ✨ — ApparelCast by Judas`,
          subStyle,
        )
      } catch {}

      // Friendly toast for visual cue
      try {
        toast({
          title: "Neon Console Online ⚡",
          description: "Access Granted // Logs redacted. Hack safely, stay neon ✨",
        })
      } catch {}
    }

    const interval = window.setInterval(() => {
      if (!shown && devtoolsOpen()) {
        showFunMessage()
      }
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  return null
}