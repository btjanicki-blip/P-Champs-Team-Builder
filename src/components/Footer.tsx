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
        Static Pokemon Champions team building site with bundled data and
        assets. Featuring pokemon available in the first regulation of Pokemon Champions.
        <ui.br />
        Built by Brian, 2026
      </ui.p>
    </ui.footer>
  );
}
