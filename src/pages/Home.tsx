import { useEffect, useMemo, useState } from "react";
import Page from "src/components/Page";

type PokemonRecord = {
  name: string;
  moves?: string[];
  type1?: string | null;
  type2?: string | null;
  hp?: number | null;
  attack?: number | null;
  defense?: number | null;
  sp_attack?: number | null;
  sp_defense?: number | null;
  speed?: number | null;
};

type TeamSlot = {
  pokemon: PokemonRecord | null;
  selectedMoves: string[];
};

const TEAM_SIZE = 6;
const MAX_MOVES = 4;

const spriteModules = import.meta.glob("../../sprites/*.png", {
  eager: true,
  import: "default",
});

const typeIconModules = import.meta.glob("../../type_icons/*.png", {
  eager: true,
  import: "default",
});

const spriteLookup = createAssetLookup(spriteModules);
const typeIconLookup = createAssetLookup(typeIconModules);
const emptyTeam = createEmptyTeam();

export default function Home() {
  const [pokemonList, setPokemonList] = useState<PokemonRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [team, setTeam] = useState<TeamSlot[]>(emptyTeam);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPokemon() {
      try {
        const response = await fetch(
          new URL("../../pokemon_champions_stats.json", import.meta.url).href
        );

        if (!response.ok) {
          throw new Error(`Unable to load data (${response.status})`);
        }

        const rawData = (await response.json()) as unknown;
        const records = Array.isArray(rawData)
          ? rawData.filter(isPokemonRecord)
          : [];

        if (!cancelled) {
          setPokemonList(records.sort((left, right) => left.name.localeCompare(right.name)));
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load Pokemon data."
          );
        }
      }
    }

    void loadPokemon();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeSlot = team[activeSlotIndex];

  const filteredPokemon = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return pokemonList.filter((pokemon) => {
      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        pokemon.name,
        pokemon.type1 ?? "",
        pokemon.type2 ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [pokemonList, searchTerm]);

  const teamStats = useMemo(() => {
    return team.reduce(
      (totals, slot) => {
        if (!slot.pokemon) {
          return totals;
        }

        totals.hp += slot.pokemon.hp ?? 0;
        totals.attack += slot.pokemon.attack ?? 0;
        totals.defense += slot.pokemon.defense ?? 0;
        totals.spAttack += slot.pokemon.sp_attack ?? 0;
        totals.spDefense += slot.pokemon.sp_defense ?? 0;
        totals.speed += slot.pokemon.speed ?? 0;
        return totals;
      },
      {
        hp: 0,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      }
    );
  }, [team]);

  const typeDistribution = useMemo(() => {
    const counts = new Map<string, number>();

    team.forEach((slot) => {
      [slot.pokemon?.type1, slot.pokemon?.type2]
        .filter(Boolean)
        .forEach((type) => {
          const key = String(type);
          counts.set(key, (counts.get(key) ?? 0) + 1);
        });
    });

    return Array.from(counts.entries()).sort(
      (left, right) => right[1] - left[1]
    );
  }, [team]);

  function selectPokemon(pokemon: PokemonRecord) {
    const duplicateIndex = team.findIndex(
      (slot, index) =>
        index !== activeSlotIndex && slot.pokemon?.name === pokemon.name
    );

    if (duplicateIndex >= 0) {
      setErrorMessage(`${formatPokemonName(pokemon.name)} is already on the team.`);
      return;
    }

    setErrorMessage("");
    setTeam((currentTeam) => {
      return currentTeam.map((slot, index) =>
        index === activeSlotIndex
          ? {
              pokemon,
              selectedMoves: slot.selectedMoves.filter((move) =>
                (pokemon.moves ?? []).includes(move)
              ),
            }
          : slot
      );
    });
  }

  function removePokemon(slotIndex: number) {
    setTeam((currentTeam) =>
      currentTeam.map((slot, index) =>
        index === slotIndex ? { pokemon: null, selectedMoves: [] } : slot
      )
    );

    setErrorMessage("");
  }

  function updateSelectedMoves(
    slotIndex: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const selectedMoves = Array.from(event.target.selectedOptions)
      .map((option) => option.value)
      .slice(0, MAX_MOVES);

    setTeam((currentTeam) =>
      currentTeam.map((slot, index) =>
        index === slotIndex ? { ...slot, selectedMoves } : slot
      )
    );
  }

  return (
    <Page
      title="Pokemon Champions Team Builder"
      documentTitle="P-Champs Team Builder"
      className="team-builder-page"
    >
      <section className="builder-hero">
        <p className="builder-intro">
          Build a six-Pokemon squad from the local champions data set, then pick
          up to four moves for each slot. Everything runs client-side with the
          bundled sprites and type icons.
        </p>
        {errorMessage && <p className="builder-message">{errorMessage}</p>}
      </section>

      <section className="builder-layout">
        <aside className="builder-sidebar">
          <div className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Active slot</p>
                <h2>Slot {activeSlotIndex + 1}</h2>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => removePokemon(activeSlotIndex)}
                disabled={!activeSlot.pokemon}
              >
                Clear slot
              </button>
            </div>

            {activeSlot.pokemon ? (
              <PokemonPreview pokemon={activeSlot.pokemon} />
            ) : (
              <p className="empty-copy">
                Pick a Pokemon from the search list to fill this slot.
              </p>
            )}
          </div>

          <div className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Pokemon library</p>
                <h2>Search and assign</h2>
              </div>
              <span className="count-pill">{filteredPokemon.length} matches</span>
            </div>

            <label className="search-label" htmlFor="pokemon-search">
              Search by name or type
            </label>
            <input
              id="pokemon-search"
              className="search-input"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Try fire, dragon, or garchomp"
            />

            <div className="pokemon-search-list" role="list">
              {filteredPokemon.map((pokemon) => {
                const isSelected =
                  team[activeSlotIndex].pokemon?.name === pokemon.name;

                return (
                  <button
                    key={pokemon.name}
                    type="button"
                    className={`pokemon-search-item ${isSelected ? "is-selected" : ""}`}
                    onClick={() => selectPokemon(pokemon)}
                  >
                    <span className="search-item-title">
                      {formatPokemonName(pokemon.name)}
                    </span>
                    <span className="search-item-meta">
                      {[pokemon.type1, pokemon.type2]
                        .filter(Boolean)
                        .map((type) => formatPokemonName(String(type)))
                        .join(" / ") || "Unknown type"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Team summary</p>
                <h2>Totals and type spread</h2>
              </div>
            </div>

            <div className="summary-grid">
              <StatChip label="HP" value={teamStats.hp} />
              <StatChip label="Atk" value={teamStats.attack} />
              <StatChip label="Def" value={teamStats.defense} />
              <StatChip label="SpA" value={teamStats.spAttack} />
              <StatChip label="SpD" value={teamStats.spDefense} />
              <StatChip label="Spe" value={teamStats.speed} />
            </div>

            <div className="type-distribution">
              {typeDistribution.length ? (
                typeDistribution.map(([type, count]) => (
                  <span key={type} className="type-count-pill">
                    {formatPokemonName(type)} x{count}
                  </span>
                ))
              ) : (
                <p className="empty-copy">Add Pokemon to see team typing.</p>
              )}
            </div>
          </div>
        </aside>

        <div className="team-panel">
          <div className="panel-heading team-header">
            <div>
              <p className="eyebrow">Your roster</p>
              <h2>Six team slots</h2>
            </div>
            <span className="count-pill">
              {team.filter((slot) => slot.pokemon).length}/{TEAM_SIZE} filled
            </span>
          </div>

          <div className="team-grid">
            {team.map((slot, index) => {
              const isActive = index === activeSlotIndex;

              return (
                <article
                  key={`slot-${index + 1}`}
                  className={`team-slot ${isActive ? "is-active" : ""}`}
                >
                  <div className="team-slot-toolbar">
                    <button
                      type="button"
                      className="slot-button"
                      onClick={() => setActiveSlotIndex(index)}
                    >
                      {slot.pokemon ? "Edit slot" : "Choose Pokemon"}
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => removePokemon(index)}
                      disabled={!slot.pokemon}
                    >
                      Remove
                    </button>
                  </div>

                  {slot.pokemon ? (
                    <>
                      <div className="slot-summary">
                        <PokemonSprite pokemonName={slot.pokemon.name} />
                        <div>
                          <p className="slot-index">Slot {index + 1}</p>
                          <h3>{formatPokemonName(slot.pokemon.name)}</h3>
                          <div className="type-row">
                            <TypeBadge type={slot.pokemon.type1} />
                            <TypeBadge type={slot.pokemon.type2} />
                          </div>
                        </div>
                      </div>

                      <dl className="stats-grid">
                        <StatPair label="HP" value={slot.pokemon.hp} />
                        <StatPair label="Atk" value={slot.pokemon.attack} />
                        <StatPair label="Def" value={slot.pokemon.defense} />
                        <StatPair label="SpA" value={slot.pokemon.sp_attack} />
                        <StatPair label="SpD" value={slot.pokemon.sp_defense} />
                        <StatPair label="Spe" value={slot.pokemon.speed} />
                      </dl>

                      <label className="move-label" htmlFor={`moves-${index}`}>
                        Choose up to four moves
                      </label>
                      <select
                        id={`moves-${index}`}
                        className="move-select"
                        multiple
                        size={Math.min(8, Math.max(4, slot.pokemon.moves?.length ?? 4))}
                        value={slot.selectedMoves}
                        onChange={(event) => updateSelectedMoves(index, event)}
                      >
                        {Array.from(new Set(slot.pokemon.moves ?? [])).map((move) => (
                          <option key={move} value={move}>
                            {move}
                          </option>
                        ))}
                      </select>

                      <div className="selected-moves">
                        {slot.selectedMoves.length ? (
                          slot.selectedMoves.map((move) => (
                            <span key={move} className="move-pill">
                              {move}
                            </span>
                          ))
                        ) : (
                          <p className="empty-copy">
                            No moves selected yet for this slot.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="empty-slot">
                      <p className="slot-index">Slot {index + 1}</p>
                      <h3>Open position</h3>
                      <p className="empty-copy">
                        Select this slot, then choose a Pokemon from the library.
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </Page>
  );
}

function PokemonPreview({ pokemon }: { pokemon: PokemonRecord }) {
  return (
    <div className="pokemon-preview">
      <PokemonSprite pokemonName={pokemon.name} large />
      <div className="pokemon-preview-copy">
        <h3>{formatPokemonName(pokemon.name)}</h3>
        <div className="type-row">
          <TypeBadge type={pokemon.type1} />
          <TypeBadge type={pokemon.type2} />
        </div>
        <p className="preview-stats">
          Base stats: {pokemon.hp ?? 0} HP / {pokemon.attack ?? 0} Atk /{" "}
          {pokemon.defense ?? 0} Def / {pokemon.sp_attack ?? 0} SpA /{" "}
          {pokemon.sp_defense ?? 0} SpD / {pokemon.speed ?? 0} Spe
        </p>
      </div>
    </div>
  );
}

function PokemonSprite({
  pokemonName,
  large = false,
}: {
  pokemonName: string;
  large?: boolean;
}) {
  const sprite = getSpriteForPokemon(pokemonName);
  const className = large
    ? "pokemon-sprite pokemon-sprite-large"
    : "pokemon-sprite";

  return sprite ? (
    <img className={className} src={sprite} alt={formatPokemonName(pokemonName)} />
  ) : (
    <div className={`${className} sprite-fallback`} aria-label={formatPokemonName(pokemonName)}>
      ?
    </div>
  );
}

function TypeBadge({ type }: { type?: string | null }) {
  if (!type) {
    return null;
  }

  const icon = getTypeIcon(type);

  return (
    <span className="type-badge">
      {icon ? <img src={icon} alt="" aria-hidden="true" className="type-icon" /> : null}
      {formatPokemonName(type)}
    </span>
  );
}

function StatPair({
  label,
  value,
}: {
  label: string;
  value?: number | null;
}) {
  return (
    <div className="stat-pill">
      <span>{label}:</span>
      <strong>{value ?? 0}</strong>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function createEmptyTeam(): TeamSlot[] {
  return Array.from({ length: TEAM_SIZE }, () => ({
    pokemon: null,
    selectedMoves: [],
  }));
}

function isPokemonRecord(value: unknown): value is PokemonRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "name" in value;
}

function createAssetLookup(modules: Record<string, unknown>) {
  return Object.entries(modules).reduce<Record<string, string>>((lookup, [path, url]) => {
    const fileName = path.split("/").pop()?.replace(".png", "");

    if (fileName && typeof url === "string") {
      lookup[fileName.toLowerCase()] = url;
    }

    return lookup;
  }, {});
}

function getSpriteForPokemon(name: string) {
  return spriteLookup[name.toLowerCase()] ?? "";
}

function getTypeIcon(type: string) {
  return typeIconLookup[type.toLowerCase()] ?? "";
}

function formatPokemonName(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
