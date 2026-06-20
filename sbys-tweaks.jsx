// sbys-tweaks.jsx — Tweaks panel for Stop. Before You Shop.
// Mounts a small React island that drives the page's CSS custom properties and a
// couple of DOM-level toggles (hero mascot pose, float animation). The page itself
// is vanilla; this only reads/writes :root variables + a few known nodes.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headerColor": "#5DE0E5",
  "accent": "#C8182E",
  "pageBg": "#EAF8F8",
  "cardRadius": 16,
  "heroPose": "run",
  "floaty": true
}/*EDITMODE-END*/;

const POSE_LABELS = { run: "Rennen", wave: "Winken", standing: "Stehen", selfie: "Selfie", head: "Kopf" };

function darken(hex, amt) {
  return `color-mix(in srgb, ${hex} ${100 - amt}%, #000)`;
}

function SbysTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply CSS variables
  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--cyan', t.headerColor);
    r.setProperty('--cyan-deep', darken(t.headerColor, 16));
    r.setProperty('--mint', `color-mix(in srgb, ${t.headerColor} 22%, #fff)`);
    r.setProperty('--mint-soft', `color-mix(in srgb, ${t.headerColor} 12%, #fff)`);
    r.setProperty('--red', t.accent);
    r.setProperty('--red-deep', darken(t.accent, 18));
    r.setProperty('--paper', t.pageBg);
    r.setProperty('--radius', t.cardRadius + 'px');
    r.setProperty('--radius-lg', Math.round(t.cardRadius * 1.6) + 'px');
  }, [t.headerColor, t.accent, t.pageBg, t.cardRadius]);

  // Hero mascot pose
  React.useEffect(() => {
    const img = document.querySelector('#hero-art-img');
    if (img) {
      img.src = 'assets/mascot-' + t.heroPose + '-trim.png';
    }
  }, [t.heroPose]);

  // Float animation
  React.useEffect(() => {
    document.body.classList.toggle('no-float', !t.floaty);
  }, [t.floaty]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Farben" />
      <TweakColor
        label="Kopfzeile (Smile)"
        value={t.headerColor}
        options={['#5DE0E5', '#00C8C8', '#2EC7A6', '#3AA0E0', '#1FB37A']}
        onChange={(v) => setTweak('headerColor', v)}
      />
      <TweakColor
        label="Akzent"
        value={t.accent}
        options={['#C8182E', '#E8173A', '#F0473F', '#E03E8C', '#1A1A1A']}
        onChange={(v) => setTweak('accent', v)}
      />
      <TweakColor
        label="Seiten-Hintergrund"
        value={t.pageBg}
        options={['#ffffff', '#F4FBFB', '#EAF8F8', '#FBF7F2']}
        onChange={(v) => setTweak('pageBg', v)}
      />

      <TweakSection label="Layout" />
      <TweakSlider
        label="Karten-Radius"
        value={t.cardRadius}
        min={0} max={28} step={2} unit="px"
        onChange={(v) => setTweak('cardRadius', v)}
      />

      <TweakSection label="Hero" />
      <TweakSelect
        label="Maskottchen-Pose"
        value={t.heroPose}
        options={[
          { value: 'run', label: 'Rennen (Rot)' },
          { value: 'run-cyan', label: 'Rennen (Cyan)' },
          { value: 'wave', label: 'Winken' },
          { value: 'standing', label: 'Stehen' },
          { value: 'selfie', label: 'Selfie' },
          { value: 'head', label: 'Kopf' }
        ]}
        onChange={(v) => setTweak('heroPose', v)}
      />
      <TweakToggle
        label="Schwebe-Animation"
        value={t.floaty}
        onChange={(v) => setTweak('floaty', v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<SbysTweaks />);
