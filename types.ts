export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number; // timestamp ms
  completedAt?: number; // timestamp ms
}

export interface Notification {
  id: string;
  message: string;
  type: 'positive' | 'negative';
}

export interface DayData {
  day: string; // "Mon", "Tue", ...
  date: string; // "YYYY-MM-DD"
  completed: number;
}
