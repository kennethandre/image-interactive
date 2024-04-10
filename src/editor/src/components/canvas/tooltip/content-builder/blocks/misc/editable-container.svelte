<script>
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { afterUpdate, onDestroy } from 'svelte'
  import { previousSelected } from 'Editor/store/ui'

  export let id
  export let text
  export let classes
  export let style
  export let onChange = () => {}
  export let visualMode = false
  export let hidden

  let subscribers = []
  let root
  let savedRange
  let hasChanges

  $: hiddenClass = hidden ? 'hidden' : ''
  $: editableDivHiddenClass = visualMode ? '' : 'hidden'
  $: textareaHiddenClass = visualMode ? 'hidden' : ''
  $: placeholderHiddenClass = text.length > 0 || !visualMode ? 'hidden' : ''

  // Triggered before the selection changes
  // If the component has unsaved changes (user has typed something),
  // then trigger onChange
  subscribers.push(
    previousSelected.subscribe(() => {
      if (hasChanges) {
        hasChanges = false
        onChange()
      }
    })
  )
  afterUpdate(() => {
    // Safari fix
    if (text === '<br>') text = ''
  })

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  export function setStrong({ range = getSelectionRange(window.getSelection()) }) {
    if (range.end > range.start) {
      let model = buildTextStyleModel(text)

      // Make all characters bold if there is a non-bold character inside the range
      let newFlag = false
      let rangeStart = range.start
      let rangeEnd = range.end
      for (let i = 0; i < model.length; i++) {
        if (model[i].div) {
          rangeEnd++
          if (i < range.start) rangeStart++
          continue
        }
        if (i >= rangeStart && i < rangeEnd && !model[i].bold) newFlag = true
      }

      rangeStart = range.start
      rangeEnd = range.end
      for (let i = 0; i < model.length; i++) {
        if (model[i].div) {
          rangeEnd++
          if (i < range.start) rangeStart++
          continue
        }
        if (i >= rangeStart && i < rangeEnd) model[i].bold = newFlag
      }

      text = rebuildHTMLFromModel(model)
      onChange()
      clearSelection()
    }
  }
  export function setEm({ range = getSelectionRange(window.getSelection()) }) {
    if (range.end > range.start) {
      let model = buildTextStyleModel(text)

      // Make all characters italic if there is a non-italic character inside the range
      let newFlag = false
      for (let i = 0; i < model.length; i++) {
        if (i >= range.start && i < range.end && !model[i].em) newFlag = true
      }
      for (let i = 0; i < model.length; i++) {
        if (i >= range.start && i < range.end) model[i].em = newFlag
      }

      text = rebuildHTMLFromModel(model)
      onChange()
      clearSelection()
    }
  }
  export function setA({ url, range = getSelectionRange(window.getSelection()), useSavedRange }) {
    if (useSavedRange) range = savedRange

    if (range.end > range.start && url.length > 0) {
      let model = buildTextStyleModel(text)

      let newFlag = true
      for (let i = 0; i < model.length; i++) {
        if (i >= range.start && i < range.end && model[i].a) newFlag = false
      }

      for (let i = 0; i < model.length; i++) {
        if (i >= range.start && i < range.end) {
          model[i].a = newFlag
          model[i].href = url
        }
      }

      text = rebuildHTMLFromModel(model)
      onChange()
      clearSelection()
    }
  }
  export function saveRange() {
    savedRange = getSelectionRange(window.getSelection())
  }
  function onFocusOut() {
    if (hasChanges) {
      hasChanges = false
      onChange()
    }
  }
  function onInput() {
    hasChanges = true
  }

  // Text edit functions
  function buildTextStyleModel(html) {
    let parser = new DOMParser()
    let doc = parser.parseFromString(html, 'text/html')

    let model = []

    function traverse(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        for (let char of node.textContent) {
          let styleObj = {
            char: char,
            bold: false,
            em: false,
            a: false,
            href: '',
            div: false,
          }
          let parentNode = node
          while (parentNode !== doc.body) {
            if (parentNode.tagName === 'STRONG') styleObj.bold = true
            if (parentNode.tagName === 'EM') styleObj.em = true
            if (parentNode.tagName === 'A') {
              styleObj.a = true
              styleObj.href = parentNode.getAttribute('href')
            }
            parentNode = parentNode.parentNode
          }
          model.push(styleObj)
        }
      } else if (node.tagName === 'DIV') {
        model.push({
          char: '<div>',
          div: true,
        })
        for (let child of node.childNodes) {
          traverse(child)
        }
        model.push({
          char: '</div>',
          div: true,
        })
      } else {
        for (let child of node.childNodes) {
          traverse(child)
        }
      }
    }

    traverse(doc.body)
    return model
  }
  function new_buildTextStyleModel(html) {
    let parser = new DOMParser()
    let doc = parser.parseFromString(html, 'text/html')

    let model = []

    function traverse(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        for (let char of node.textContent) {
          let styleObj = {
            char: char,
            bold: false,
            em: false,
            a: false,
            href: '',
          }
          let parentNode = node
          while (parentNode !== doc.body) {
            if (parentNode.tagName === 'STRONG') styleObj.bold = true
            if (parentNode.tagName === 'EM') styleObj.em = true
            if (parentNode.tagName === 'A') {
              styleObj.a = true
              styleObj.href = parentNode.getAttribute('href')
            }
            parentNode = parentNode.parentNode
          }
          model.push(styleObj)
        }
      } else {
        for (let child of node.childNodes) {
          traverse(child)
        }
      }
    }

    traverse(doc.body)
    return model
  }
  function old_buildTextStyleModel(text) {
    let flagBold = false
    let flagEm = false
    let flagA = false
    let href = ''
    let model = []
    let trimmedText = text

    for (let i = 0; i < text.length; i++) {
      if (trimmedText.indexOf('<strong>') === 0) {
        flagBold = true
        i += 7
        trimmedText = trimmedText.slice(8)
        continue
      }
      if (trimmedText.indexOf('</strong>') === 0) {
        flagBold = false
        i += 8
        trimmedText = trimmedText.slice(9)
        continue
      }
      if (trimmedText.indexOf('<em>') === 0) {
        flagEm = true
        i += 3
        trimmedText = trimmedText.slice(4)
        continue
      }
      if (trimmedText.indexOf('</em>') === 0) {
        flagEm = false
        i += 4
        trimmedText = trimmedText.slice(5)
        continue
      }
      if (trimmedText.indexOf('<a') === 0) {
        let openTag = trimmedText.match(/<a[^>]*>/)[0]
        href = openTag.match(/\"(.+)\"/)[1]
        flagA = true
        i += openTag.length - 1
        trimmedText = trimmedText.slice(openTag.length)
        continue
      }
      if (trimmedText.indexOf('</a>') === 0) {
        flagA = false
        i += 3
        trimmedText = trimmedText.slice(4)
        continue
      }

      model.push({
        char: text[i],
        bold: flagBold,
        em: flagEm,
        a: flagA,
        href: href,
      })

      trimmedText = trimmedText.slice(1)
    }

    return model
  }
  function getSelectionRange(selection) {
    let start = 0
    let end = 0
    let foundStartNode = false
    let foundEndNode = false

    iterateNodes(root, (node) => {
      if (!foundStartNode) {
        if (node.isSameNode(selection.anchorNode)) {
          foundStartNode = true
          start += selection.anchorOffset
        } else {
          start += node.textContent.length
        }
      }

      if (!foundEndNode) {
        if (node.isSameNode(selection.focusNode)) {
          foundEndNode = true
          end += selection.focusOffset
        } else {
          end += node.textContent.length
        }
      }
    })

    if (start > end) return { start: end, end: start }
    return { start, end }
  }
  function iterateNodes(node, callback) {
    if (node.childNodes.length > 0) {
      for (let n of node.childNodes) {
        iterateNodes(n, callback)
      }
    } else {
      callback(node)
    }
  }
  function rebuildHTMLFromModel(model) {
    let flagBold = false
    let flagEm = false
    let flagA = false
    let result = ''

    for (let i = 0; i < model.length; i++) {
      if (model[i].bold !== flagBold || model[i].em !== flagEm || model[i].a !== flagA) {
        if (flagA) {
          flagA = false
          result += '</a>'
        }
        if (flagEm) {
          flagEm = false
          result += '</em>'
        }
        if (flagBold) {
          flagBold = false
          result += '</strong>'
        }
      }

      if (model[i].bold && model[i].bold !== flagBold) {
        flagBold = model[i].bold
        result += '<strong>'
      }

      if (model[i].em && model[i].em !== flagEm) {
        flagEm = model[i].em
        result += '<em>'
      }

      if (model[i].a && model[i].a !== flagA) {
        flagA = model[i].a
        result += `<a href="${model[i].href}">`
      }

      result += model[i].char
    }

    // Close tags
    if (flagA) result += '</a>'
    if (flagEm) result += '</em>'
    if (flagBold) result += '</strong>'

    return result
  }
  function clearSelection() {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        // Chrome
        window.getSelection().empty()
      } else if (window.getSelection().removeAllRanges) {
        // Firefox
        window.getSelection().removeAllRanges()
      }
    } else if (document.selection) {
      // IE?
      document.selection.empty()
    }
  }
</script>

<div class="relative flex {hiddenClass}">
  <div
    bind:this={root}
    contenteditable="true"
    {id}
    class="{classes} {editableDivHiddenClass} relative z-10 flex-1 cursor-text"
    style="{style} outline: 0px solid transparent"
    bind:innerHTML={text}
    on:focusout={onFocusOut}
    on:input={onInput}
  />
  <div class="{placeholderHiddenClass} italic absolute left-0 top-0 z-0">
    <div {style}>
      <div class="text-theme-500 italic">Start writing</div>
    </div>
  </div>
  <div class="{textareaHiddenClass} flex-1" {style}>
    <FormControl
      bind:value={text}
      {onChange}
      type="textarea"
      classes="p-0 w-full text-theme-800 dark:text-white"
      hidden={visualMode}
    />
  </div>
</div>

<style>
  [contenteditable] {
    -webkit-user-select: auto;
    user-select: all;
  }
</style>
