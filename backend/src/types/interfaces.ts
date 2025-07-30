export interface AuthUser
{
	id: number;
	login: string;
	alias: string;
	avatar: string;
	last_seen: number;
	email: string;
	clicker_score: bigint;
	clicker_cooler: number;
  	clicker_coil: number;
  	clicker_generator: number;
	tfa_enable: boolean;
	tfa_expires: number;
	tfa_code: string
}

export interface Match {
  id: number;
  date: string;
  duration: number;
  user1_id: number;
  user2_id: number | null;
  winner_id: number | null;
  score: string;
}

export interface Friend {
    id: number;
    login: string;
    email: string;
    alias: string;
    avatar: string;
}

export interface Clicker
{
	id: number;
	date: string;
	game_mode: string,
	target: number;
	user1_id: number;
	user2_id: number;
	winner_id: number | null;
	score: number,
}