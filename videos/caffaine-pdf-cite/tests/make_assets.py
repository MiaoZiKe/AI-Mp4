# 影片用圖（public/caffaine-pdf-cite/）：講義第 1、3 頁上半、第 3 頁放大
from PIL import Image
D = "tests/"; P = "../../public/caffaine-pdf-cite/"
Image.open(D + "pg-1.png").crop((60, 170, 735, 470)).save(P + "p1.png")
Image.open(D + "pg-3.png").crop((60, 170, 735, 470)).save(P + "p3.png")
Image.open(D + "pg-3.png").crop((0, 60, 795, 620)).save(P + "p3-lens.png")
Image.open(D + "pg-3.png").crop((60, 225, 725, 539)).resize((960, 453), Image.LANCZOS).save(P + "p3-zoom.png")
