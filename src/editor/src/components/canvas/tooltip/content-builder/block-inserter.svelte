<script>
  import { getContext } from 'svelte'
  import Menu from 'Editor/components/UI/menu/menu'
  import MenuOption from 'Editor/components/UI/menu/menu-option'
  import * as consts from 'Editor/scripts/consts'

  let context = getContext('content-builder')

  function addParagraph() {
    context.addBlock(consts.CONTENT_BLOCK_PARAGRAPH)
  }
  function addHeading() {
    context.addBlock(consts.CONTENT_BLOCK_HEADING)
  }
  function addButton() {
    context.addBlock(consts.CONTENT_BLOCK_BUTTON)
  }
  function addImage() {
    context.addBlock(consts.CONTENT_BLOCK_IMAGE)
  }
  function addVideo() {
    context.addBlock(consts.CONTENT_BLOCK_VIDEO)
  }
  function addYoutube() {
    context.addBlock(consts.CONTENT_BLOCK_YOUTUBE)
  }
</script>

<div class="flex justify-center p-2 rounded border border-dashed border-white border-opacity-50 bg-black bg-opacity-25" style="margin: 10px;">
  <div data-open-menu="block inserter menu" class="flex justify-center items-center fa-solid fa-plus w-6 h-6 btn rounded form-control-border form-control-shadow text-xs" />
  <Menu name="block inserter menu" moveToRoot>
    <MenuOption onClick={addParagraph} icon="fa-solid fa-paragraph" title="Paragraph" />
    <MenuOption onClick={addHeading} icon="fa-solid fa-header" title="Heading" />
    <MenuOption onClick={addButton} icon="fa-solid fa-link" title="Button" />
    <MenuOption onClick={addImage} icon="fa-solid fa-image" title="Image" />
    <MenuOption onClick={addVideo} icon="fa-solid fa-video-camera" title="HTML5 Video" />
    <MenuOption onClick={addYoutube} icon="fa-brands fa-youtube" title="YouTube Video" />
  </Menu>
</div>
