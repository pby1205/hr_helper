
export interface Participant {
  id: string;
  name: string;
}

export interface DrawResult {
  timestamp: number;
  winner: Participant;
  prizeName: string;
}

export interface Group {
  id: string;
  name: string;
  members: Participant[];
}

export enum AppTab {
  Roster = 'ROSTER',
  LuckyDraw = 'LUCKY_DRAW',
  Grouping = 'GROUPING'
}
