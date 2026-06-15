$ErrorActionPreference = "Stop"

$root = "d:\CARLOZ\Desktop\coaching\Coaching-Platform"
$htmlPath = Join-Path $root "index.html"
$srcDir = Join-Path $root "src"
$componentsDir = Join-Path $srcDir "components"

New-Item -ItemType Directory -Force -Path $srcDir | Out-Null
New-Item -ItemType Directory -Force -Path $componentsDir | Out-Null

$html = git -C $root show HEAD:index.html

$title = [regex]::Match($html, '<title>(.*?)</title>', 'Singleline').Groups[1].Value
$fontLinks = [regex]::Matches($html, '<link[\s\S]*?>') | ForEach-Object { $_.Value }
$css = [regex]::Match($html, '<style>\s*([\s\S]*?)\s*</style>').Groups[1].Value
$script = [regex]::Match($html, '<script>\s*([\s\S]*?)\s*</script>\s*</body>').Groups[1].Value
$body = [regex]::Match($html, '<body>\s*([\s\S]*?)\s*<script>').Groups[1].Value

function Get-Segment {
  param(
    [string] $Content,
    [string] $Start,
    [string] $End
  )
  $startIdx = $Content.IndexOf($Start)
  if ($startIdx -lt 0) { throw "Start marker not found: $Start" }
  if ($End -eq "") {
    return $Content.Substring($startIdx).Trim()
  }
  $endIdx = $Content.IndexOf($End, $startIdx)
  if ($endIdx -lt 0) { throw "End marker not found: $End" }
  return $Content.Substring($startIdx, $endIdx - $startIdx).Trim()
}

function Write-Component {
  param(
    [string] $Name,
    [string] $Markup
  )
  $escaped = $Markup -replace '`', '\`' -replace '\$\{', '\${'
  $content = @"
export default function $Name() {
  return <div dangerouslySetInnerHTML={{ __html: ``$escaped`` }} />;
}
"@
  [System.IO.File]::WriteAllText((Join-Path $componentsDir "$Name.jsx"), $content)
}

$segments = @(
  @{ Name = "ToastContainer"; Start = "<!-- TOAST CONTAINER -->"; End = "<!-- COACH PROFILE MODAL -->" },
  @{ Name = "CoachModal"; Start = "<!-- COACH PROFILE MODAL -->"; End = "<!-- NAVIGATION -->" },
  @{ Name = "Navigation"; Start = "<!-- NAVIGATION -->"; End = "<!-- HERO -->" },
  @{ Name = "Hero"; Start = "<!-- HERO -->"; End = "<!-- PROGRAMS -->" },
  @{ Name = "Programs"; Start = "<!-- PROGRAMS -->"; End = "<!-- COACHES -->" },
  @{ Name = "Coaches"; Start = "<!-- COACHES -->"; End = "<!-- COACH SELECTION FORM -->" },
  @{ Name = "CoachSelection"; Start = "<!-- COACH SELECTION FORM -->"; End = "<!-- TESTIMONIALS -->" },
  @{ Name = "Testimonials"; Start = "<!-- TESTIMONIALS -->"; End = "<!-- CONTACT -->" },
  @{ Name = "Contact"; Start = "<!-- CONTACT -->"; End = "<!-- FOOTER -->" },
  @{ Name = "Footer"; Start = "<!-- FOOTER -->"; End = "" }
)

foreach ($segment in $segments) {
  Write-Component -Name $segment.Name -Markup (Get-Segment -Content $body -Start $segment.Start -End $segment.End)
}

$indexHtml = @"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>$title</title>
    $($fontLinks -join "`r`n    ")
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"@
[System.IO.File]::WriteAllText($htmlPath, $indexHtml)
[System.IO.File]::WriteAllText((Join-Path $srcDir "styles.css"), $css)

$appLogic = @"
export function initApexApp() {
$script
}
"@
$appLogic = $appLogic -replace '(?s)document\.addEventListener\("DOMContentLoaded", \(\) => \{\s*([\s\S]*?)\s*\}\);\s*\}\s*$', @"
  Object.assign(window, {
    scrollToForm,
    openCoachModal,
    goToSlide,
    selectFilteredCoach,
    selectSlot,
  });

  `$1
"@
$appLogic += @"

  return () => {
    clearInterval(typeof sliderInterval !== "undefined" ? sliderInterval : undefined);
    window.removeEventListener("resize", updateSlider);
  };
}
"@
[System.IO.File]::WriteAllText((Join-Path $srcDir "appLogic.js"), $appLogic)

$app = @"
import { useEffect } from "react";
import ToastContainer from "./components/ToastContainer";
import CoachModal from "./components/CoachModal";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Programs from "./components/Programs";
import Coaches from "./components/Coaches";
import CoachSelection from "./components/CoachSelection";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { initApexApp } from "./appLogic";

export default function App() {
  useEffect(() => {
    const cleanup = initApexApp();
    return cleanup;
  }, []);

  return (
    <>
      <ToastContainer />
      <CoachModal />
      <Navigation />
      <Hero />
      <Programs />
      <Coaches />
      <CoachSelection />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
"@
[System.IO.File]::WriteAllText((Join-Path $srcDir "App.jsx"), $app)

$main = @"
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
"@
[System.IO.File]::WriteAllText((Join-Path $srcDir "main.jsx"), $main)

$package = @"
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {}
}
"@
[System.IO.File]::WriteAllText((Join-Path $root "package.json"), $package)
