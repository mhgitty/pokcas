import { useState } from 'react'
import { useFormValue } from 'sanity'
import { Box, Button, Card, Flex, Text } from '@sanity/ui'
import { CopyIcon, CheckmarkIcon } from '@sanity/icons'

const BASE = 'https://pokcas.com'

// Read-only display of the finished /go/ URL with a copy button.
// Built live from the document's market + code; nothing is stored.
export function RedirectUrlInput() {
  const market = useFormValue(['market']) as string | undefined
  const code = useFormValue(['code', 'current']) as string | undefined
  const [copied, setCopied] = useState(false)

  if (!code) {
    return (
      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1} muted>Add a code above to get the finished URL.</Text>
      </Card>
    )
  }

  const prefix = market && market !== 'global' ? `/${market}` : ''
  const url = `${BASE}${prefix}/go/${code}/`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback for browsers without clipboard API permissions
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Card padding={2} radius={2} tone="primary" border>
      <Flex align="center" gap={2}>
        <Box flex={1} paddingX={2} style={{ minWidth: 0 }}>
          <Text size={1} weight="semibold" textOverflow="ellipsis" style={{ fontFamily: 'monospace' }}>
            {url}
          </Text>
        </Box>
        <Button
          mode={copied ? 'default' : 'ghost'}
          tone={copied ? 'positive' : 'primary'}
          icon={copied ? CheckmarkIcon : CopyIcon}
          text={copied ? 'Copied' : 'Copy URL'}
          onClick={copy}
        />
      </Flex>
    </Card>
  )
}
