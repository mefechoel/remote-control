<script>
  import ControlButton from "../ControlButton";
  import {
    Minus,
    Pause,
    PlayPause,
    Plus,
    SeekBack,
    SeekForward,
    SkipBack,
    SkipForward,
  } from "../Icons";
  import style from "./Controls.module.css";
</script>

<div class={style.controlls}>
  <div class={style.row}>
    <ControlButton
      icon={SkipBack}
      endpoint="skip-back"
      info="Vorrigen Titel abspielen"
    />
    <ControlButton
      icon={Pause}
      endpoint="pause"
      info="Play/Pause durch Drücken der Leertaste"
    />
    <ControlButton
      icon={SkipForward}
      endpoint="skip-forward"
      info="Nächsten Titel abspielen"
    />
  </div>
  <div class={style.row}>
    <ControlButton
      icon={SeekBack}
      endpoint="seek-back"
      info="Zurückspulen"
    />
    <ControlButton
      icon={SeekForward}
      endpoint="seek-forward"
      info="Vorspulen"
    />
  </div>
  <div class={style.row}>
    <ControlButton icon={Plus} endpoint="plus" info="Lauter" />
    <ControlButton icon={Minus} endpoint="minus" info="Leiser" />
    <ControlButton
      icon={PlayPause}
      endpoint="media-play-pause"
      info="Play/Pause durch Drücken der Play/Pause-Medientaste"
    />
  </div>
</div>
