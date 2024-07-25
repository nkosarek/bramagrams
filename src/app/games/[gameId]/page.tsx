import { GamePage } from "@/ui/game/GamePage";

export default function GamePageRoute({ params }: { params: { gameId: string } }) {
  return <GamePage gameId={params.gameId} />;
}
