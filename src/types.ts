export type Scene = {
  id: string;
  narration: string;
  subtitle: { zh: string; en: string };
  keywords: string[];
  component: string;
  props: Record<string, any>;
  sources: string[];
  durationSec?: number;
};
export type Script = {
  slug: string;
  title: string;
  asOf: string;
  scenes: Scene[];
  audio?: string | null;
};
