<script>
  import request from "../request";
  import SvgButton from "../SvgButton";

  export let icon;
  export let endpoint;
  export let info;

  const handleActivate = () => request(endpoint);
</script>

<SvgButton {info} {icon} on:activate={handleActivate} />
