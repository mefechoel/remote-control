#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;

#[cfg(windows)]
mod win;

use dns_lookup;
use enigo::{Enigo, Key, KeyboardControllable, MouseButton, MouseControllable};
use qr2term::print_qr;
use regex::Regex;
use rocket::config::{Config, Environment, LoggingLevel};
use rocket::http::hyper::header::{ContentEncoding, Encoding};
use rocket::http::ContentType;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::response::content::Content;
use rocket::response::Response;
use rocket::State;
use std::io;
use std::io::Cursor;
use std::net::IpAddr;
use std::vec::Vec;

const ASSET_FONT: &[u8] =
  include_bytes!("../static/fonts/SpaceGrotesk/SpaceGrotesk-var.woff2");
const ASSET_ICON: &[u8] = include_bytes!("../static/icons/logo-512.webp");
const ASSET_HTML: &[u8] = include_bytes!("../dist/index.html");
const ASSET_HTML_BR: &[u8] = include_bytes!("../dist/index.html.br");
const ASSET_HTML_GZ: &[u8] = include_bytes!("../dist/index.html.gz");
const ASSET_LICENSES: &[u8] = include_bytes!("../lib-licenses.txt");

struct AppAssets {
  font: Vec<u8>,
  icon: Vec<u8>,
  html: Vec<u8>,
  html_br: Vec<u8>,
  html_gz: Vec<u8>,
  licenses: Vec<u8>,
}

enum CompEncoding {
  Brotli,
  Gzip,
  NoComp,
}

impl<'a, 'r> FromRequest<'a, 'r> for CompEncoding {
  type Error = ();

  fn from_request(request: &'a Request<'r>) -> Outcome<Self, Self::Error> {
    let encodings: Vec<&str> =
      request.headers().get("Accept-Encoding").collect();
    let br = encodings.iter().find(|enc| enc.to_string().contains("br"));
    let gz = encodings
      .iter()
      .find(|enc| enc.to_string().contains("gzip"));
    if br.is_some() {
      Outcome::Success(CompEncoding::Brotli)
    } else if gz.is_some() {
      Outcome::Success(CompEncoding::Gzip)
    } else {
      Outcome::Success(CompEncoding::NoComp)
    }
  }
}

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

#[get("/api/tab")]
fn tab() -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::Tab);
  Ok(String::from("OK"))
}

#[get("/api/enter")]
fn enter() -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::Return);
  Ok(String::from("OK"))
}

#[get("/api/refresh")]
fn refresh() -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::F5);
  Ok(String::from("OK"))
}

#[get("/api/fullscreen")]
fn fullscreen() -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::Layout('f'));
  Ok(String::from("OK"))
}

#[get("/api/escape")]
fn escape() -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::Escape);
  Ok(String::from("OK"))
}

#[get("/api/move_mouse?<x>&<y>")]
fn move_mouse(x: i32, y: i32) -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.mouse_move_relative(x, y);
  Ok(String::from("OK"))
}

#[get("/api/click")]
fn click() -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.mouse_click(MouseButton::Left);
  Ok(String::from("OK"))
}

#[get("/api/scroll_up")]
fn scroll_up() -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.mouse_scroll_y(1);
  Ok(String::from("OK"))
}

#[get("/api/scroll_down")]
fn scroll_down() -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.mouse_scroll_y(-1);
  Ok(String::from("OK"))
}

#[get("/licenses")]
fn licenses(assets: State<AppAssets>) -> io::Result<Content<Vec<u8>>> {
  let response = Content(ContentType::WOFF2, assets.licenses.to_owned());
  Ok(response)
}

#[get("/font")]
fn font(assets: State<AppAssets>) -> io::Result<Content<Vec<u8>>> {
  let response = Content(ContentType::WOFF2, assets.font.to_owned());
  Ok(response)
}

#[get("/icon")]
fn icon(assets: State<AppAssets>) -> io::Result<Content<Vec<u8>>> {
  let response = Content(ContentType::WEBP, assets.icon.to_owned());
  Ok(response)
}

#[get("/")]
fn index(assets: State<AppAssets>, comp: CompEncoding) -> Response {
  let (body, enc) = match comp {
    CompEncoding::Brotli => (
      assets.html_br.to_owned(),
      Encoding::EncodingExt("br".to_string()),
    ),
    CompEncoding::Gzip => (assets.html_gz.to_owned(), Encoding::Gzip),
    CompEncoding::NoComp => (assets.html.to_owned(), Encoding::Identity),
  };
  let response = Response::build()
    .header(ContentType::HTML)
    .header(ContentEncoding(vec![enc]))
    .sized_body(Cursor::new(body))
    .finalize();
  response
}

fn main() {
  let hostname =
    dns_lookup::get_hostname().expect("Could not identify hostname.");
  let ips =
    dns_lookup::lookup_host(&hostname).expect("Could not lookup ip addresses.");

  let unusable_ip_regex = r"\d{1,3}\.\d{1,3}\.\d{1,3}\.(0|1|255)";
  let ip = ips
    .into_iter()
    .filter_map(|ip| match ip {
      IpAddr::V4(ipv4) => Some(ipv4),
      _ => None,
    })
    .filter(|ip| {
      !Regex::new(unusable_ip_regex)
        .unwrap()
        .is_match(&ip.to_string())
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

  let font = Vec::from(ASSET_FONT);
  let icon = Vec::from(ASSET_ICON);
  let html = Vec::from(ASSET_HTML);
  let html_br = Vec::from(ASSET_HTML_BR);
  let html_gz = Vec::from(ASSET_HTML_GZ);
  let licenses = Vec::from(ASSET_LICENSES);

  rocket::custom(config)
    .manage(AppAssets {
      font,
      icon,
      html,
      html_br,
      html_gz,
      licenses,
    })
    .mount(
      "/",
      routes![
        index,
        licenses,
        font,
        icon,
        os,
        skip_forward,
        skip_back,
        media_play_pause,
        seek_forward,
        seek_back,
        pause,
        plus,
        minus,
        tab,
        enter,
        refresh,
        fullscreen,
        escape,
        move_mouse,
        click,
        scroll_up,
        scroll_down
      ],
    )
    .launch();
}
