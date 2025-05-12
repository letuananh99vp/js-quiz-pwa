export interface IQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  id: number;
  text: string;
  code?: string;
  options: IQuestionOption[];
  explanation: string;
}
export interface IStatusAnswer {
  correct: number;
  incorrect: number;
}
