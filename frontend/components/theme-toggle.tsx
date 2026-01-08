"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Hydration mismatch 방지
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <Skeleton className="h-9 w-9" />
    }

    const cycleTheme = () => {
        if (theme === "light") {
            setTheme("dark")
        } else if (theme === "dark") {
            setTheme("system")
        } else {
            setTheme("light")
        }
    }

    const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "system" : "light"} theme`}
        >
            <Icon className="h-5 w-5 transition-all" />
        </Button>
    )
}
