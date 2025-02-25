// app/(routes)/documentation/components/code-block.tsx
'use client'

import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { toast } from 'sonner'

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const copyCode = () => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2"
        onClick={copyCode}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '1rem'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}