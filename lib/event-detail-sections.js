export function getEventDetailSections(section = 'overview') {
  return {
    showWorkspace: section === 'overview',
    showStatistics: section === 'overview',
    showNotes: section === 'overview' || section === 'notes',
    showRecords: section === 'records',
    showSectionLinks: section === 'overview',
  }
}
