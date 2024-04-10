<script>
  import BoxModelInput from 'Editor/components/canvas/tooltip/content-builder/toolbar/box-model/box-model-input'
  import BoxModelBox from 'Editor/components/canvas/tooltip/content-builder/toolbar/box-model/box-model-box'

  export let onChange = () => {}
  export let model = {
    width: 'auto',
    height: 'auto',
    margin: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    padding: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  }
</script>

<div class="border border-black text-xs text-black" style="width: 240px; height: 240px;">
  <BoxModelBox title="margin" bg="#FEC893">
    <BoxModelInput bind:value={model.margin.left} {onChange} slot="left" />
    <BoxModelInput bind:value={model.margin.top} {onChange} slot="top" />
    <BoxModelInput bind:value={model.margin.bottom} {onChange} slot="bottom" />
    <BoxModelInput bind:value={model.margin.right} {onChange} slot="right" />

    <BoxModelBox title="padding" bg="#C2CE7D" slot="center">
      <BoxModelInput bind:value={model.padding.left} {onChange} slot="left" />
      <BoxModelInput bind:value={model.padding.top} {onChange} slot="top" />
      <BoxModelInput bind:value={model.padding.bottom} {onChange} slot="bottom" />
      <BoxModelInput bind:value={model.padding.right} {onChange} slot="right" />

      <div slot="center" class="flex">
        <BoxModelInput bind:value={model.width} {onChange} />
        x
        <BoxModelInput bind:value={model.height} {onChange} />
      </div>
    </BoxModelBox>
  </BoxModelBox>
</div>
