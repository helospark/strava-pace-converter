# Strava Pace Converter (Firefox Extension)

A lightweight Firefox extension that automatically converts absolute sport times into **min/km pace** or **min/mile** across the Strava web interface. Mainly for running and cycling.

## 🏃 Why this exists?
For many athletes, seeing a "50:00" 10k PR is less useful than seeing "5:00/km". This extension does the mental math for you, injecting pace data directly into the UI where it's missing.

## Gallery
| Best effort pace | Compare pace |
| :---: | :---: |
| ![Best Efforts](./images/best-effors.png) | ![Compare PRs](./images/best-efforts-compare.png) |

| Leaderboards pace | Map pace |
| :---: | :---: |
| ![Segment Table](./images/crowns.png) | ![Map Pace](./images/map.png) |

## Features
- **Profile PRs:** Replaces total time with pace in the "All-Time PRs" table.
- **Map Segments:** When exploring the map, popup details are updated to show the pace of top efforts.
- **My Segments Table:** Adds a brand new "Pace" column to your personal segments list.

## Known Limitations
- **Map Segment Precision:** In the map view, Strava often displays distances with single-digit precision (e.g., showing "0.7km" even if the actual distance is 0.74km). This can cause the calculated pace to be slightly off, with the effect being more noticeable on shorter segments.

## Installation

### Firefox

#### 1. Local Development / Private Use
1. Download this repository as a ZIP or clone it.
2. Open Firefox and type `about:debugging` in the address bar.
3. Click **"This Firefox"**.
4. Click **"Load Temporary Add-on..."**.
5. Select the `manifest.json` file in the project folder.

#### 2. Install from extension store

https://addons.mozilla.org/en-US/firefox/addon/strava-pace-converter/

### Chrome

1. Download this repository as a ZIP or clone it.
2. Go to chrome://extensions/ and enable "Developer mode" in the top right
3. Use **Load unpacked** and point it to the folder


## Release notes

**1.0 to 1.2** - Initial release
**1.3** - Added option to use mile/km, added multiple display options and flags to disable the conversion on several pages
**1.4** - Change default value, add support for Chrome build

## License
This project is open source under the MIT License.

## Disclaimer
This extension is an independent project and is not affiliated with or endorsed by Strava, Inc.
