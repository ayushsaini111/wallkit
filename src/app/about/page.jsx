// app/about/page.js
"use client"

import { Suspense } from "react"
import AboutContent from "@/components/about/aboutContent"

export default function AboutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutContent />
    </Suspense>
  )
}
