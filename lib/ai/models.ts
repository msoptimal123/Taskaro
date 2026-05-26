export const MODELS = {
  classifier: 'claude-haiku-4-5',
  reasoning: 'claude-sonnet-4-6',
  vision: 'claude-opus-4-7',
  writing: 'claude-sonnet-4-6',
} as const;

export type ModelTask = keyof typeof MODELS;

export function pickModel(task: ModelTask, hasImages = false): string {
  if (hasImages) return MODELS.vision;
  return MODELS[task];
}
