<script>
  import request from "../request";
  import SvgButton from "../SvgButton";

  export let icon;
  export let endpoint;
  export let info;
  let className = "";
  export { className as class };

  const handleActivate = () => request(endpoint);
</script>

<SvgButton
  class={className}
  {info}
  {icon}
  on:activate={handleActivate}
/>
