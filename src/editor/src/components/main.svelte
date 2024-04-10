<script>
  import { previewMode } from 'Editor/store/ui'
  import Canvas from 'Editor/components/canvas/canvas'
  import Client from 'Editor/components/client'
  import * as consts from 'Editor/scripts/consts'
</script>

<div class="relative bg-theme-50 dark:bg-theme-900 w-full h-full flex items-center justify-center overflow-hidden" data-object-type={consts.MAIN_ROOT}>
  {#if !$previewMode}
    <Canvas />
  {/if}
  {#if $previewMode}
    <Client />
  {/if}
</div>
