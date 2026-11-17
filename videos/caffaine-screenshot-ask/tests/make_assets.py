# 把自製示意截圖做成影片用的圖（public/caffaine-screenshot-ask/）
from PIL import Image, ImageDraw
D = "tests/"; P = "../../public/caffaine-screenshot-ask/"
big = Image.open(D + "screen.png")                      # 1080x1920
big.resize((540, 960), Image.LANCZOS).save(P + "screen.png")
big.crop((48, 232, 1032, 703)).resize((960, 460), Image.LANCZOS).save(P + "zoom.png")          # 錯誤橫幅放大
Image.open(D + "screen-small.png").resize((540, 960), Image.NEAREST).save(P + "small-up.png")   # 135x240 放大回來，看得出有多糊
Image.open(D + "screen-cropped.png").resize((540, 640), Image.LANCZOS).save(P + "cropped.png")  # 截一半
print("ok")
