<script>
  import ControlButton from "../ControlButton";
  import {
    Escape,
    Fullscreen,
    Refresh,
    ScrollDown,
    ScrollUp,
  } from "../Icons";
  import request from "../request";
  import settings from "../../stores/settings";
  import style from "./Touchpad.module.css";

  let isMousePressed = false;
  let xStart = 0;
  let yStart = 0;
  let x = 0;
  let y = 0;
  let interval = null;
  let pressStart = 0;

  const startLoop = () => {
    if (interval !== null) {
      clearInterval(interval);
    }
    interval = setInterval(() => {
      request("move_mouse", { x, y });
      xStart += x;
      yStart += y;
      x = 0;
      y = 0;
    }, $settings.refreshRate);
  };

  const handleDown = (eventX, eventY) => {
    pressStart = Date.now();
    isMousePressed = true;
    xStart = eventX;
    yStart = eventY;
    x = 0;
    y = 0;
    startLoop();
  };
  const handleMove = (eventX, eventY) => {
    if (!isMousePressed) return;
    x = -(xStart - eventX);
    y = -(yStart - eventY);
  };
  const handleUp = () => {
    const pressEnd = Date.now();
    const pressDuration = pressEnd - pressStart;
    if (pressDuration <= $settings.clickDuration) {
      request("click");
    }
    isMousePressed = false;
    xStart = 0;
    yStart = 0;
    x = 0;
    y = 0;
    clearInterval(interval);
  };
  const handleMouseDown = (e) => handleDown(e.clientX, e.clientY);
  const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
  const handleTouchDown = (e) =>
    handleDown(e.touches[0].clientX, e.touches[0].clientY);
  const handleTouchMove = (e) =>
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
</script>

<div class={style.row}>
  <ControlButton
    icon={Refresh}
    endpoint="refresh"
    info="Seite neu laden"
  />
  <ControlButton
    icon={Escape}
    endpoint="escape"
    info="Vollbildmodus verlassen (Escape)"
  />
  <ControlButton
    icon={Fullscreen}
    endpoint="fullscreen"
    info="Vollbildmodus wechseln mit 'F'"
  />
</div>
<div
  class={style.pad + (isMousePressed ? ` ${style.active}` : "")}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={handleUp}
  on:touchstart={handleTouchDown}
  on:touchmove={handleTouchMove}
  on:touchend={handleUp}
/>
<div class={style.row}>
  <ControlButton
    class={style.scrollButton}
    icon={ScrollUp}
    endpoint="scroll_up"
    info="Nach oben scrollen"
  />
  <ControlButton
    class={style.scrollButton}
    icon={ScrollDown}
    endpoint="scroll_down"
    info="Nach unten scrollen"
  />
</div>
