import React from 'react';
import { Player, PlayerStatuses } from "bramagrams-shared";

const DEFINITELY_EMILY_NAMES: string[] = ['emily', 'ebram'];
const MAYBE_EMILY_NAMES: string[] = ['emmy', 'pusheen'];

export default class WinnerHandler {
  private winners: Player[];
  private losers: Player[];
  private spectators: Player[];

  constructor(private readonly players: Player[]) {
    this.winners = [];
    this.losers = [];
    this.spectators = [];
    let maxWords = -1;
    players.forEach(player => {
      if (player.status === PlayerStatuses.SPECTATING) {
        this.spectators.push(player);
      } else if (player.words.length > maxWords) {
        this.losers = this.losers.concat(this.winners);
        this.winners = [player];
        maxWords = player.words.length;
      } else if (player.words.length === maxWords) {
        this.winners.push(player);
      } else {
        this.losers.push(player);
      }
    });
  }

  get winnersSubtext(): React.ReactNode {
    const emilyMaybeInLosers = this.playersListMaybeContainsAnEmilyName(this.losers);
    if (this.winners.length === 1) {
      const winnerName = this.winners[0].name.toLowerCase();
      const winnerIsEmilyName = this.isAnEmilyName(winnerName);
      const winnerMaybeIsEmilyName = this.isMaybeAnEmilyName(winnerName);
      const emilyMaybeInSpectators = this.playersListMaybeContainsAnEmilyName(this.spectators);
      // She won
      if (winnerIsEmilyName && !emilyMaybeInLosers && !emilyMaybeInSpectators) {
        return "Of course she did. She always does...";
      // She probably won
      } else if (winnerMaybeIsEmilyName && !emilyMaybeInLosers && !emilyMaybeInSpectators) {
        if (/not\s*emily/.test(winnerName)) {
          return `Yay! Finally the winner is ${this.winners[0].name}!`;
        }
        return "Is that Emily? Shocker.";
      // She probably lost
      } else if (!winnerMaybeIsEmilyName && emilyMaybeInLosers) {
        return `Whoa you beat Emily? Amazing job ${this.winners[0].name}!`;
      }
    } else {
      const emilyInWinners = this.playersListContainsAnEmilyName(this.winners);
      const emilyMaybeInWinners = this.playersListMaybeContainsAnEmilyName(this.winners);
      // She tied
      if (emilyInWinners) {
        return "Ooooo so close...";
      // She probably tied
      } else if (emilyMaybeInWinners) {
        return (
          <>Do I spy Emily in a <em>tie</em>?</>
        );
      // She probably lost
      } else if (emilyMaybeInLosers) {
        return "Whoa you beat Emily? Excellent job all of you!";
      }
    }
    return null;
  }

  get winnersString() {
    if (this.winners.length === 1) {
      return `${this.winners[0].name} wins!`;
    } else {
      return this.winners.reduce((msg, { name: winner }, i) => {
        if (!i) {
          return msg + winner;
        } else if (i === this.winners.length - 1) {
          return msg + `${this.winners.length > 2 ? ',' : ''} and ${winner} tied!`;
        } else {
          return msg + `, ${winner}`;
        }
      }, '');
    };
  }

  private isAnEmilyName(name: string): boolean {
    return DEFINITELY_EMILY_NAMES.includes(name);
  }

  private isMaybeAnEmilyName(name: string) {
    return MAYBE_EMILY_NAMES.includes(name) ||
      DEFINITELY_EMILY_NAMES.some(emilyName => name.includes(emilyName)) ||
      MAYBE_EMILY_NAMES.some(emilyName => name.includes(emilyName));
  }

  private playersListContainsAnEmilyName(players: Player[]) {
    return players.some(({ name }) => this.isAnEmilyName(name.toLowerCase()));
  }

  private playersListMaybeContainsAnEmilyName(players: Player[]) {
    return players.some(({ name }) => this.isMaybeAnEmilyName(name.toLowerCase()));
  }
}
