export type Scene = {
  id: string;
  narration: string;
  subtitle: { zh: string; en: string };
  keywords: string[];
  component: string;
  props: Record<string, any>;
  sources: string[];
  durationSec?: number;
  sfx?: { t: number; name: string }[];
  [extra: string]: any;
};
export type Script = {
  slug: string;
  title: string;
  asOf: string;
  scenes: Scene[];
  audio?: string | null;
  composition?: { video: string; cover: string };
  [extra: string]: any;
};
