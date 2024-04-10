<script>
  import { getters } from 'Editor/store'
  import { selected } from 'Editor/store/ui'
  import * as consts from 'Editor/scripts/consts'
  import SettingsObject from 'Editor/components/object-details/settings-object'
  import SettingsGroup from 'Editor/components/object-details/settings-group'
  import SettingsArtboard from 'Editor/components/object-details/settings-artboard'
  import { onDestroy } from 'svelte'

  let subscribers = []

  onDestroy(() => {
    subscribers.forEach((unsub) => unsub())
    subscribers = []
  })

  let showObjectSettings = false
  let showGroupSettings = false
  let showArtboardSettings = false

  let objectSettingsTypes = [consts.OBJECT_SPOT, consts.OBJECT_RECT, consts.OBJECT_OVAL, consts.OBJECT_POLY, consts.OBJECT_SVG, consts.OBJECT_SVG_SINGLE, consts.OBJECT_TEXT]
  let groupSettingsTypes = [consts.OBJECT_GROUP]
  let artboardSettingsTypes = [consts.OBJECT_ARTBOARD]

  subscribers.push(
    selected.subscribe(() => {
      showObjectSettings = false
      showGroupSettings = false
      showArtboardSettings = false

      let foundObjectType = 0
      let foundGroupType = 0
      let foundArtboardType = 0

      let types = new Set()

      for (let id of $selected) {
        let obj = getters.getObject(id)
        if (objectSettingsTypes.includes(obj.type)) types.add('object')
        if (groupSettingsTypes.includes(obj.type)) types.add('group')
        if (artboardSettingsTypes.includes(obj.type)) types.add('artboard')
      }

      if (types.size === 1) {
        let obj = getters.getObject($selected[0])
        if (objectSettingsTypes.includes(obj.type)) showObjectSettings = true
        if (groupSettingsTypes.includes(obj.type)) showGroupSettings = true
        if (artboardSettingsTypes.includes(obj.type)) showArtboardSettings = true
      }
    })
  )
</script>

<div class="pretty-scroll w-full h-full overflow-y-auto p-1 border-l border-theme-200 dark:border-theme-700 bg-theme-100 dark:bg-theme-800">
  <SettingsObject visible={showObjectSettings} />
  <SettingsGroup visible={showGroupSettings} />
  <SettingsArtboard visible={showArtboardSettings} />
</div>
