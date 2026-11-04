"""Offline Mandarin TTS fallback: zhtts (FastSpeech2 + MB-MelGAN, MIT) run on tensorflow-cpu's TFLite.
Used only because edge-tts (speech.platform.bing.com) is not reachable from this sandbox.
The FastSpeech2 graph is patched by patch_tts_model.py to drop two Flex RandomUniform dropout ops."""
import os
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
import warnings; warnings.filterwarnings("ignore")
from pathlib import Path
import numpy as np
import tensorflow as tf
from zhtts.tts import TTS as _TTS, split_sens, ASSET_DIR
from zhtts.tensorflow_tts.processor import BakerProcessor

PATCHED = Path(__file__).resolve().parent.parent / "assets" / "fastspeech2_noflex.tflite"

class OfflineTTS(_TTS):
    def __init__(self, speed=1.0, f0=1.0, energy=1.0):
        self.sample_rate = 24000
        self.processor = BakerProcessor(data_dir=None, loaded_mapper_path=ASSET_DIR / "baker_mapper.json")
        self.text2mel_name = "FASTSPEECH2"
        self.acoustic = tf.lite.Interpreter(model_path=str(PATCHED))
        self.vocoder = tf.lite.Interpreter(model_path=str(ASSET_DIR / "mb_melgan.tflite"))
        self.speed, self.f0, self.energy = speed, f0, energy

    def prepare_input(self, input_ids):
        ids = np.expand_dims(np.array(input_ids, np.int32), 0)
        return (ids, np.array([0], np.int32), np.array([self.speed], np.float32),
                np.array([self.f0], np.float32), np.array([self.energy], np.float32))

    def synth(self, text, pause=0.16, comma_pause=0.08):
        out = []
        parts = split_sens(text)
        for i, t in enumerate(parts):
            a = self.mel2audio(self.text2mel(t)).astype(np.float32)
            out.append(a)
            if i < len(parts) - 1:
                out.append(np.zeros(int((pause if t[-1] in "。！？" else comma_pause) * self.sample_rate), np.float32))
        return np.concatenate(out), self.sample_rate
