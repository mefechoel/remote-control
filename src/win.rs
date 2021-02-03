use winapi;

use self::winapi::ctypes::c_int;
use self::winapi::um::winuser::*;

use std::mem::*;

pub enum WinKey {
	PageUp,
	PageDown,
	LeftArrow,
	RightArrow,
	Space,
	VolumeUp,
	VolumeDown,
	MediaNextTrack,
	MediaPrevTrack,
	MediaPlayPause,
}

fn keybd_event(flags: u32, vk: u16) {
	let mut input = INPUT {
		type_: INPUT_KEYBOARD,
		u: unsafe {
			transmute_copy(&KEYBDINPUT {
				wVk: vk,
				wScan: 0, // We're just using vitual keycodes, no need for the scancode
				dwFlags: flags,
				time: 0,
				dwExtraInfo: 0,
			})
		},
	};
	unsafe { SendInput(1, &mut input as LPINPUT, size_of::<INPUT>() as c_int) };
}

fn get_key_code(key: WinKey) -> u16 {
	let key_code = match key {
		WinKey::PageUp => VK_PRIOR,                    // 0x21
		WinKey::PageDown => VK_NEXT,                   // 0x22
		WinKey::LeftArrow => VK_LEFT,                  // 0x25
		WinKey::RightArrow => VK_RIGHT,                // 0x27
		WinKey::Space => VK_SPACE,                     // 0x20
		WinKey::VolumeUp => VK_VOLUME_UP,              // 0xAF
		WinKey::VolumeDown => VK_VOLUME_DOWN,          // 0xAE
		WinKey::MediaNextTrack => VK_MEDIA_NEXT_TRACK, // 0xB0
		WinKey::MediaPrevTrack => VK_MEDIA_PREV_TRACK, // 0xB1
		WinKey::MediaPlayPause => VK_MEDIA_PLAY_PAUSE, // 0xB3
	};
	key_code as u16
}

pub fn key_click(key: WinKey) {
	// Don't convert the key to a scan code.
	// Just use the virtual keycode.
	let keycode = get_key_code(key);
	use std::{thread, time};
	// We want to use the virtual keycode instead of a scancode,
	// so we don't set the `KEYEVENTF_SCANCODE` flag.
	// A regular keypress without any options will be issued.
	keybd_event(0, keycode);
	thread::sleep(time::Duration::from_millis(20));
	keybd_event(KEYEVENTF_KEYUP, keycode);
}
