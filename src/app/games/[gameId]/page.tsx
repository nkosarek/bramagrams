import { GamePage } from "@/ui/game/GamePage";
import { GameClientProvider } from "@/ui/game/useGameClient";

export default async function GamePageRoute(props: {
  params: Promise<{ gameId: string }>;
}) {
  const params = await props.params;
  return (
    <GameClientProvider>
      <GamePage gameId={params.gameId} />
    </GameClientProvider>
  );
}
