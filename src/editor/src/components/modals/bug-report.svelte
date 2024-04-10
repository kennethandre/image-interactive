<script>
  import { getters } from 'Editor/store'
  import * as consts from 'Editor/scripts/consts'
  import { exportSettings } from 'Editor/scripts/export'
  import Modal from 'Editor/components/UI/modal'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import { onMount, onDestroy } from 'svelte'
  import App from '../../App.svelte'
  import Canvas from '../canvas/canvas.svelte'

  let modal
  let map = ''
  let action = ''
  let email = ''
  let message = 'I encountered a bug'
  let emailValid = true
  let messageValid = true
  let showError
  let showForm
  let showSuccess
  let submitting
  let primaryButton = 'Submit'
  let bugReportUrl
  const STATE_DEFAULT = 'STATE_DEFAULT'
  const STATE_SUBMITTING = 'STATE_SUBMITTING'
  const STATE_ERROR = 'STATE_ERROR'
  const STATE_SUCCESS = 'STATE_SUCCESS'
  let mapCopyIcon = 'fa-copy'
  let actionCopyIcon = 'fa-copy'

  onMount(() => {
    createEvents()
  })
  onDestroy(() => {
    removeEvents()
  })

  function createEvents() {
    document.addEventListener(consts.EVENT_BUG_REPORT, handleOpenEvent)
  }
  function removeEvents() {
    document.removeEventListener(consts.EVENT_BUG_REPORT, handleOpenEvent)
  }
  function handleOpenEvent(e) {
    map = JSON.stringify(exportSettings(getters.getSettings()))
    action = JSON.stringify(e.detail.action)
    modal.show()
    setTimeout(() => {
      setState(STATE_DEFAULT)
    }, 100)
  }
  function onConfirm() {
    if (validateForm()) {
      setState(STATE_SUBMITTING)

      fetch('https://bugs.imagemappro.com/submit', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          map,
          action,
          email,
          message,
        }),
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json()
          } else {
            setState(STATE_ERROR)
          }
        })
        .then((body) => {
          if (body && body.url) {
            bugReportUrl = body.url
            setState(STATE_SUCCESS)
          } else {
            setState(STATE_ERROR)
          }
        })
        .catch((err) => {
          setState(STATE_ERROR)
          console.log(err)
        })
    }
  }
  function validateForm() {
    const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    emailValid = email.toLowerCase().match(re) ? true : false
    messageValid = message.length > 2 ? true : false

    return emailValid && messageValid
  }
  function setState(state) {
    showForm = true
    showError = false
    showSuccess = false
    primaryButton = 'Submit'

    submitting = false
    document.querySelector(`[data-id="${modal.getId()}"] .btn-primary`).classList.remove('pointer-events-none', 'opacity-50')

    if (state === STATE_SUBMITTING) {
      submitting = true
      document.querySelector(`[data-id="${modal.getId()}"] .btn-primary`).classList.add('pointer-events-none', 'opacity-50')
      primaryButton = 'Submitting...'
    }
    if (state === STATE_ERROR) {
      showError = true
    }
    if (state === STATE_SUCCESS) {
      showForm = false
      showSuccess = true
      primaryButton = false
    }
  }
  function copyMap() {
    const type = 'text/plain'
    const blob = new Blob([map], { type })
    const data = [new ClipboardItem({ [type]: blob })]
    navigator.clipboard.write(data).then(
      () => {
        actionCopyIcon = 'fa-copy'
        mapCopyIcon = 'fa-check'
      },
      () => {}
    )
  }
  function copyAction() {
    const type = 'text/plain'
    const blob = new Blob([action], { type })
    const data = [new ClipboardItem({ [type]: blob })]
    navigator.clipboard.write(data).then(
      () => {
        mapCopyIcon = 'fa-copy'
        actionCopyIcon = 'fa-check'
      },
      () => {}
    )
  }
</script>

<Modal bind:this={modal} {onConfirm} cancelButton="Close" {primaryButton} title="Report Bug" width="520">
  <div class="p-3 {submitting ? 'opacity-50 pointer-events-none' : ''}">
    {#if showForm}
      <FormControl type="text" placeholder="Email" bind:value={email} hasError={!emailValid} />
      <FormControl type="textarea" placeholder="What happened?" bind:value={message} hasError={!messageValid} />
      <div class="p-1 mt-4">
        <p class="my-2 text-xs opacity-50">Your image map:</p>
        <div class="relative">
          <p class="p-2 bg-theme-400 bg-opacity-10 rounded-md w-full overflow-hidden whitespace-nowrap text-ellipsis font-mono text-xs text-theme-400 select-none">{map}</p>
          <div class="btn fa-solid {mapCopyIcon} flex items-center justify-center w-[22px] h-[22px] right-[5px] top-[5px] absolute rounded shadow-md" on:click={copyMap} on:keypress={copyMap} />
        </div>
        <p class="mt-4 mb-2 text-xs opacity-50">Performed action:</p>
        <div class="relative">
          <p class="p-2 bg-theme-400 bg-opacity-10 rounded-md w-full overflow-hidden whitespace-nowrap text-ellipsis font-mono text-xs text-theme-400 select-none">{action}</p>
          <div class="btn fa-solid {actionCopyIcon} flex items-center justify-center w-[22px] h-[22px] right-[5px] top-[5px] absolute rounded shadow-md" on:click={copyAction} on:keypress={copyAction} />
        </div>
      </div>

      <!-- <p class="p-1 mt-4 text-xs leading-5">
        For further assistance, please contact us at
        <a href="https://webcraftplugins.com/support" target="_blank">
          https://webcraftplugins.com
          <div class="fa-solid fa-up-right-from-square" /></a
        >
        after submitting the bug.
      </p> -->
    {/if}
    {#if showError}
      <p class="m-1 p-4 mt-4 text-xs leading-5 bg-danger-500 bg-opacity-10">This is awkward. There was an error submitting the bug report :(</p>
    {/if}
    {#if showSuccess}
      <p class="p-1 text-xs leading-5">
        Thank you for helping us improve Image Map Pro!<br /><br />
        To view your bug report and chat with us:<br />
        <a href={bugReportUrl} target="_blank" rel="noreferrer"
          ><div class="fa-solid fa-up-right-from-square" />
          {bugReportUrl}</a
        >
      </p>
    {/if}
  </div>
</Modal>
