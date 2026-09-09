// Hero "Quick links" button list for the comparison table, shared by the
// non-catch-all page templates that render inside <HeroSection>.
export function compareButtonList(
  doc: any
): { text: string; targetId: string; variant?: 'solid' | 'outline' }[] {
  if (doc?.showComparisonTable && doc?.comparisonTable && doc?.heroCompareButton) {
    return [{ text: doc.heroCompareButtonText || 'View all bonuses', targetId: 'comparison-list', variant: 'solid' }]
  }
  return []
}
