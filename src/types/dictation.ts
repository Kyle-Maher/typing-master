export interface DictationPassage {
  id: string;
  title: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
