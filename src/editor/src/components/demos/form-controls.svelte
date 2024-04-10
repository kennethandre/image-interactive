<script>
  import FormControl from 'Editor/components/UI/form-controls/form-control'
  import FormHeading from 'Editor/components/UI/form-controls/form-heading'
  import FormSection from 'Editor/components/UI/form-controls/form-section'
</script>

<!-- <div class="bg-red-500 absolute z-0 left-32 top-20 w-96 h-96" />
<div class="bg-blue-500 absolute z-0 left-0 top-60 w-96 h-96" /> -->

<div class="p-2">
  <FormSection title="Section">
    <FormControl type="text" label="Name" />
    <FormHeading title="Position" />
    <div class="flex">
      <FormControl type="number" label="x" />
      <FormControl type="number" label="y" />
      <FormControl type="color" label="Background" value="#b4fdce" />
    </div>
    <FormControl type="color" label="Background" value="#b4fdce" />
    <FormControl type="textarea" label="Enter something" />
  </FormSection>
  <FormSection title="Section">
    <FormHeading title="Buttons" />
    <FormControl type="button" name="Cancel" />
    <FormControl type="button" name="Done" primary icon="fa-solid fa-check" />
    <FormControl type="button" name="Delete" danger icon="fa-solid fa-trash" />
    <FormControl
      type="button-group"
      value="green"
      label="Choose one"
      options={[
        { name: 'Red', value: 'red' },
        { name: 'Green', value: 'green' },
        { name: 'Blue', value: 'blue' },
      ]}
    />
    <FormHeading title="Stuff" />
    <FormControl
      type="select"
      label="Choose one"
      options={[
        { name: 'Red', value: 'red' },
        { name: 'Green', value: 'green' },
        { name: 'Blue', value: 'blue' },
      ]}
    />
    <FormControl type="slider" label="Slide me" options={{ min: 0, max: 2000 }} integer value="200" />
    <FormControl type="checkbox" name="Checkbox" />
  </FormSection>
</div>
