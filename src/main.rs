#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;

mod local_ip;

use qr2term::print_qr;
use enigo::{Enigo, Key, KeyboardControllable};
use rocket::config::{Config, LoggingLevel, Environment};
use rocket_contrib::serve::StaticFiles;
use std::io;
use std::process::Command;

const PORT: u16 = 4321;

#[cfg(not(linux))]
fn inc_vol() {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::Raw(115));
}

#[cfg(linux)]
fn inc_vol() {
  Command::new("amixer")
    .args(&["-D", "pulse", "sset", "Master", "5%+"])
    .output()
    .expect("Failed to increase volume");
}

#[cfg(not(linux))]
fn dec_vol() {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::Raw(114));
}

#[cfg(linux)]
fn dec_vol() {
  Command::new("amixer")
    .args(&["-D", "pulse", "sset", "Master", "5%-"])
    .output()
    .expect("Failed to decrease volume");
}

#[get("/pause")]
fn pause() -> io::Result<String> {
  let mut enigo = Enigo::new();
  enigo.key_click(Key::Space);
  Ok(String::from("OK"))
}

#[get("/plus")]
fn plus() -> io::Result<String> {
  inc_vol();
  Ok(String::from("OK"))
}

#[get("/minus")]
fn minus() -> io::Result<String> {
  dec_vol();
  Ok(String::from("OK"))
}

fn main() {
  let ip = local_ip::get().unwrap().to_string();
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
    .mount("/", StaticFiles::from("static"))
    .mount("/api", routes![pause, plus, minus])
    .launch();
}
