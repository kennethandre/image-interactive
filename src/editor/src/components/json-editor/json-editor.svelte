<script>
  import JsonEditorObject from 'Editor/components/json-editor/json-editor-object'
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import Menu from 'Editor/components/UI/menu/menu'
  import * as utils from 'Editor/scripts/utilities'

  export let defaults = {}
  export let model = {}
  export let title
  export let onChange = () => {}

  let id = utils.uuidv4()
  let searchString = ''
  let hideUnchanged = false
</script>

<!-- model is an Array => recursion -->
<div class="flex font-mono text-xs pl-4">
  <JsonEditorObject name={title} bind:value={model} {defaults} parents="0" nomargin {onChange} {searchString} {hideUnchanged} isRoot={true}>
    <svelte:fragment slot="extra-button">
      <div class="fa-solid fa-cog ml-2 cursor-pointer opacity-50 hover:opacity-100" data-open-menu="{id}-settings" />
    </svelte:fragment>
  </JsonEditorObject>
</div>
<Menu name="{id}-settings" classes="p-3 w-64">
  <FormControl type="text" label="Search" small bind:value={searchString} />
  <FormControl type="checkbox" name="Show changed only" small bind:value={hideUnchanged} />
</Menu>
