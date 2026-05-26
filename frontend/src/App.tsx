import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-svh flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Hello, world</CardTitle>
          <CardDescription>
            A starter page built with React, Vite, Tailwind, and shadcn/ui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You&apos;ve clicked the button{" "}
            <span className="font-medium text-foreground">{count}</span>{" "}
            {count === 1 ? "time" : "times"}.
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={() => setCount((c) => c + 1)}>Click me</Button>
          <Button variant="outline" onClick={() => setCount(0)}>
            Reset
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

export default App
