import GetAppIcon from '@mui/icons-material/GetApp'
import { Button, Tooltip } from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'

export default function InstallPWA(): ReactElement {
  const [supportsPWA, setSupportsPWA] = useState(false)
  const [promptInstall, setPromptInstall] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setSupportsPWA(true)
      setPromptInstall(e)
    }
    
    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  // Also check if it's already installed
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setSupportsPWA(false) // Hide the install button if already installed
    }
  }, [])

  const handleClick = useCallback(async () => {
    if (!promptInstall) {
      return
    }
    
    promptInstall.prompt()
    
    const { outcome } = await promptInstall.userChoice
    
    if (outcome === 'accepted') {
      setSupportsPWA(false)
    }
  }, [promptInstall])

  if (!supportsPWA) {
    return <></>
  }

  return (
    <Tooltip title="Install App">
      <Button 
        onClick={handleClick} 
        startIcon={<GetAppIcon />}
        variant="outlined"
        size="small"
      >
        Install
      </Button>
    </Tooltip>
  )
} 