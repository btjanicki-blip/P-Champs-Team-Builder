import { ui } from "@adamjanicki/ui";
import Page from "src/components/Page";

export default function About() {
  return (
    <Page title="About P-Champs Builder">
      <ui.p
        vfx={{
          paddingX: "l",
          fontSize: "m",
          fontWeight: 5,
          color: "muted",
          textAlign: "center",
        }}
      >
        This project extends the starter template into a local Pokemon team
        builder.
        <ui.br />
        Use the home page to search Pokemon, fill up to six team slots, and
        choose up to four moves per Pokemon from the bundled JSON data.
      </ui.p>
    </Page>
  );
}
