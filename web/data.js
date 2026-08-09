const categories = ['全部', '招牌热菜', '家常小炒', '凉菜小吃', '汤品炖菜', '主食米饭'];

const dishes = [
  {
    id: '1', name: '可乐鸡翅', category: '招牌热菜', price: 42,
    image: 'images/kelejichi.jpg',
    description: '选用新鲜鸡翅，可乐慢炖收汁，外焦里嫩，甜香诱人，大人小孩都爱吃。',
    sales: 386, tags: ['招牌', '甜香'], recommended: true,
    ingredients: ['鸡翅中 500g', '可乐 330ml', '生抽 2勺', '老抽 1勺', '姜片 适量', '料酒 1勺', '盐 少许'],
    cookingTime: '约35分钟',
    spiceLevel: 0,
    calories: 285,
    servingSize: '2-3人份',
    tips: '鸡翅提前划刀更入味；收汁时小火不断翻动，避免糊锅。',
    steps: [
      '鸡翅洗净，两面各划两刀，加料酒姜片腌制15分钟',
      '冷油下锅，中火将鸡翅煎至两面金黄',
      '倒入可乐没过鸡翅，加生抽、老抽调味',
      '大火烧开后转小火炖15分钟',
      '转大火收汁至浓稠，汤汁挂在鸡翅上即可出锅'
    ]
  },
  {
    id: '2', name: '小马鸡块', category: '招牌热菜', price: 38,
    image: 'images/maji.jpg',
    description: '鲜嫩鸡肉块，搭配秘制酱料爆炒，香气扑鼻，口感丰富有嚼劲。',
    sales: 298, tags: ['招牌', '下饭'], recommended: true,
    ingredients: ['鸡腿肉 400g', '干辣椒 10个', '花椒 1勺', '豆瓣酱 1勺', '蒜末 适量', '葱段 适量', '白芝麻 少许'],
    cookingTime: '约20分钟',
    spiceLevel: 2,
    calories: 320,
    servingSize: '2-3人份',
    tips: '鸡肉提前腌制10分钟更嫩滑；大火快炒锁住肉汁，口感更好。',
    steps: [
      '鸡腿肉去骨切块，加盐、料酒、淀粉腌制10分钟',
      '热油烧至七成热，鸡块滑炒至变色盛出',
      '锅留底油，小火炒香干辣椒、花椒、豆瓣酱',
      '倒回鸡块大火翻炒，加蒜末、葱段',
      '调味出锅，撒白芝麻即可'
    ]
  },
  {
    id: '3', name: '海苔鸡肉条', category: '招牌热菜', price: 36,
    image: 'images/haiti.jpg',
    description: '酥脆鸡柳条外裹鲜香海苔，一口一根，越吃越上瘾，小朋友超爱。',
    sales: 267, tags: ['酥脆', '人气'],
    ingredients: ['鸡胸肉 300g', '海苔碎 30g', '面包糠 100g', '鸡蛋 1个', '淀粉 适量', '盐 少许', '黑胡椒 少许'],
    cookingTime: '约25分钟',
    spiceLevel: 0,
    calories: 260,
    servingSize: '2人份',
    tips: '油温控制在170度左右炸至金黄；海苔最后裹上，避免炸焦变苦。',
    steps: [
      '鸡胸肉切条，加盐、黑胡椒、料酒腌制15分钟',
      '依次裹上淀粉、蛋液、面包糠',
      '油温170度，下锅炸至金黄酥脆，约3-4分钟',
      '捞出沥油，趁热裹上海苔碎',
      '搭配番茄酱或甜辣酱食用'
    ]
  },
  {
    id: '4', name: '红烧茄子', category: '招牌热菜', price: 28,
    image: 'images/qiezi.jpg',
    description: '茄子过油后加秘制酱汁红烧，软糯入味，酱香浓郁，素菜中的下饭神器。',
    sales: 234, tags: ['下饭', '素菜'],
    ingredients: ['长茄子 2根', '蒜末 适量', '葱花 适量', '生抽 2勺', '老抽 1勺', '糖 1勺', '淀粉 适量'],
    cookingTime: '约20分钟',
    spiceLevel: 1,
    calories: 180,
    servingSize: '2-3人份',
    tips: '茄子切好后泡盐水防氧化；先过油再烧更软糯入味，少吸油。',
    steps: [
      '茄子切滚刀块，盐水浸泡10分钟防氧化',
      '油温七成热，茄子过油至表面微黄捞出',
      '锅留底油，爆香蒜末，加生抽、老抽、糖调成酱汁',
      '倒回茄子翻炒均匀，加少量水焖2分钟',
      '水淀粉勾芡，撒葱花出锅'
    ]
  },
  {
    id: '5', name: '番茄炒鸡蛋', category: '家常小炒', price: 18,
    image: 'images/fanqie.jpg',
    description: '国民家常菜，酸甜番茄搭配嫩滑鸡蛋，汤汁拌饭能多吃两碗饭。',
    sales: 512, tags: ['家常', '经典'], recommended: true,
    ingredients: ['番茄 3个', '鸡蛋 4个', '糖 1勺', '盐 适量', '葱花 适量', '食用油 适量'],
    cookingTime: '约10分钟',
    spiceLevel: 0,
    calories: 165,
    servingSize: '2-3人份',
    tips: '鸡蛋炒至刚凝固即盛出，避免过老；番茄炒出汁后再回锅鸡蛋。',
    steps: [
      '番茄顶部划十字，开水烫后去皮切块',
      '鸡蛋打散加少许盐，热油炒至刚凝固盛出',
      '锅留底油，下番茄块翻炒出汁',
      '加糖、盐调味，倒回鸡蛋翻炒均匀',
      '撒葱花出锅，汤汁拌饭一绝'
    ]
  },
  {
    id: '6', name: '青椒炒肉', category: '家常小炒', price: 32,
    image: 'images/qingjiao.jpg',
    description: '新鲜青椒搭配精选五花肉，火爆快炒，香辣开胃，经典家常下饭菜。',
    sales: 378, tags: ['下饭', '微辣'],
    ingredients: ['青椒 4个', '五花肉 250g', '蒜片 适量', '生抽 1勺', '老抽 少许', '盐 适量', '豆豉 1勺'],
    cookingTime: '约15分钟',
    spiceLevel: 2,
    calories: 295,
    servingSize: '2-3人份',
    tips: '五花肉先煸出油脂更香；青椒大火快炒保持脆嫩，不要炒过头。',
    steps: [
      '五花肉切薄片，青椒切滚刀块',
      '热锅少油，下五花肉煸至出油微卷',
      '加蒜片、豆豉炒香，淋生抽老抽上色',
      '倒下青椒大火快炒1分钟，保持脆嫩',
      '加盐调味，迅速出锅'
    ]
  },
  {
    id: '7', name: '青椒炒鸡蛋', category: '家常小炒', price: 22,
    image: 'images/qingjiaoeg.jpg',
    description: '青椒脆爽、鸡蛋香嫩，简单快手，清淡不腻的家常小炒。',
    sales: 245, tags: ['家常', '清淡'],
    ingredients: ['青椒 3个', '鸡蛋 4个', '盐 适量', '蒜片 少许', '食用油 适量'],
    cookingTime: '约10分钟',
    spiceLevel: 1,
    calories: 155,
    servingSize: '2人份',
    tips: '青椒先煸炒去生味再混合鸡蛋；蛋液倒入后快速翻炒保持嫩滑。',
    steps: [
      '青椒切丝或小块，鸡蛋打散加盐',
      '热油先炒鸡蛋至刚凝固盛出',
      '锅留底油，爆香蒜片，下青椒炒至断生',
      '倒回鸡蛋翻炒混合均匀',
      '调味出锅'
    ]
  },
  {
    id: '8', name: '炒土豆丝', category: '家常小炒', price: 16,
    image: 'images/tudousi.jpg',
    description: '土豆切细丝，加醋大火快炒，酸辣爽脆，最朴素也最经典的下饭菜。',
    sales: 312, tags: ['爽口', '下饭'],
    ingredients: ['土豆 2个', '干辣椒 5个', '蒜末 适量', '陈醋 2勺', '盐 适量', '葱花 适量'],
    cookingTime: '约10分钟',
    spiceLevel: 1,
    calories: 120,
    servingSize: '2-3人份',
    tips: '土豆丝泡水去淀粉是爽脆的关键；沿锅边淋醋，酸味更均匀。',
    steps: [
      '土豆去皮切细丝，冷水浸泡10分钟去淀粉',
      '沥干水分，热油爆香干辣椒、蒜末',
      '下土豆丝大火快炒2分钟',
      '沿锅边淋陈醋，加盐调味',
      '翻炒均匀，撒葱花出锅'
    ]
  },
  {
    id: '9', name: '蒜末青菜', category: '家常小炒', price: 16,
    image: 'images/suanmo.jpg',
    description: '新鲜时令青菜，配蒜末清炒，保留蔬菜本味，清爽健康解油腻。',
    sales: 287, tags: ['清爽', '素菜'],
    ingredients: ['时令青菜 400g', '蒜末 适量', '盐 适量', '食用油 适量', '少许糖'],
    cookingTime: '约5分钟',
    spiceLevel: 0,
    calories: 65,
    servingSize: '2-3人份',
    tips: '大火快炒保持翠绿；青菜洗净后沥干水分，避免出水变软。',
    steps: [
      '青菜洗净沥干，大的对半切开',
      '热油爆香蒜末',
      '下青菜大火快炒1分钟至断生',
      '加盐和少许糖提鲜',
      '翻炒均匀出锅'
    ]
  },
  {
    id: '10', name: '鸡蛋羹', category: '家常小炒', price: 14,
    image: 'images/jidan.jpg',
    description: '鸡蛋加温水蒸至丝滑如布丁，淋上生抽香油，老少皆宜的营养美味。',
    sales: 198, tags: ['嫩滑', '营养'],
    ingredients: ['鸡蛋 3个', '温水 200ml', '盐 少许', '生抽 1勺', '香油 几滴', '葱花 适量'],
    cookingTime: '约15分钟',
    spiceLevel: 0,
    calories: 125,
    servingSize: '2人份',
    tips: '蛋液与温水比例1:1.5最嫩滑；过滤气泡后蒸出来更平滑无孔。',
    steps: [
      '鸡蛋打散，加温水和盐搅匀（蛋水比1:1.5）',
      '过筛滤去气泡，盖上保鲜膜扎几个小孔',
      '水开后中火蒸10分钟，关火焖2分钟',
      '取出淋生抽、香油',
      '撒葱花即可'
    ]
  },
  {
    id: '11', name: '香炸洋葱圈', category: '凉菜小吃', price: 20,
    image: 'images/yangchon.jpg',
    description: '新鲜洋葱切圈，裹粉炸至金黄酥脆，蘸番茄酱吃，越嚼越香的小食。',
    sales: 223, tags: ['酥脆', '小食'],
    ingredients: ['洋葱 1个', '面粉 100g', '鸡蛋 1个', '面包糠 150g', '盐 少许', '黑胡椒 少许', '番茄酱 适量'],
    cookingTime: '约15分钟',
    spiceLevel: 0,
    calories: 210,
    servingSize: '2人份',
    tips: '洋葱切好后掰散成圈；油温170度炸至上色即捞，避免炸焦。',
    steps: [
      '洋葱切1cm厚圈，掰散成单个圆环',
      '依次裹上面粉、蛋液、面包糠',
      '油温170度，下锅炸至金黄约2分钟',
      '捞出沥油，撒少许盐和黑胡椒',
      '搭配番茄酱食用'
    ]
  },
  {
    id: '12', name: '玉米排骨汤', category: '汤品炖菜', price: 38,
    image: 'images/yumi.jpg',
    description: '猪肋排加甜玉米慢炖两小时，汤色清亮，鲜甜滋补，营养又暖胃。',
    sales: 276, tags: ['滋补', '炖汤'], recommended: true,
    ingredients: ['猪肋排 500g', '甜玉米 2根', '胡萝卜 1根', '姜片 适量', '料酒 1勺', '盐 适量', '枸杞 少许'],
    cookingTime: '约2小时',
    spiceLevel: 0,
    calories: 245,
    servingSize: '3-4人份',
    tips: '排骨焯水去血沫汤更清亮；小火慢炖，中途不要频繁揭盖。',
    steps: [
      '排骨冷水下锅，加料酒姜片焯水去血沫',
      '捞出排骨温水冲洗干净',
      '砂锅放排骨、玉米段、胡萝卜块、姜片',
      '加足量清水大火烧开，转小火炖1.5小时',
      '加盐调味，撒枸杞再炖10分钟'
    ]
  },
  {
    id: '13', name: '鸡排米粉汤', category: '汤品炖菜', price: 28,
    image: 'images/jipai.jpg',
    description: '酥脆鸡排配细米粉，加清淡高汤，一碗下肚，饱腹感与满足感十足。',
    sales: 201, tags: ['主食汤', '暖胃'],
    ingredients: ['鸡排 1块', '米粉 100g', '高汤 500ml', '青菜 2棵', '葱花 适量', '盐 适量', '白胡椒 少许'],
    cookingTime: '约20分钟',
    spiceLevel: 1,
    calories: 380,
    servingSize: '1人份',
    tips: '米粉提前泡软更易煮透；鸡排最后放入保持酥脆口感。',
    steps: [
      '米粉提前用温水泡软',
      '鸡排煎至两面金黄切条备用',
      '高汤烧开，下米粉煮3分钟',
      '加青菜烫熟，加盐和白胡椒调味',
      '盛入碗中，铺上鸡排条，撒葱花'
    ]
  },
  {
    id: '14', name: '手工水饺(鲜肉)', category: '主食米饭', price: 26,
    image: 'images/jiaozi1.jpg',
    description: '新鲜猪肉加时令蔬菜调馅，手工现包，皮薄馅大，咬一口汁水四溢。',
    sales: 345, tags: ['手工', '招牌'],
    ingredients: ['饺子皮 50张', '猪肉馅 300g', '白菜 200g', '姜末 适量', '生抽 2勺', '香油 1勺', '盐 适量'],
    cookingTime: '约40分钟',
    spiceLevel: 0,
    calories: 220,
    servingSize: '2-3人份',
    tips: '肉馅顺一个方向搅打上劲更弹牙；煮饺子点三次凉水，皮更筋道。',
    steps: [
      '白菜剁碎挤水，猪肉馅加调料顺方向搅上劲',
      '白菜与肉馅混合拌匀成馅料',
      '取饺子皮包入馅料，捏紧收口',
      '锅中水烧开，下饺子煮至浮起',
      '点三次凉水，饺子鼓胀即熟'
    ]
  },
  {
    id: '15', name: '手工水饺(素馅)', category: '主食米饭', price: 22,
    image: 'images/jiaozi2.jpg',
    description: '韭菜鸡蛋或素三鲜作馅，清爽不腻，一口一个，素食者也能大快朵颐。',
    sales: 267, tags: ['手工', '素馅'],
    ingredients: ['饺子皮 50张', '韭菜 250g', '鸡蛋 3个', '虾皮 适量', '香油 2勺', '盐 适量'],
    cookingTime: '约35分钟',
    spiceLevel: 0,
    calories: 185,
    servingSize: '2-3人份',
    tips: '韭菜洗净晾干再切，避免出水；鸡蛋晾凉后再拌入韭菜，保持翠绿。',
    steps: [
      '韭菜洗净晾干切碎，鸡蛋炒碎晾凉',
      '韭菜加香油拌匀锁水，再混合鸡蛋虾皮',
      '加盐调味，取皮包入馅料',
      '大火烧开水，下饺子煮至浮起',
      '点两次凉水即可捞出'
    ]
  }
];
