export interface User {
  id: string;
  email: string;
  name: string;
  date_of_birth: string;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
}

export interface Partner {
  user_id: string;
  name: string;
  signal_id: string;
}
