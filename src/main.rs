#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;

#[cfg(windows)]
mod win;

mod html;

use dns_lookup;
use enigo::{Enigo, Key, KeyboardControllable};
use qr2term::print_qr;
use rocket::config::{Config, Environment, LoggingLevel};
use rocket::http::ContentType;
use rocket::response::content::Content;
use std::io;
use std::net::IpAddr;

#[cfg(linux)]
use std::process::Command;

const PORT: u16 = 4321;

#[cfg(windows)]
fn host_os() -> String {
  "windows".to_string()
}

#[cfg(linux)]
fn host_os() -> String {
  "linux".to_string()
}

#[cfg(windows)]
fn inc_vol() {
  win::key_click(win::WinKey::VolumeUp);
}

#[cfg(linux)]
fn inc_vol() {
  Command::new("amixer")
    .args(&["-D", "pulse", "sset", "Master", "5%+"])
    .output()
    .expect("Failed to increase volume");
}

#[cfg(windows)]
fn dec_vol() {
  win::key_click(win::WinKey::VolumeDown);
}

#[cfg(linux)]
fn dec_vol() {
  Command::new("amixer")
    .args(&["-D", "pulse", "sset", "Master", "5%-"])
    .output()
    .expect("Failed to decrease volume");
}

#[cfg(windows)]
fn press_arrow_right() {
  win::key_click(win::WinKey::RightArrow);
}

#[cfg(linux)]
fn press_arrow_right() {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::RightArrow);
}

#[cfg(windows)]
fn press_arrow_left() {
  win::key_click(win::WinKey::LeftArrow);
}

#[cfg(linux)]
fn press_arrow_left() {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::LeftArrow);
}

#[get("/api/host-os")]
fn os() -> io::Result<String> {
  Ok(host_os())
}

#[cfg(windows)]
#[get("/api/skip-forward")]
fn skip_forward() -> io::Result<String> {
  win::key_click(win::WinKey::MediaNextTrack);
  Ok(String::from("OK"))
}

#[cfg(windows)]
#[get("/api/skip-back")]
fn skip_back() -> io::Result<String> {
  win::key_click(win::WinKey::MediaPrevTrack);
  Ok(String::from("OK"))
}

#[cfg(windows)]
#[get("/api/media-play-pause")]
fn media_play_pause() -> io::Result<String> {
  win::key_click(win::WinKey::MediaPlayPause);
  Ok(String::from("OK"))
}

#[get("/api/seek-forward")]
fn seek_forward() -> io::Result<String> {
  press_arrow_right();
  Ok(String::from("OK"))
}

#[get("/api/seek-back")]
fn seek_back() -> io::Result<String> {
  press_arrow_left();
  Ok(String::from("OK"))
}

#[get("/api/pause")]
fn pause() -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::Space);
  Ok(String::from("OK"))
}

#[get("/api/plus")]
fn plus() -> io::Result<String> {
  inc_vol();
  Ok(String::from("OK"))
}

#[get("/api/minus")]
fn minus() -> io::Result<String> {
  dec_vol();
  Ok(String::from("OK"))
}

#[get("/")]
fn index() -> io::Result<Content<String>> {
  let response = Content(ContentType::HTML, html::HTML_CONTENT.to_string());
  Ok(response)
}

fn main() {
  let hostname = dns_lookup::get_hostname().expect("Could not identify hostname.");
  let ips = dns_lookup::lookup_host(&hostname).expect("Could not lookup ip addresses.");
  let ip = ips
    .into_iter()
    .filter_map(|ip| match ip {
      IpAddr::V4(ipv4) => Some(ipv4),
      _ => None,
    })
    .next()
    .expect("Could not find local ip address.")
    .to_string();

  let url = format!("http://{}:{}/", ip, PORT);
  print_qr(&url).expect("Error creating QR-Code");
  println!("{}", url);

  let config = Config::build(Environment::Production)
    .port(PORT)
    .workers(1)
    .address(ip)
    .log_level(LoggingLevel::Off)
    .unwrap();

  rocket::custom(config)
    .mount(
      "/",
      routes![
        index,
        os,
        skip_forward,
        skip_back,
        media_play_pause,
        seek_forward,
        seek_back,
        pause,
        plus,
        minus
      ],
    )
    .launch();
}
