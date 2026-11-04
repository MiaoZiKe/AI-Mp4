"""0.4 s transition: a diagonal gold band sweeps across; the new scene is revealed behind it.
Both scenes are rendered and overlap the whole time (no black / repeated frames)."""
import numpy as np
from common import H, W, ease, grid_xy
GOLD = np.array([0.961, 0.722, 0.255], np.float32)

def apply(A, B, k):
    xx, yy = grid_xy()
    u = xx + (H - yy) * 0.35                       # diagonal coordinate
    umax = W + H * 0.35
    pos = ease(k) * (umax + 260) - 130
    reveal = np.clip((pos - u) / 3.0, 0, 1)[..., None]
    band = np.clip(1 - np.abs(u - pos - 40) / 40, 0, 1)[..., None] ** 0.6
    out = A * (1 - reveal) + B * reveal
    return out * (1 - band) + GOLD * band
