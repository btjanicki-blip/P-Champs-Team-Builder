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
        The site is a client-side Pokémon team builder built on top of a static HTML/CSS template, 
        using vanilla JavaScript to handle all interactivity and state management. On load, the app 
        fetches and parses pokemon_champions_stats.json, then dynamically populates a searchable 
        selection interface that lets users add up to six Pokémon to a team. Each selected 
        Pokémon displays its sprite and typing with corresponding icons, base stats, and a 
        move selection UI that allows up to four moves pulled from the same JSON dataset. 
        The DOM is updated in real time as users add or remove Pokémon and choose moves, 
        with all data handled in-memory and no backend required, resulting in a lightweight, 
        fully local web app that runs directly from index.html.
        <ui.br />
        Use the home page to search Pokemon, fill up to six team slots, and
        choose up to four moves per Pokemon from the bundled JSON data.
      </ui.p>
    </Page>
  );
}
