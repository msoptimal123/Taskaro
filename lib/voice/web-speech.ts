export function isWebSpeechSupported(): boolean {
  return typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;

export function createWebSpeechRecognizer(opts: {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (err: Error) => void;
}): AnySpeechRecognition {
  const w = window as Window & Record<string, AnySpeechRecognition>;
  const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  const rec: AnySpeechRecognition = new SR();
  rec.lang = 'sl-SI';
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onresult = (e: AnySpeechRecognition) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t; else interim += t;
    }
    if (interim) opts.onPartial(interim);
    if (final) opts.onFinal(final);
  };
  rec.onerror = (e: AnySpeechRecognition) => opts.onError(new Error(e.error));
  return rec;
}
