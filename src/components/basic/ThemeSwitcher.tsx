// app/components/ThemeSwitcher.tsx

import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Icons
import { LuMoon, LuSunMedium } from "react-icons/lu";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if(!mounted) return null

  return (
    <Button
      onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      isIconOnly
      radius={"full"}
      size={"sm"}
      className={"bg-transparent text-default-600"}
    >
      {theme === 'dark' ? <LuSunMedium size={20} /> : <LuMoon size={20} />}
    </Button>
  )
};