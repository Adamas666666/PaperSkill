import type { TutorialData } from '../types';

// ============================================================================
//  RESNET 教程数据 — Deep Residual Learning for Image Recognition
//  统一隐喻：登山攀岩（Mountain Climbing）
//  每章的 analogy/module componentId 都必须在 ../modules/registry.tsx 注册。
// ============================================================================

export const tutorial: TutorialData = {
  meta: {
    titleEn: 'Deep Residual Learning for Image Recognition',
    titleZh: '深度残差学习用于图像识别（ResNet）',
    venue: 'arXiv 1512.03385 · ILSVRC 2015 冠军 · CVPR 2016 最佳论文',
    authors: 'Kaiming He · Xiangyu Zhang · Shaoqing Ren · Jian Sun',
    affiliation: 'Microsoft Research',
    domain: '计算机视觉 · 图像分类 · 卷积神经网络',
    coreProblem: '深层网络出现"退化问题"：网络越深，训练误差反而越高，且并非过拟合所致。',
    coreInsight:
      '把堆叠层改为拟合残差映射 <b>F(x) = H(x) − x</b>，原始映射变为 <b>F(x) + x</b>；恒等快捷连接不增加任何参数，使上百层网络首次能稳定训练并获得精度增益。',
    keywords: ['残差学习', '恒等快捷连接', '退化问题', '深度卷积网络'],
  },
  hero: {
    oldMethod: {
      desc: '直接堆叠层去学 <b>H(x)</b>：越深越难训练，出现<b>退化问题</b>',
      figure: undefined,
      componentId: 'heroPlain',
    },
    newMethod: {
      desc: '学残差 <b>F(x) = H(x) − x</b>：从当前岩点微调，<b>深度首次可用</b>',
      figure: undefined,
      componentId: 'heroResnet',
    },
  },
  chapters: [
    {
      kind: 'chapter',
      id: 'chap-1',
      title: '越深越好吗：退化问题',
      badge: 'inf',
      badgeLabel: '基础',
      bridge:
        '深度学习已经证明<b>更深的网络能学更丰富的特征</b>。但当你真的把网络加到很深，会发现它反而"训练不动"了——这是本教程要解决的第一个矛盾。',
      analogy: {
        title: '越陡的山，越难爬',
        text: '想看得更远就要爬得更高，但<b>山坡太陡</b>时，每一步都更难，甚至还不如在半山腰走得稳。深层网络遇到的就是这样的"陡坡"。',
        componentId: 'anaSteep',
      },
      modules: [
        {
          kind: 'module',
          id: '1.1',
          title: '拖一拖"网络深度"，感受退化',
          desc: '用滑块把网络从 20 层加到 56 层（CIFAR-10 上的 plain 网络），观察<b>训练误差</b>的变化——这正是论文 Fig.1 展示的现象：更深的网络反而训练误差更高。',
          componentId: 'modDegrad',
        },
      ],
      insight:
        '加更多层本应更强，但当前求解器连"把层变成恒等映射"都学不到——网络不是变笨了，而是<b>优化变难了</b>。',
      formula: {
        lead: '如果堆叠层真的能拟合任意函数 H(x)，那为什么连"什么都不做"的恒等映射都学不好？',
        unicode: '目标：H(x)　直接堆叠层去拟合 H(x)',
        symbols: [
          { sym: 'H(x)', desc: '我们希望学到的理想映射（例如：把图片正确分类）' },
          { sym: 'x', desc: '这一层的输入' },
        ],
      },
      takeaways: [
        { icon: '🎯', title: '深度很重要', desc: '更深的网络能学更丰富的特征，但深度本身带来优化困难。' },
        { icon: '🔧', title: '退化≠过拟合', desc: '56 层的训练误差高于 20 层，问题出在"训练不动"而非"测试变差"。' },
        { icon: '✨', title: '矛盾的解法', desc: '如果加上的层能退化成"什么都不做"，深层网络至少不比浅层差——残差学习的起点。' },
      ],
    },
    {
      kind: 'chapter',
      id: 'chap-2',
      title: '层层入胜：从像素到语义',
      badge: 'inf',
      badgeLabel: '基础',
      bridge:
        '上一章我们看到了"深度的代价"。那深度的<b>价值</b>到底是什么？答案藏在每一层看到的不同"风景"里。',
      analogy: {
        title: '站得越高，看得越全',
        text: '山脚下只能看到一棵树的纹理，半山腰能看到整片树林，山顶能看到整座山脉——<b>网络越深，看到的东西越抽象、越全局</b>。',
        componentId: 'anaView',
      },
      modules: [
        {
          kind: 'module',
          id: '2.1',
          title: '点一点观景台，看看每层"看到什么"',
          desc: '点击 3 个海拔位点（<b>浅层 / 中层 / 深层</b>），右侧 inset 展示对应的特征：边缘纹理 → 局部形状 → 语义部件，呼应论文"低/中/高级特征"的表述。',
          componentId: 'modView',
        },
      ],
      formula: {
        lead: '无需新公式：感受野随层数线性扩大，是深度带来语义抽象的直接原因。',
        unicode: '感受野：5px → 11px → 23px',
        symbols: [
          { sym: '5px', desc: '浅层卷积的感受野，只看得到局部边缘' },
          { sym: '23px', desc: '深层卷积的感受野，能看到完整物体轮廓' },
        ],
      },
      takeaways: [
        { icon: '🎯', title: '特征层级', desc: 'CNN 天然从低级特征逐层构建高级语义特征。' },
        { icon: '🔧', title: '深度的价值', desc: '层数越多，"看得越全"的机会越多，分类越准。' },
        { icon: '✨', title: '代价也随之而来', desc: '每加一层都让优化更难——把问题留给下一章。' },
      ],
    },
    {
      kind: 'chapter',
      id: 'chap-3',
      title: '关键洞察：学"差多少"，不学"是多少"',
      badge: 'inf',
      badgeLabel: '基础',
      bridge:
        '网络每层都在"看"，但深了却学不动。何恺明等人的关键洞察是：<b>不要从零学目标，而是站在已有结果上学"差多少"</b>。',
      analogy: {
        title: '站在已有的岩点上，够下一个',
        text: '直接学 H(x) 就像每次都从谷底起跳；学残差 F(x) 就像<b>站在当前岩点上，只需补上"差的那一点"</b>——目标没变，起点变了。',
        componentId: 'anaJump',
      },
      modules: [
        {
          kind: 'module',
          id: '3.1',
          title: '两种起步：按开始，看差别',
          desc: '一个共享「开始对比」按钮启动同步对比：左栏"直接学 <b>H(x)</b>"的登山者从谷底反复起跳够目标，右栏"学残差 <b>F(x)</b>"的登山者从当前岩点稳步上移；两者在同一时间轴推进。',
          componentId: 'modInsight',
        },
      ],
      insight:
        '当恒等映射已经够好时，网络只需把残差推向 0——这比从零拟合一个复杂函数容易得多。',
      formula: {
        lead: '论文把期望映射重写为"残差 + 输入"：',
        unicode: 'F(x) := H(x) − x　⇒　H(x) = F(x) + x',
        symbols: [
          { sym: 'H(x)', desc: '理想映射（分类等目标输出）' },
          { sym: 'F(x)', desc: '堆叠层要学的残差（差了多少）' },
          { sym: 'x', desc: '块的输入（当前岩点）' },
        ],
      },
      takeaways: [
        { icon: '🎯', title: '目标重述', desc: '学 H(x) ⇔ 学 F(x) 再加回 x，本质是改变学习的起点。' },
        { icon: '🔧', title: '恒等最优场景', desc: '若输入已接近目标，残差推向 0 即可，比学恒等映射容易得多。' },
        { icon: '✨', title: '预条件作用', desc: '即使恒等不是最优，从恒等附近出发也让求解器更容易找到解。' },
      ],
    },
    {
      kind: 'chapter',
      id: 'chap-4',
      title: '残差块：y = F(x) + x',
      badge: 'both',
      badgeLabel: '通用',
      bridge:
        '洞察有了，怎么把它变成可训练的网络结构？答案是一个极简的数学形式——<b>残差块</b>，它只比普通卷积多一次加法。',
      analogy: {
        title: '当前点 + 一小步 = 到达',
        text: '残差块就是：<b>输出 = 输入 x + 残差 F(x)</b>。登山者站在 x 上，补上 F 这一小段，就站到了 y。',
        componentId: 'anaReach',
      },
      modules: [
        {
          kind: 'module',
          id: '4.1',
          title: '拖动"残差幅度"，看 y 如何变化',
          desc: '拖动数轴上的把手改变残差 <b>F</b> 的大小（x 固定），观察 <b>y = x + F</b> 在数轴上的位置与右侧数学视图的联动——F = 0 时就是恒等映射。',
          componentId: 'modAdd',
        },
      ],
      formula: {
        lead: '论文式 (1)，残差块的核心：',
        unicode: 'y = F(x, {Wᵢ}) + x',
        symbols: [
          { sym: 'y', desc: '残差块的输出' },
          { sym: 'x', desc: '残差块的输入（与 y 同维度）' },
          { sym: 'F', desc: '堆叠层学到的残差映射' },
          { sym: 'Wᵢ', desc: '第 i 个卷积层的权重' },
        ],
      },
      takeaways: [
        { icon: '🎯', title: '加法而非拼接', desc: 'F 与 x 逐元素相加，因此输入输出维度必须一致。' },
        { icon: '🔧', title: '零成本捷径', desc: '恒等快捷连接不增加任何参数和计算量，只是多一次加法。' },
        { icon: '✨', title: '全网络可微', desc: '残差块保证梯度能沿捷径直达浅层，缓解梯度消失。' },
      ],
    },
    {
      kind: 'chapter',
      id: 'chap-5',
      title: '捷径的三种选择：恒等 vs 投影',
      badge: 'both',
      badgeLabel: '通用',
      bridge:
        '残差块要求输入输出同维度。但网络变深时维度会变化（如 64→128 通道）——这时候捷径该怎么接？论文用消融实验回答。',
      analogy: {
        title: '间距不同，装备不同',
        text: '维度相同时，恒等捷径徒手就能走（A）；维度变大时，需要 1×1 卷积投影来"挂个绳"（B/C）。论文发现：<b>多数时候徒手（A/B）就够了</b>。',
        componentId: 'anaGear',
      },
      modules: [
        {
          kind: 'module',
          id: '5.1',
          title: '切换 A/B/C 三种捷径，看精度与开销',
          desc: '三种芯片对应论文 Table 3 的 <b>A（零填充）/ B（仅维度变化处投影）/ C（全部投影）</b>；切换后更新 ImageNet 34 层验证误差与参数量对比。',
          componentId: 'modShortcut',
        },
      ],
      formula: {
        lead: '维度不一致时，论文式 (2) 用投影捷径匹配：',
        unicode: 'y = F(x, {Wᵢ}) + Wₛ·x',
        symbols: [
          { sym: 'Wₛ', desc: '投影矩阵（1×1 卷积），把 x 的维度匹配到 F 的输出维度' },
          { sym: 'y', desc: '残差块的输出' },
          { sym: 'x', desc: '输入' },
        ],
      },
      takeaways: [
        { icon: '🎯', title: '方案对比', desc: 'A 零填充、B 仅投影升维处、C 全投影；三者都大幅优于 plain。' },
        { icon: '🔧', title: '经济结论', desc: '恒等捷径已足够解决退化，投影只在维度变化时用（B 方案）。' },
        { icon: '✨', title: '工程取舍', desc: 'C 的 0.3% 增益要以翻倍参数为代价，不值——论文明确不用 C。' },
      ],
    },
    {
      kind: 'chapter',
      id: 'chap-6',
      title: '数据的前向之旅',
      badge: 'inf',
      badgeLabel: '基础',
      bridge:
        '残差块是"积木"，那整栋"楼"长什么样？本章沿一条固定路线，一步步看一张图片如何流过 ResNet-34 的主干。',
      analogy: {
        title: '一条路，五段路标',
        text: '数据就像登山者，沿固定路线前进：<b>每次跨过一段，视野变宽、行囊变重</b>——特征图尺寸减半、通道数翻倍。',
        componentId: 'anaTrail',
      },
      modules: [
        {
          kind: 'module',
          id: '6.1',
          title: '一步一步，看数据怎么走完主干',
          desc: '用「上一步 / 下一步」步进 5 个阶段（<b>conv1+pool → conv2_x → conv3_x → conv4_x → conv5_x+head</b>），每步显示当前特征图尺寸与通道数。',
          componentId: 'modForward',
        },
      ],
      formula: {
        lead: '无需新公式：用步进观察比公式更直观。感受野与下采样节奏（每过一段尺寸减半）是本节重点。',
        unicode: '224² → 112² → 56² → 28² → 14² → 7²',
        symbols: [
          { sym: '224²', desc: '输入图像尺寸（224×224）' },
          { sym: '7²', desc: 'conv5_x 输出的特征图尺寸（7×7）' },
        ],
      },
      takeaways: [
        { icon: '🎯', title: '主干节奏', desc: 'conv1 → conv2_x..conv5_x → 池化+全连接，尺寸逐段减半。' },
        { icon: '🔧', title: '维度翻倍', desc: '特征图减半时通道翻倍，保持计算量稳定，这也是 VGG 的设计哲学。' },
        { icon: '✨', title: '捷径贯穿', desc: '残差块堆叠在每个 stage 内，维度变化处用投影捷径衔接。' },
      ],
    },
    {
      kind: 'chapter',
      id: 'chap-7',
      title: '训练：节奏对了才走得远',
      badge: 'trn',
      badgeLabel: '训练',
      bridge:
        '结构对了还不够。ResNet 的训练配方里有一个和深度同样关键的旋钮——<b>学习率</b>。它就像登山者的步幅：太大摔跤，太小磨蹭。',
      analogy: {
        title: '步子太大容易摔',
        text: '学习率就像步幅：<b>太小走得慢（收敛慢），太大一步跨空（发散）</b>。论文从 0.1 起步，误差平台期就除以 10。',
        componentId: 'anaStride',
      },
      modules: [
        {
          kind: 'module',
          id: '7.1',
          title: '调学习率，看损失曲线"摔不摔跤"',
          desc: '调节学习率（对数刻度），左侧登山者步幅随之变化，右侧损失曲线实时响应：<b>过小缓慢下降、适中快速收敛、过大震荡发散</b>。',
          componentId: 'modLR',
        },
      ],
      insight:
        '深度 + 合理的学习率节奏 + BN 稳定分布，三者一起才让 152 层网络第一次可行。',
      formula: {
        lead: 'SGD 更新规则（动量隐含在优化器中）：',
        unicode: 'θ ← θ − η · ∇L(θ)',
        symbols: [
          { sym: 'θ', desc: '网络全部权重（山路上每个岩点的位置）' },
          { sym: 'η', desc: '学习率（步幅大小）' },
          { sym: '∇L', desc: '损失关于权重的梯度（上坡方向）' },
        ],
      },
      takeaways: [
        { icon: '🎯', title: '训练配方', desc: 'SGD+momentum 0.9、batch 256、wd 0.0001、lr 0.1 每平台期 ÷10。' },
        { icon: '🔧', title: 'BN 是关键基础', desc: '批归一化让信号分布稳定，网络才能"开始收敛"，暴露退化问题。' },
        { icon: '✨', title: '无 dropout', desc: '论文刻意不用 dropout，靠深度与 BN 作为正则——聚焦优化本身。' },
      ],
    },
    {
      kind: 'chapter',
      id: 'chap-8',
      title: 'ResNet 的架构地图',
      badge: 'trn',
      badgeLabel: '训练',
      bridge:
        '现在把所有概念组装起来：这张路线图就是 ResNet-34 的完整架构。点击地图上的任何营地，看它负责什么。',
      analogy: {
        title: '一张路线图，四个营地',
        text: 'ResNet-34 就像一条固定路线：<b>四个营地（stage）逐级爬升，营地间用绳索（捷径）相连</b>，最后在峰顶汇合输出。',
        componentId: 'anaMap',
      },
      modules: [
        {
          kind: 'module',
          id: '8.1',
          title: '点击营地图上的任意组件',
          desc: '点击架构图上的 6 个热区（<b>conv1、conv2_x、conv3_x、conv4_x、conv5_x、head</b>），下方固定信息区显示该组件作用、输出尺寸、块数与参数量；点击组件即时高亮并更新激活路径。',
          componentId: 'modArch',
        },
        {
          kind: 'module',
          id: '8.2',
          title: '从 18 到 152 层，深度换来什么',
          desc: '四种芯片（<b>18 / 34 / 50 / 152 层</b>）切换，展示对应验证误差（top-1）与计算量（GFLOPs），用误差条直观对比——残差学习让深度从负担变成资产。',
          componentId: 'modDepth',
        },
      ],
      formula: {
        lead: '无需新公式：深度变体的收益用数据说话（论文 Table 3/4）。',
        unicode: 'ResNet-152: top-1 21.43% · top-5 5.71%',
        symbols: [
          { sym: '21.43%', desc: 'ResNet-152 在 ImageNet 验证集上的 top-1 误差' },
          { sym: '5.71%', desc: 'ResNet-152 在 ImageNet 验证集上的 top-5 误差' },
        ],
      },
      takeaways: [
        { icon: '🎯', title: '架构模板', desc: 'conv1 → conv2_x..conv5_x → avgpool → fc，残差块堆叠，维度变化处投影。' },
        { icon: '🔧', title: '深度红利', desc: '18→152 层误差持续下降，深层不再是负担。' },
        { icon: '✨', title: '计算约束', desc: '152 层（11.3 GFLOPs）仍低于 VGG-19（19.6 GFLOPs），深度不必然意味着贵。' },
      ],
    },
    {
      kind: 'chapter',
      id: 'chap-9',
      title: '瓶颈设计：轻装简行',
      badge: 'trn',
      badgeLabel: '训练',
      bridge:
        '50/101/152 层的深网络为什么"用得起"？因为换了一种更省力的积木——<b>瓶颈块（bottleneck）</b>。',
      analogy: {
        title: '窄缝面前，先收背包',
        text: 'bottleneck 块就像过窄岩缝：<b>先用 1×1 把特征压缩（降维），穿过 3×3，再 1×1 恢复（升维）</b>——省下的力气就是省下的参数量。',
        componentId: 'anaPack',
      },
      modules: [
        {
          kind: 'module',
          id: '9.1',
          title: '对比两种块，看看省了多少',
          desc: '芯片切换「<b>普通块（2×3×3）</b>」与「<b>瓶颈块（1×1-3×3-1×1）</b>」，对比 256 维输入下参数量与结构——3×3 被"挤"进低维瓶颈里，参数省约 17 倍。',
          componentId: 'modBottleneck',
        },
      ],
      formula: {
        lead: '瓶颈块把参数量从 O(C²k²) 压到 O(C² + Ck²) 量级；恒等捷径在瓶颈里尤为重要——若换投影捷径，连接两个高维端会让复杂度翻倍。',
        unicode: '256→64→64→256  (1×1, 3×3, 1×1)',
        symbols: [
          { sym: '256', desc: '输入与输出的通道数（高维端）' },
          { sym: '64', desc: '瓶颈处的通道数（低维）' },
        ],
      },
      takeaways: [
        { icon: '🎯', title: '结构', desc: '1×1 降维 → 3×3 → 1×1 升维，3×3 在低维瓶颈中计算。' },
        { icon: '🔧', title: '参数节约', desc: '256 维输入下瓶颈块约省 17 倍参数，深网络因此可行。' },
        { icon: '✨', title: '捷径配合', desc: '恒等捷径连接高维端不增加成本；换投影捷径则开销翻倍。' },
      ],
    },
    {
      kind: 'chapter',
      id: 'chap-10',
      title: '登顶：结果、泛化与边界',
      badge: 'both',
      badgeLabel: '通用',
      bridge:
        '终点站。用一场"登顶竞赛"回顾 ResNet 在 ImageNet 上的战绩，也用精确的数字保留结论；最后诚实地说说它的边界。',
      analogy: {
        title: '谁先登顶？',
        text: '同样的山峰（ImageNet 验证集），<b>更快的攀登者就是更低的误差</b>：VGG-16 27.94%、ResNet-34 25.03%、ResNet-152 21.43%（top-1）。',
        componentId: 'anaRace',
      },
      modules: [
        {
          kind: 'module',
          id: '10.1',
          title: '按开始，看谁先登顶',
          desc: '「开始竞赛」按钮启动三条进度条，从同一基线出发，速度由真实 <b>top-1 误差</b>（越低越快）驱动；结束后展示验证数据表。',
          componentId: 'modRace',
        },
      ],
      formula: {
        lead: '无需新公式：用验证误差表与竞赛可视化保留精确数值。',
        unicode: '集成 3.57% top-5  →  ILSVRC 2015 冠军',
        symbols: [
          { sym: '3.57%', desc: '6 模型集成在 ImageNet 测试集上的 top-5 误差' },
          { sym: '冠军', desc: 'ILSVRC 2015 图像分类第一名（同时拿下检测/定位/COCO 多项第一）' },
        ],
      },
      takeaways: [
        { icon: '🎯', title: '分类结果', desc: '集成 3.57% top-5 获 ILSVRC 2015 冠军；单模型 152 层 4.49% 超越此前所有集成。' },
        { icon: '🔧', title: '泛化能力', desc: 'COCO 检测 mAP@[.5,.95] 提升 6.0%（28% 相对提升）、PASCAL VOC +3.2%，纯换网络所得。' },
        { icon: '✨', title: '边界与未来', desc: '1202 层在 CIFAR-10 可训练（训练误差<0.1%）但测试误差 7.93% 差于 110 层——过拟合是深度不是无限的。' },
      ],
    },
  ],
  bilibili: [
    {
      bvid: 'BV1P3411y7nn',
      title: 'ResNet 论文逐段精读【论文精读】',
      reason: '李沐的逐段精读，系统梳理论文动机、方法与实验，最适合整体入门。',
      cover: 'https://i2.hdslb.com/bfs/archive/b98073de7239d08b965bb65d5198e88a6212c90c.jpg',
      views: '39.2万播放',
    },
    {
      bvid: 'BV1T7411T7wa',
      title: '6.1 ResNet网络结构，BN以及迁移学习详解',
      reason: '霹雳吧啦Wz 的结构详解，把残差块、BN 与迁移学习讲得很清楚。',
      cover: 'https://i0.hdslb.com/bfs/archive/1d2d1580a8992fe2c17710cf9b7b79717709cb66.jpg',
      views: '29.7万播放',
    },
    {
      bvid: 'BV14E411H7Uw',
      title: '6.2 使用pytorch搭建ResNet并基于迁移学习训练',
      reason: 'PyTorch 代码实战，从零搭建 ResNet 并用迁移学习训练，适合动手。',
      cover: 'https://i0.hdslb.com/bfs/archive/36ae6431a7031d57c6dd5bc101f2eba4de98a759.jpg',
      views: '27.8万播放',
    },
    {
      bvid: 'BV1vb4y1k7BV',
      title: '【精读AI论文】ResNet深度残差网络',
      reason: '同济子豪兄的精读，含何恺明 CVPR 报告片段，多视角理解。',
      cover: 'https://i2.hdslb.com/bfs/archive/9660f23e996004ae147fa01f256ed0bd6044800f.jpg',
      views: '16.7万播放',
    },
  ],
};
