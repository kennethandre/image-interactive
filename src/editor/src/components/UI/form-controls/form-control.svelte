<script>
  import { onDestroy } from 'svelte'
  import { store, getters, setters } from 'Editor/store'
  import { onMount } from 'svelte'
  import { selected, activeArtboard } from 'Editor/store/ui'
  import * as consts from 'Editor/scripts/consts'

  import WPImage from 'Editor/components/UI/form-controls/wp-image'
  import Text from 'Editor/components/UI/form-controls/text'
  import Number from 'Editor/components/UI/form-controls/number'
  import Textarea from 'Editor/components/UI/form-controls/textarea'
  import Color from 'Editor/components/UI/form-controls/color'
  import Button from 'Editor/components/UI/form-controls/button'
  import ButtonGroup from 'Editor/components/UI/form-controls/button-group'
  import Select from 'Editor/components/UI/form-controls/select'
  import Slider from 'Editor/components/UI/form-controls/slider'
  import Checkbox from 'Editor/components/UI/form-controls/checkbox'
  import Search from 'Editor/components/UI/form-controls/search'
  import Filters from 'Editor/components/UI/form-controls/filters'

  export let type
  export let value
  export let label
  export let description

  export let group
  export let prop

  export let onChange = () => {}
  export let onUpdate = () => {}
  export let onUpdateStart = () => {}
  export let onUpdateEnd = () => {}

  export let nopadding
  export let hidden = false

  // Number
  export let min
  export let max

  // Text
  export let attachment

  // Text, Textarea
  export let placeholder
  export let hasError

  // Button, checkbox
  export let name

  // Button
  export let action
  export let primary = false
  export let danger = false
  export let icon
  export let id

  // Button Group, Select, Slider
  export let options = []

  // Number, Slider
  export let integer = false

  let subscribers = []

  // Fast update event
  let event = new CustomEvent(consts.EVENT_FORM_CONTROL_UPDATE, {
    detail: {
      group,
      prop,
    },
  })
  let eventStart = new CustomEvent(consts.EVENT_FORM_CONTROL_UPDATE_START, {
    detail: {
      group,
      prop,
    },
  })
  let eventEnd = new CustomEvent(consts.EVENT_FORM_CONTROL_UPDATE_END, {
    detail: {
      group,
      prop,
    },
  })

  onMount(() => {
    if (prop) value = getters.getValue({ group, prop })
  })
  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  subscribers.push(
    store.subscribe(() => {
      if (prop) value = getters.getValue({ group, prop })
    })
  )

  if (group === 'selected') {
    subscribers.push(
      selected.subscribe(() => {
        if (prop) value = getters.getValue({ group, prop })
      })
    )
  }
  if (group === 'activeArtboard') {
    subscribers.push(
      activeArtboard.subscribe(() => {
        if (prop) value = getters.getValue({ group, prop })
      })
    )
  }

  function _onChange() {
    if (prop) setters.setValue({ group, prop, value: value })
    onChange(value)
  }

  function _onUpdate() {
    onUpdate(value)
    event.detail.value = value
    document.dispatchEvent(event)
  }

  function _onUpdateStart() {
    onUpdateStart(value)
    event.detail.value = value
    document.dispatchEvent(eventStart)
  }
  function _onUpdateEnd() {
    onUpdateEnd(value)
    event.detail.value = value
    document.dispatchEvent(eventEnd)
  }
</script>

<div class="{nopadding ? '' : 'p-1'} text-xs {hidden ? 'hidden' : ''}">
  <div class={description ? 'p-4 bg-theme-400 bg-opacity-10 rounded-md' : ''}>
    {#if type === 'wp-image'}
      <WPImage bind:value onChange={_onChange} onUpdate={_onUpdate} />
    {/if}
    {#if type === 'text'}
      <Text bind:value {placeholder} onChange={_onChange} onUpdate={_onUpdate} {attachment} {hasError} />
    {/if}
    {#if type === 'number'}
      <Number bind:value {label} onChange={_onChange} onUpdate={_onUpdate} onUpdateStart={_onUpdateStart} onUpdateEnd={_onUpdateEnd} {integer} {min} {max} />
    {/if}
    {#if type === 'color'}
      <Color bind:value onChange={_onChange} onUpdate={_onUpdate} />
    {/if}
    {#if type === 'textarea'}
      <Textarea bind:value onChange={_onChange} onUpdate={_onUpdate} {placeholder} {hasError} />
    {/if}
    {#if type === 'button'}
      <Button {name} {action} {primary} {danger} {icon} {id} />
    {/if}
    {#if type === 'button-group'}
      <ButtonGroup bind:value {options} onChange={_onChange} />
    {/if}
    {#if type === 'select'}
      <Select bind:value {options} onChange={_onChange} />
    {/if}
    {#if type === 'slider'}
      <Slider bind:value {options} {integer} onChange={_onChange} onUpdate={_onUpdate} onUpdateStart={_onUpdateStart} onUpdateEnd={_onUpdateEnd} />
    {/if}
    {#if type === 'checkbox'}
      <Checkbox bind:value {name} onChange={_onChange} />
    {/if}
    {#if type === 'search'}
      <Search bind:value {placeholder} onChange={_onChange} onUpdate={_onUpdate} />
    {/if}
    {#if type === 'filters'}
      <Filters bind:value {label} onChange={_onChange} onUpdate={_onUpdate} />
    {/if}
    {#if label && type !== 'number' && type !== 'filters'}
      <div style="margin-top: 2px; font-size: 11px;" class="select-none px-2 text-center">{label}</div>
    {/if}
    {#if description}
      <div style="margin-top: 2px; font-size: 11px;" class="select-none pt-2 opacity-50">{@html description}</div>
    {/if}
  </div>
</div>
