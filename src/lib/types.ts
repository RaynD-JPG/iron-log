// Shapes matching the database schema in supabase/schema.sql.

export type Exercise = {
  id: string;
  user_id: string;
  name: string;
  machine: string | null;
  muscle_group: string | null;
  created_at: string;
};

export type WorkoutDay = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type DayExercise = {
  id: string;
  user_id: string;
  workout_day_id: string;
  exercise_id: string;
  position: number;
  created_at: string;
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  workout_day_id: string | null;
  performed_at: string;
  notes: string | null;
  created_at: string;
};

export type SetEntry = {
  id: string;
  user_id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  created_at: string;
};

// A day_exercise joined with its exercise details (for display).
export type DayExerciseWithExercise = DayExercise & {
  exercise: Exercise;
};
