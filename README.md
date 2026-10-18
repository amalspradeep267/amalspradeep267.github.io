# amalspradeep267.github.io

My motorsport-themed portfolio. It's a single static page with no build step and no dependencies.

- **Start lights:** five red lights, then lights out. This plays once per browser session.
- **Ignition key:** only Neutral is shown until you turn the key (twist it by dragging round the barrel, click it, or press Enter). Turning it unlocks the rest of the site.
- **Gear rail:** each section is a gear. Press keys `0`–`6` to jump between them.
- **Telemetry:** an instrument cluster with a big centre pod and smaller side pods. Hover a side pod to switch it to track mode.
- **Project wheel:** a slick tyre that turns as you scroll. Each project rotates to the pointer and comes into focus, and clicking the card opens the project on GitHub.
- **Race history, setup sheet, education and pit radio:** experience, skills, degrees and contact.

## Editing

All the content lives in [`data.js`](data.js), including the profile, telemetry dials, projects, experience, skills, education and contact text. Edit that file and refresh. You shouldn't need to touch `index.html`, `style.css` or `app.js`.

Project cover images are in [`media/`](media/).

## Running locally

Open `index.html` in a browser. It works straight from disk.

## Hosting

It's served by GitHub Pages from the `main` branch of this repo.
