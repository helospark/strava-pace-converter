# Strava Pace Converter (Firefox Extension)

A lightweight Firefox extension that automatically converts absolute running times into **min/km pace** across the Strava web interface.

## 🏃 Why this exists?
For many runners, seeing a "50:00" 10k PR is less useful than seeing "5:00/km". This extension does the mental math for you, injecting pace data directly into the UI where it's missing.

## 📸 Gallery
| Profile PRs | Map Popups |
| :---: | :---: |
| ![Best Efforts](./images/best-effors.png) | ![Map Pace](./images/map.png) |
| *Comparing your top efforts* | *Real-time pace on map segments* |

| Leaderboards | My Segments |
| :---: | :---: |
| ![Compare PRs](./images/best-efforts-compare.png) | ![Segment Table](./images/crowns.png) |
| *Pace-based comparisons* | *Added Pace column in segment lists* |

## ✨ Features
- **Profile PRs:** Replaces total time with pace in the "All-Time PRs" table.
- **Map Segments:** When exploring the map, popup details are updated to show the pace of top efforts.
- **My Segments Table:** Adds a brand new "Pace" column to your personal segments list.
- **Colspan Support:** Intelligent table parsing that accounts for shifting columns (e.g., when elevation icons appear).
- **Responsive UI:** Uses non-breaking spaces (` `) and `nowrap` styling to ensure units stay formatted correctly.
- **High Performance:** Powered by `MutationObserver`—it only works when the DOM changes, keeping CPU usage near zero.

## ⚠️ Known Limitations
- **Map Segment Precision:** In the map view, Strava often displays distances with single-digit precision (e.g., showing "0.7km" even if the actual distance is 0.74km). This can cause the calculated pace to be slightly off, with the effect being more noticeable on shorter segments.

## 🛠️ Installation

### 1. Local Development / Private Use
1. Download this repository as a ZIP or clone it.
2. Open Firefox and type `about:debugging` in the address bar.
3. Click **"This Firefox"**.
4. Click **"Load Temporary Add-on..."**.
5. Select the `manifest.json` file in the project folder.

## ⚖️ License
This project is open source under the MIT License.

## ⚠️ Disclaimer
This extension is an independent project and is not affiliated with or endorsed by Strava, Inc.
