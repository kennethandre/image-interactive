<script>
  export let onChange = () => {}
  export let onUpdate = () => {}
  export let value = ''

  function handleUploadButtonClick() {
    window.parent.postMessage(
      JSON.stringify({
        action: 'uploadImage',
      }),
      '*'
    )
    window.addEventListener('message', handleMessage)
  }
  function handleMessage(e) {
    const data = JSON.parse(e.data)

    if (data.action === 'uploadImage') {
      window.removeEventListener('message', handleMessage)
      value = data.url
      onChange()
      onUpdate()
    }
  }
</script>

<div class="w-full">
  <div class="btn btn-primary form-control-border form-control-shadow rounded flex justify-center items-center px-3" style="height: 24px;" on:click={handleUploadButtonClick} on:keypress={handleUploadButtonClick}>Choose Image...</div>
  {#if value}
    <img src={value} alt="" class="w-full mt-2" />
  {/if}
</div>
