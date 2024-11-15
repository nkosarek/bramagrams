import { GamePage } from "@/ui/game/GamePage";

export default async function GamePageRoute(props: { params: Promise<{ gameId: string }> }) {
  const params = await props.params;
  return <GamePage gameId={params.gameId} />;
}
