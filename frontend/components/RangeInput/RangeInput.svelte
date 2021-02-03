<script>
  import createId from "../../util/ids";
  import style from "./RangeInput.module.css";

  export let min;
  export let max;
  export let value;
  export let label;
  export let step = 1;

  const id = createId();
</script>

<label class={style.label} for={id}>
  <span class={style.labelText}>{label}: {value}</span>
  <input
    {id}
    type="range"
    class={style.input}
    {min}
    {max}
    {step}
    bind:value
  />
</label>
