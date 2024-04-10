<script>
  import MenuOptionSeparator from 'Editor/components/UI/menu/menu-option-separator'
</script>

<div class="menu-option-group">
  <slot />
  <div class="menu-option-group-border">
    <MenuOptionSeparator />
  </div>
</div>

<style>
  .menu-option-group:last-child .menu-option-group-border {
    display: none;
  }
</style>
