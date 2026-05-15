import { useEffect, useMemo, useState } from "react";

export default function PingPongTournamentApp() {
  const [activeTab, setActiveTab] = useState("tabla");
  const [newTeam, setNewTeam] = useState("");
  const [matchForm, setMatchForm] = useState({
    home: "",
    away: "",
    homeSets: 3,
    awaySets: 0,
  });

  const [tournaments, setTournaments] = useState(() => {
    const saved = localStorage.getItem("pingpong-tournaments");

    if (saved) {
      return JSON.parse(saved);
    }

    return [
      {
        id: 1,
        name: "Torneo Apertura",
        champion: "Pareja A",
        teams: ["Pareja A", "Pareja B", "Pareja C"],
        matches: [
          { home: "Pareja A", away: "Pareja B", homeSets: 3, awaySets: 1 },
          { home: "Pareja A", away: "Pareja C", homeSets: 3, awaySets: 2 },
          { home: "Pareja B", away: "Pareja C", homeSets: 3, awaySets: 0 },
        ],
      },
    ];
  });

  const [selectedTournament, setSelectedTournament] = useState(0);

  useEffect(() => {
    localStorage.setItem(
      "pingpong-tournaments",
      JSON.stringify(tournaments)
    );
  }, [tournaments]);

  const currentTournament = tournaments[selectedTournament];

  const standings = useMemo(() => {
    return currentTournament.teams
      .map((team) => {
        let played = 0;
        let won = 0;
        let lost = 0;
        let setsWon = 0;
        let setsLost = 0;

        currentTournament.matches.forEach((match) => {
          if (match.home === team || match.away === team) {
            played++;

            const isHome = match.home === team;
            const mySets = isHome ? match.homeSets : match.awaySets;
            const rivalSets = isHome ? match.awaySets : match.homeSets;

            setsWon += mySets;
            setsLost += rivalSets;

            if (mySets > rivalSets) {
              won++;
            } else {
              lost++;
            }
          }
        });

        return {
          team,
          played,
          won,
          lost,
          diff: setsWon - setsLost,
          sets: `${setsWon}-${setsLost}`,
          points: won * 2,
        };
      })
      .sort((a, b) => b.points - a.points || b.diff - a.diff);
  }, [currentTournament]);

  const h2hStats = useMemo(() => {
    const stats = {};

    tournaments.forEach((tournament) => {
      tournament.matches.forEach((match) => {
        const key = [match.home, match.away].sort().join(" vs ");

        if (!stats[key]) {
          stats[key] = {
            teams: key,
            winsA: 0,
            winsB: 0,
          };
        }

        const sortedTeams = [match.home, match.away].sort();
        const winner =
          match.homeSets > match.awaySets ? match.home : match.away;

        if (winner === sortedTeams[0]) {
          stats[key].winsA++;
        } else {
          stats[key].winsB++;
        }
      });
    });

    return Object.values(stats);
  }, [tournaments]);

  const createTournament = () => {
    const newTournament = {
      id: Date.now(),
      name: `Torneo ${tournaments.length + 1}`,
      champion: "Pendiente",
      teams: [],
      matches: [],
    };

    setTournaments([...tournaments, newTournament]);
    setSelectedTournament(tournaments.length);
  };

  const addTeam = () => {
    if (!newTeam.trim()) return;

    const updated = [...tournaments];

    updated[selectedTournament].teams.push(newTeam);

    setTournaments(updated);
    setNewTeam("");
  };

  const addMatch = () => {
    if (!matchForm.home || !matchForm.away) return;
    if (matchForm.home === matchForm.away) return;

    const updated = [...tournaments];

    updated[selectedTournament].matches.push({
      ...matchForm,
      homeSets: Number(matchForm.homeSets),
      awaySets: Number(matchForm.awaySets),
    });

    const currentStandings = standings;

    if (currentStandings[0]) {
      updated[selectedTournament].champion = currentStandings[0].team;
    }

    setTournaments(updated);
  };

  const tabs = [
    { id: "tabla", label: "📊 Tabla" },
    { id: "partidos", label: "🏓 Partidos" },
    { id: "h2h", label: "🔥 H2H" },
    { id: "historial", label: "🏆 Historial" },
    { id: "config", label: "⚙️ Config" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 border-b bg-black text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold">🏓 Ping Pong League</h1>
              <p className="text-gray-300 mt-2">
                Gestión de torneos, resultados y estadísticas
              </p>
            </div>

            <div className="flex gap-3">
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(Number(e.target.value))}
                className="text-black rounded-2xl px-4 py-3"
              >
                {tournaments.map((tournament, idx) => (
                  <option key={tournament.id} value={idx}>
                    {tournament.name}
                  </option>
                ))}
              </select>

              <button
                onClick={createTournament}
                className="bg-white text-black px-5 py-3 rounded-2xl font-semibold"
              >
                + Nuevo torneo
              </button>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto border-b bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-4 border-black bg-white"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === "tabla" && (
            <div>
              <div className="bg-green-100 text-green-800 rounded-2xl p-5 mb-8 inline-block">
                <div className="text-sm font-semibold uppercase tracking-wide">
                  Campeón actual
                </div>
                <div className="text-3xl font-bold mt-1">
                  {standings[0]?.team || "Sin definir"}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-200 text-left">
                      <th className="p-4 rounded-l-2xl">Pareja</th>
                      <th className="p-4">PJ</th>
                      <th className="p-4">PG</th>
                      <th className="p-4">PP</th>
                      <th className="p-4">Sets</th>
                      <th className="p-4">Dif</th>
                      <th className="p-4 rounded-r-2xl">Pts</th>
                    </tr>
                  </thead>

                  <tbody>
                    {standings.map((team, index) => (
                      <tr
                        key={team.team}
                        className={`border-b ${
                          index === 0 ? "bg-yellow-50" : ""
                        }`}
                      >
                        <td className="p-4 font-semibold">{team.team}</td>
                        <td className="p-4">{team.played}</td>
                        <td className="p-4">{team.won}</td>
                        <td className="p-4">{team.lost}</td>
                        <td className="p-4">{team.sets}</td>
                        <td className="p-4">{team.diff}</td>
                        <td className="p-4 font-bold">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "partidos" && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-5">
                  ➕ Cargar resultado
                </h2>

                <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border">
                  <select
                    value={matchForm.home}
                    onChange={(e) =>
                      setMatchForm({ ...matchForm, home: e.target.value })
                    }
                    className="w-full border rounded-2xl px-4 py-3"
                  >
                    <option value="">Seleccionar local</option>
                    {currentTournament.teams.map((team) => (
                      <option key={team}>{team}</option>
                    ))}
                  </select>

                  <select
                    value={matchForm.away}
                    onChange={(e) =>
                      setMatchForm({ ...matchForm, away: e.target.value })
                    }
                    className="w-full border rounded-2xl px-4 py-3"
                  >
                    <option value="">Seleccionar visitante</option>
                    {currentTournament.teams.map((team) => (
                      <option key={team}>{team}</option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={matchForm.homeSets}
                      onChange={(e) =>
                        setMatchForm({
                          ...matchForm,
                          homeSets: e.target.value,
                        })
                      }
                      className="border rounded-2xl px-4 py-3"
                      placeholder="Sets local"
                    />

                    <input
                      type="number"
                      value={matchForm.awaySets}
                      onChange={(e) =>
                        setMatchForm({
                          ...matchForm,
                          awaySets: e.target.value,
                        })
                      }
                      className="border rounded-2xl px-4 py-3"
                      placeholder="Sets visitante"
                    />
                  </div>

                  <button
                    onClick={addMatch}
                    className="w-full bg-black text-white py-3 rounded-2xl font-semibold"
                  >
                    Guardar resultado
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-5">📋 Resultados</h2>

                <div className="space-y-4">
                  {currentTournament.matches.map((match, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border"
                    >
                      <div className="font-semibold">{match.home}</div>
                      <div className="text-xl font-bold">
                        {match.homeSets} - {match.awaySets}
                      </div>
                      <div className="font-semibold">{match.away}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "h2h" && (
            <div className="grid md:grid-cols-2 gap-5">
              {h2hStats.map((item, idx) => {
                const teams = item.teams.split(" vs ");

                return (
                  <div
                    key={idx}
                    className="border rounded-3xl p-6 bg-gray-50"
                  >
                    <div className="font-bold text-lg mb-3">
                      {teams[0]} vs {teams[1]}
                    </div>

                    <div className="flex justify-between text-3xl font-bold">
                      <span>{item.winsA}</span>
                      <span className="text-gray-400">-</span>
                      <span>{item.winsB}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "historial" && (
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between border rounded-3xl p-5"
                >
                  <div>
                    <div className="font-bold text-lg">
                      {tournament.name}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {tournament.matches.length} partidos jugados
                    </div>
                  </div>

                  <div className="text-xl font-bold">
                    🏆 {tournament.champion}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "config" && (
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold mb-5">
                👥 Agregar pareja
              </h2>

              <div className="flex gap-3 mb-8">
                <input
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  placeholder="Nombre de la pareja"
                  className="flex-1 border rounded-2xl px-4 py-3"
                />

                <button
                  onClick={addTeam}
                  className="bg-black text-white px-5 rounded-2xl font-semibold"
                >
                  Agregar
                </button>
              </div>

              <div className="space-y-3">
                {currentTournament.teams.map((team, idx) => (
                  <div
                    key={idx}
                    className="border rounded-2xl p-4 font-semibold bg-gray-50"
                  >
                    {team}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
