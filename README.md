# Puppeteer Remote Debugging

This is an example of how to use Puppeteer to connect to a Chromium based browser via remote debugging (TCP). With this approach, web pages that are already logged in can be directly attached to, thus not requiring manual injection of login/session information.

## How To Use

### Requirements

#### Software

- Chromium based browser
- NodeJS
  - `puppeteer` module

### How To Run

1. Run Chromium with remote debugging enabled:

```bash
chromium --remote-debugging-port=9222 2>&1 | tee /tmp/chromium.ws
```

This pipes the entire output of the browser into `/tmp/chromium.ws`:

```
DevTools listening on ws://127.0.0.1:9222/devtools/browser/f1544ace-94e6-43e2-9a9e-f0aa1dbad498
[294766:294766:0524/163348.987125:ERROR:gl_surface_presentation_helper.cc(260)] GetVSyncParametersIfAvailable() failed for 1 times!
[294766:294766:0524/163358.457535:ERROR:gl_surface_presentation_helper.cc(260)] GetVSyncParametersIfAvailable() failed for 2 times!
[294766:294766:0524/163411.776112:ERROR:gl_surface_presentation_helper.cc(260)] GetVSyncParametersIfAvailable() failed for 3 times!
```

This includes the hash (i.e. `f1544ace-94e6-43e2-9a9e-f0aa1dbad498`) we need to connect via remote debugging.

2. Run puppeteer script:

```bash
node puppeteer.js
```
