export function filesFromFileList(fileList) {
  return Array.from(fileList ?? []).filter(isFile)
}

export function filesFromDataTransfer(dataTransfer) {
  const items = Array.from(dataTransfer?.items ?? [])

  if (items.length > 0) {
    return items
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter(isFile)
  }

  return filesFromFileList(dataTransfer?.files)
}

function isFile(value) {
  return typeof File !== 'undefined' && value instanceof File
}
