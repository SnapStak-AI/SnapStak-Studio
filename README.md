# SnapStak Studio

**An open-source VS Code extension for running and refining AI-generated projects, without leaving the editor.**

SnapStak Studio is the third tool in the SnapStak suite, alongside SnapStak Desktop (the CON10X Web Domain engine and Chrome extension) and SnapStak Mobile (the .NET MAUI Android app). Desktop and Mobile capture an interface and generate code. Studio is where that code is brought into VS Code, run in an embedded live browser, and refined with a set of AI-assisted tools.

> **Project status: work in progress.** Studio is published open source so other developers can build on it. It is not a finished product. The reliable, working core today is: take an AI-generated project as a zip, unzip it, detect its framework, run it, and view it live in an embedded browser. The AI panel tools around that core range from fully functional to partial. Contributions are welcome.

## What it does

The working core is a complete loop inside VS Code:

1. Point Studio at a folder of project zips.
2. Click a zip - Studio extracts it and runs `npm install`.
3. Click the project - Studio detects the framework, starts the right dev server, waits for the port, and opens the running app in an embedded browser.
4. Use the AI panel tools to refine the project, many of them acting on the live page in that browser.

Around the core sits an eight-tab AI panel - Media, Copywriter, Actions, Form, Animation, Database, Canvas, and Library - plus a drag-and-drop database schema designer and design canvases. Most of these are functional; some are foundations for contributors to extend.

## The engine stays on the server

Studio does **not** contain the CON10X engine. The engine runs on the SnapStak server, and Studio is a client to it: it authenticates over an HMAC-signed handshake, receives a short-lived session token, and calls the server's APIs (for example the copywriter generation endpoints). This separation is deliberate. It is what allows Studio to be fully open source while the engine itself remains proprietary - the value is the engine, and Studio is the free, inspectable front end.

## How it is built

Studio is a TypeScript extension written against the VS Code Extension API. It contributes:

- An activity-bar container with a **Workspace** file tree, a **Local Projects** zip list, and a **Settings** view.
- A secondary-sidebar **SnapStak AI** panel (the eight tabs).
- Full-editor webview panels for the copywriter, the database schema canvas, and the drawing canvas.

Two execution contexts are worth understanding before reading the source. The extension host (Node.js) does the privileged work - file access, the server client, spawning dev servers. The webviews are sandboxed HTML pages that render the UI and talk to the extension only by message passing. Every panel is therefore two halves: the UI in the webview, and a controller in the extension that handles its messages. A single shared browser webview, owned by `devRunner`, is the live surface the Media, Copywriter, and Database tools all act through.

## Getting started (from source)

**Prerequisites**

- Visual Studio Code 1.85 or later
- Node.js 20+
- A reachable SnapStak server for the authenticated AI features (default `http://localhost:3001`). Import and run-in-browser work without it; sign-in and the copywriter calls do not.

**Build and run**

```bash
npm install        # restore dependencies
npm run compile    # one-shot build (tsc -p ./)
# or
npm run watch      # rebuild on save
```

Press **F5** in VS Code to launch an Extension Development Host with Studio loaded. The SnapStak icon appears in the activity bar; open it to find the Workspace, Local Projects, and Settings views, with the AI panel in the secondary sidebar.

**Scripts**

| Script | Action |
| --- | --- |
| `npm run compile` | One-shot TypeScript build to `out/` |
| `npm run watch` | Rebuild on file change |
| `npm run lint` | Run ESLint over `src/` |

## Packaging as an installable extension (.vsix)

To produce a single file that anyone can install into VS Code without building from source, package the extension into a `.vsix`. VS Code uses the official packaging tool `@vscode/vsce`.

**1. Install the packaging tool** (once, globally):

```bash
npm install -g @vscode/vsce
```

Or run it without installing, using `npx @vscode/vsce` in place of `vsce` in the commands below.

**2. Build the `.vsix`** from the repository root:

```bash
vsce package
```

This automatically runs `npm run compile` first (via the `vscode:prepublish` hook), then bundles the compiled output, manifest, icon, README, and licence into a file named from the manifest - `snapstak-ai-1.0.0.vsix`. Packaging works fully offline and does not require a Marketplace account; only publishing to the Marketplace does.

**3. Install the `.vsix` in VS Code**, either through the UI or the command line:

- **UI:** open the Extensions view, click the `...` (Views and More Actions) menu at the top, choose **Install from VSIX...**, and select the file.
- **CLI:**

```bash
code --install-extension snapstak-ai-1.0.0.vsix
```

After installing, reload VS Code if prompted. The SnapStak icon appears in the activity bar.

> The `publisher` field in `package.json` must be set for packaging to succeed (it is). If you later publish to the Marketplace, that value must match your registered Marketplace publisher ID.

## Configuration

| Setting | Default | Description |
| --- | --- | --- |
| `snapstak.serverUrl` | `http://localhost:3001` | The SnapStak server the extension authenticates and makes API calls against. |

## Source layout

```
src/
  extension.ts          Activation - registers views, panels, commands
  snapstakClient.ts     Server client - HMAC auth, session token, API calls
  devRunner.ts          Framework detection, dev server, shared browser webview
  views/                Sidebar trees and webview view providers
  panels/               The eight AI tabs and the full-editor canvases
  copywriter/           Segment registry, source injector, panel state
media/                  Extension icon and SVG assets
docs/                   Setup guide
out/                    Compiled output (generated)
```

## Contributing

Studio is an active work in progress and contributions are welcome. The solid ground is the import-and-run core; natural areas to extend include the AI panel tools, write-back to source, and deployment. Open an issue to discuss a change before a large pull request, and please keep dependencies minimal - the extension intentionally depends only on the VS Code API and the TypeScript toolchain.

## Related projects

- **SnapStak Desktop / CON10X Web Domain** - the engine and Chrome extension that capture a web page and generate code.
- **SnapStak Mobile** - the .NET MAUI Android app that deconstructs installed WebView apps on-device.

Both are built on ConteX Law, the four-pillar framework (Structure, Behaviour, Influence, Objective) for confabulation-free AI output.

## License

SnapStak Studio is released under the [MIT License](LICENSE). Copyright (c) 2026 SnapStak.ai. Contributions and derivative works are welcome under its terms.
