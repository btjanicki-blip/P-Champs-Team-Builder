import { ui } from "@adamjanicki/ui";

export default function Footer() {
  return (
    <ui.footer
      vfx={{
        axis: "x",
        align: "center",
        justify: "center",
        paddingY: "xxl",
        borderTop: true,
      }}
    >
      <ui.p vfx={{ fontWeight: 5 }}>
        Built for local Pokemon Champions team building with bundled data and
        assets.
        <ui.br />
        Powered by React, Vite, and the existing template shell.
      </ui.p>
    </ui.footer>
  );
}
