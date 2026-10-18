# amalspradeep267.github.io

My motorsport-themed portfolio. It's a single static page with no build step and no dependencies.

- **Start lights:** five red lights, then lights out. This plays once per browser session.
- **Ignition key:** only Neutral is shown until you turn the key (scroll down, twist it by dragging round the barrel, click it, or press Enter). Turning it sets off a shockwave and scan line, the dash flickers on, and a live red background fills the page.
- **Gear rail:** each section is a gear. Press keys `0`–`6` to jump between them.
- **Telemetry:** an instrument cluster with a big centre pod and smaller side pods. A pod with `type: "gear"` becomes a gear display that shifts up to its value with shift lights. Hover a side pod to switch it to track mode.
- **Live background:** red light streaks, glows, a dot grid and a telemetry trace. They drift with scrolling and speed up when you scroll fast.
- **Project wheel:** a slick tyre that turns as you scroll. Each project rotates to the pointer and comes into focus, and clicking the card opens the project on GitHub.
- **Race history, setup sheet, education and pit radio:** experience, skills, degrees and contact.

## Editing

All the content lives in [`data.js`](data.js), including the profile, telemetry dials, projects, experience, skills, education and contact text. Edit that file and refresh. You shouldn't need to touch `index.html`, `style.css` or `app.js`.

Project cover images are in [`media/`](media/).

## Running locally

Open `index.html` in a browser. It works straight from disk.

## Hosting

It's served by GitHub Pages from the `main` branch of this repo.

## Portrait

A faded portrait sits inside the race track on the home page (desktop only). To remove it, set `portrait: ""` in `data.js`.

To go back to the version without the portrait completely:

```
git revert --no-edit v1-no-portrait..HEAD
git push
```
