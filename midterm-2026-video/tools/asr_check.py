"""Transcribe each narration segment with an offline Paraformer model to sanity-check TTS pronunciation."""
import json, os, sherpa_onnx, soundfile as sf, numpy as np
from scipy.signal import resample_poly
M = os.environ.get('ASR_DIR', '/tmp/claude-0/tts/sherpa-onnx-paraformer-zh-small-2024-03-09/')
rec = sherpa_onnx.OfflineRecognizer.from_paraformer(paraformer=M + 'model.int8.onnx', tokens=M + 'tokens.txt', num_threads=2)
s = json.load(open('script.json'))
for x in json.load(open('audio/segments.json')):
    a, sr = sf.read(x['file']); a = resample_poly(a, 16000, sr).astype(np.float32)
    st = rec.create_stream(); st.accept_waveform(16000, a); rec.decode_stream(st)
    print(f"s{x['scene']}_{x['seg']} | {s['scenes'][x['scene']]['segments'][x['seg']]['tts']} | ASR: {st.result.text}")
