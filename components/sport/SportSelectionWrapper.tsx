'use client'

import { useSportSelection } from '@/hooks/useSportSelection'
import { SportSelectionModal } from './SportSelectionModal'

export function SportSelectionWrapper() {
  const {
    showSportModal,
    handleSportSelect,
    closeSportModal,
    currentSport
  } = useSportSelection()

  return (
    <SportSelectionModal
      isOpen={showSportModal}
      onClose={closeSportModal}
      onSelectSport={handleSportSelect}
    />
  )
}
