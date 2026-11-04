"""Remove the two inference-time dropout RandomUniform (Flex) ops from zhtts' FastSpeech2 tflite
so it runs on the builtin TFLite interpreter. Dropout is made a no-op (mask=1, scale=1)."""
import numpy as np, sys
from tensorflow.lite.tools import flatbuffer_utils as fu
src = sys.argv[1]; dst = sys.argv[2]
m = fu.read_model(src)
g = m.subgraphs[0]
name = lambda t: g.tensors[t].name.decode() if isinstance(g.tensors[t].name, bytes) else g.tensors[t].name
codes = m.operatorCodes
def opname(op):
    c = codes[op.opcodeIndex]
    return (c.customCode.decode() if c.customCode else str(c.builtinCode))
def const_buffer(val, tidx):
    from tensorflow.lite.python import schema_py_generated as s
    b = s.BufferT(); b.data = np.frombuffer(np.array(val, np.float32).tobytes(), np.uint8)
    m.buffers.append(b); g.tensors[tidx].buffer = len(m.buffers) - 1
keep = []
for op in g.operators:
    if 'RandomUniform' in opname(op):
        out = op.outputs[0]; print('removing', opname(op), name(out), g.tensors[out].shape)
        const_buffer(np.ones(g.tensors[out].shape, np.float32), out)
    else:
        keep.append(op)
g.operators = keep
# set dropout scale constants (x * 1/(1-rate)) to 1.0
for op in g.operators:
    for t in op.inputs:
        if t >= 0 and 'dropout' in name(t) and g.tensors[t].buffer and m.buffers[g.tensors[t].buffer].data is not None and len(m.buffers[g.tensors[t].buffer].data) == 4:
            v = np.frombuffer(bytes(m.buffers[g.tensors[t].buffer].data), np.float32)[0]
            print('const', name(t), v)
            if name(t).endswith('/Const') or 'Mul/y' in name(t) or 'truediv' in name(t):
                m.buffers[g.tensors[t].buffer].data = np.frombuffer(np.float32(1.0).tobytes(), np.uint8); print('  -> 1.0')
fu.write_model(m, dst)
