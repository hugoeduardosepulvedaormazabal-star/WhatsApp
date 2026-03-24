
export interface DataRow {
  [key: string]: string;
}

export interface Template {
  content: string;
}

export interface AppState {
  data: DataRow[];
  headers: string[];
  template: string;
}
