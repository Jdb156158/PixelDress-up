# 像素素材记录

素材使用内置 `image_gen.imagegen` 生成，参考用户提供的五张游戏界面。图片已复制进仓库，运行时无需生成服务。没有直接使用参考界面截图充当游戏页面。

| 素材 | 项目文件 | 用途 |
| --- | --- | --- |
| 粉色装扮房间 | `dist/assets/dressing-room.png` | 装扮场景背景 |
| 四套人物图集 | `dist/assets/characters.png` | Canvas 人物及衣橱缩略图 |
| 家园空房间 | `dist/assets/home-room.png` | 家园背景 |
| 八类家具透明图集 | `dist/assets/furniture.png` | 家具仓库、拖动布置 |

人物与家具保留原始透明度，通过 SVG 裁剪视口和 Canvas 分层处理展示。UI 图标、合成小物和包裹使用项目内的 SVG 代码绘制。

## 最终生成提示词

### 装扮房间

Use case: stylized-concept. Asset type: pixel art room game background. Create a beautiful square 1536x1536 detailed pixel-art pink princess dressing room inspired by the provided reference image (style reference only). NO character and NO UI/text/buttons. Central area EMPTY for a doll. Scene: soft blush striped walls, sunny central window with rose curtains, ornate full length ivory/gold mirror on left, flower pots at far left, tiny white kitten by mirror, clothes rail/wardrobe with pink dresses on right, small pink ottoman right, cream circular heart rug on floor at bottom center. Front view slight room perspective. Crisp tiny square pixel edges like high quality cozy 16-bit game artwork, warm cream and pale pink, burgundy outlines, soft sunlight. Fill full canvas edge to edge. No watermarks, no lettering. Keep center especially empty.

### 人物图集

Use case: stylized-concept. Asset type: transparent pixel-art dress-up game sprite atlas. The attached image is style reference only. Create a transparent background rectangular sprite sheet of EXACTLY 4 full-body adorable chibi pixel-art girls, side by side in one horizontal row, each separated by generous transparent space, identical pose/scale and face, entire bodies including shoes visible. Crisp 16-bit pixel art, burgundy pixel outlines. Each character big round head occupying half height, huge burgundy sparkling eyes, fair skin, rosy cheeks, small smile, arms at sides diagonally outward, standing forward. Girl 1 short pink bob with white bow, cream/pink frilly heart lolita dress big pink neck ribbon, white ruffle socks, pink mary janes. Girl 2 same pink bob and bow with cream cardigan pink ribbon and pleated skirt. Girl 3 same bob and bow with pale blue sailor dress navy ribbon. Girl 4 same bob and bow with black gothic lolita dress pink ribbons and black shoes. Beautiful polished cute pixel doll as reference. No furniture, floor, shadow, rug, text, labels, borders. Exactly FOUR uniformly spaced characters across full sheet, each on transparent background.

### 家园背景

Use case: stylized-concept. Asset type: pixel-art game room empty background. Square 1536x1536. Cozy pink bedroom in the style of provided reference, 16-bit detailed crisp pixel art, warm wood floor, blush striped floral wallpaper, large central window with gingham pink curtains tied by bows, blue sky and lush green trees outside. Upper left little wall shelf with trailing plant, far right tall wooden bookcase filled with books, cats and plants. Far left cream chest with bunny plush and potted plant. Leave FLOOR in bottom 45 percent mostly EMPTY for interactive furniture placement, no sofa, no desk, no floor lamp, no rug, no characters. Symmetrical front-facing dollhouse perspective, soft golden sun. No UI, text, numbers, watermarks or border. Delicate cream highlights and deep reddish brown pixel outlines.

### 家具图集

Use case: stylized-concept. Asset type: sprite atlas for cozy pixel dress-up game. Create a 4 column by 2 row sprite sheet, EXACTLY 8 isolated furniture objects uniformly centered inside equal square cells on transparent background, generous empty margins so none touch. Pixel art 16-bit detailed cute small square pixels, reddish brown outlines, warm cream pink and green palette. Row1 left to right: light BLUE two-seat couch with pink gingham cushion; warm wooden desk with pink upholstered wooden chair; oval mint green daisy flower rug; gold frame pink tulip wall picture. Row2 left to right: cream drawer chest with books and small pot; golden floor lamp with cream floral shade; lush green plant in white pot with pink bow; hanging ribbon pink heart macrame wall ornament. Isometric slight front view consistent with cozy dollhouse room. Every object complete unclipped, no overlapping objects, no writing, no grid lines, no character, no floor. Transparent background.
### 八款长发（2026-10-19）

模式：内置 `image_gen.imagegen`，透明背景；`characters.png` 仅作像素画风和头型比例参考。以下八份素材复制到 `dist/assets/`，保留生成的 Alpha。人物使用原有前发、脸和蝴蝶结，加上独立长发后层和垂在衣服前的发尾；发型预览、装扮、家园和 PNG 共用素材。

公共提示词：

Use case: stylized-concept. Asset type: a single transparent pixel-art wig sprite for a browser dress-up game. Input image: reference ONLY for chibi head proportions, pixel technique and cute outline style. Generate ONE HAIR-ONLY wig with no human, no face, no skin, no eyes, no body, no clothes. Front view perfectly centered, opaque hair with a large genuinely transparent oval face opening in the middle, soft straight fringe above that opening. The rounded head is oversized chibi, head width about 65% of the full sprite width; crown starts near top; face opening spans 34% of sprite width between y26% and y49%; long hair drops down both sides to y94%. Pixel-art stepped edges, tiny pixel highlights, dark colored outline, clear separated strands. Match the reference hand-drawn pastel pixel shading. Entire hairstyle visible with generous transparent padding, no clipping, no labels, no background, no checkerboard pattern, actual alpha transparency. No white bow on the head because the game adds that accessory separately. Style requested:

- `dist/assets/long-straight.png`：腰长的柔顺长直发，末端整齐但轻柔分束，樱花粉
- `dist/assets/long-waves.png`：腰长的大波浪长发，两侧宽大的 S 形波浪，奶茶棕
- `dist/assets/long-twin-tails.png`：两束蓬松及腰长双马尾，浅雾蓝灰
- `dist/assets/long-side-braid.png`：侧编长发，一条粗粗的长麻花辫垂在画面右侧，薄荷青绿
- `dist/assets/long-curls.png`：蓬松及腰长卷发，发尾明显的螺旋卷，浅薰衣草紫
- `dist/assets/long-twin-braids.png`：两条长麻花辫分垂两侧，小蝴蝶结收尾，蜂蜜金
- `dist/assets/long-high-pony.png`：高高扎起的长马尾，长发从头顶向画面左侧弯落到腰部，玫瑰红
- `dist/assets/long-princess.png`：半扎公主长发，上方细编辫环绕，两侧流畅的长波浪，栗子棕
