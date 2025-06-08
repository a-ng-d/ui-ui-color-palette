const checkEditorType = async () => {
  const iframe = document.querySelector(
    '#ui-container'
  ) as HTMLIFrameElement | null

  /*iframe?.contentWindow?.postMessage({
    type: 'CHECK_EDITOR_TYPE',
    data: {
      editor: 'dev_vscode'
    },
  })*/
}

export default checkEditorType
