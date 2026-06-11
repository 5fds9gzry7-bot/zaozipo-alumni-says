export type Article = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  graduationYear: number;
  readTime: string;
  likeCount: number;
  favoriteCount: number;
  paragraphs: string[];
};

export type Alumni = {
  id: string;
  name: string;
  graduationYear: number;
  className: string;
  university: string;
  college: string;
  major: string;
  city: string;
  country: string;
  stage: string;
  direction: string;
  tags: string[];
  intro: string;
  gaokaoYear: number;
  gaokaoProvince: string;
  gaokaoType: string;
  gaokaoScore: number;
  gaokaoRank: number;
  showScore: boolean;
  showRank: boolean;
  admittedUniversity: string;
  admittedMajor: string;
  studyAdvice: string;
  examAdvice: string;
  applicationAdvice: string;
  majorAdvice: string;
  messageToStudents: string;
  contact: string;
  showContact: boolean;
};

export const articles: Article[] = [
  {
    id: "five-things-before-college",
    title: "从溆浦一中到大学：我想早点知道的 5 件事",
    excerpt: "大学不是高中的自然延长线。关于选择、节奏和独处，这是我走出枣子坡后最想补上的一课。",
    category: "大学成长",
    authorName: "周屿",
    graduationYear: 2024,
    readTime: "6 分钟",
    likeCount: 86,
    favoriteCount: 42,
    paragraphs: [
      "刚到大学时，我以为只要延续高中那套认真听课、完成作业的方法，就能顺利适应。后来才发现，大学真正考验的是主动选择：选择把时间放在哪里，也接受有些事情暂时做不好。",
      "第一件想早点知道的事，是不要急着给自己定型。专业方向、社团、城市和朋友都需要亲自接触后再判断。允许自己用一个学期去观察，比匆忙追赶别人更重要。",
      "第二件事，是学会寻求帮助。老师的答疑时间、学长学姐的经验、学校的资源，都比想象中更愿意向你开放。把问题说清楚，本身就是一种能力。",
      "最后，别忘记保留一点来自枣子坡的笃定。世界很大，但认真做事、坦诚待人这些朴素习惯，在哪里都很有用。",
    ],
  },
  {
    id: "choose-a-major",
    title: "高考后选专业，不要只看名字好不好听",
    excerpt: "从课程表、培养方案到真实工作日常，四个角度帮你拆开一个专业的漂亮名字。",
    category: "大学专业",
    authorName: "林知夏",
    graduationYear: 2023,
    readTime: "8 分钟",
    likeCount: 132,
    favoriteCount: 76,
    paragraphs: [
      "专业名称往往很精炼，但四年的学习内容不会写在名字里。填报前，我建议先找到目标院校近两年的培养方案，看看必修课和方向课是否真的让你感兴趣。",
      "其次，可以搜索这个专业毕业生常见的去向。不要只看少数光鲜案例，也看看普通毕业生的工作内容、城市分布和继续深造比例。",
      "兴趣不是一瞬间的心动，而是愿不愿意长期处理这个领域里具体而琐碎的问题。了解得越具体，选择越稳。",
    ],
  },
  {
    id: "study-habits",
    title: "在枣子坡的三年，真正帮到我的学习习惯",
    excerpt: "比起熬夜和题海，我更受益于稳定复盘、及时提问，以及给自己留下能呼吸的时间。",
    category: "高中学习",
    authorName: "蒋言",
    graduationYear: 2022,
    readTime: "7 分钟",
    likeCount: 104,
    favoriteCount: 55,
    paragraphs: [
      "我最有用的习惯，是每天晚自习结束前留十分钟做小结：今天真正弄懂了什么，哪里还模糊，明天第一件要解决的事是什么。",
      "错题本不需要抄得很漂亮。对我来说，记录错误原因和下一次识别它的方法，比完整誊写题目更有效。",
      "稳定睡眠并不会让你落后。能在白天保持清醒，通常比多熬一个小时更划算。",
    ],
  },
  {
    id: "choose-a-university",
    title: "志愿填报时，怎样判断一所大学适不适合你",
    excerpt: "城市、学科、转专业空间和校园生活，都值得放进你的志愿选择表。",
    category: "志愿填报",
    authorName: "宋予安",
    graduationYear: 2021,
    readTime: "9 分钟",
    likeCount: 118,
    favoriteCount: 69,
    paragraphs: [
      "判断一所大学，不妨先写下自己最在意的三个变量。有人看重学科实力，有人希望离家近，也有人需要更多转专业或交换机会。排序不同，答案自然不同。",
      "官网是最可靠的第一手入口。重点看招生章程、培养方案、转专业政策和近年录取情况，再用在校生分享补充生活层面的细节。",
      "志愿没有完美答案。做好信息核验，在可接受的范围内做出选择，就已经足够认真。",
    ],
  },
  {
    id: "first-year-learning",
    title: "大学第一年，我如何适应新的学习方式",
    excerpt: "没人再每天检查进度后，我用课程地图和每周回顾重新建立了自己的节奏。",
    category: "大学成长",
    authorName: "陈砚秋",
    graduationYear: 2020,
    readTime: "5 分钟",
    likeCount: 74,
    favoriteCount: 38,
    paragraphs: [
      "大学课程的难点并不总在课堂，而在于课后如何消化。我会在开学第一周把所有课程的考核方式放进同一张表，提前看见忙碌的节点。",
      "每周末，我会用半小时回顾：哪些内容只听懂了表面，哪些任务需要尽早开始。这个习惯让我少了很多期末突击。",
      "适应不是立刻变得游刃有余，而是逐渐找到适合自己的节奏。",
    ],
  },
];

export const alumni: Alumni[] = [
  {
    id: "zhou-yu",
    name: "周屿",
    graduationYear: 2024,
    className: "高三 2103 班",
    university: "西交利物浦大学",
    college: "理学院",
    major: "应用数学",
    city: "苏州",
    country: "中国",
    stage: "本科在读",
    direction: "数据建模与海外升学",
    tags: ["数学", "留学申请", "志愿填报"],
    intro: "喜欢把复杂问题慢慢拆开，也愿意分享从县城走向国际化校园的真实适应过程。",
    gaokaoYear: 2024,
    gaokaoProvince: "湖南",
    gaokaoType: "物理类",
    gaokaoScore: 602,
    gaokaoRank: 12480,
    showScore: true,
    showRank: false,
    admittedUniversity: "西交利物浦大学",
    admittedMajor: "应用数学",
    studyAdvice: "数学学习最重要的是保留推导过程。做完题后，试着不看答案讲清楚每一步为什么成立。",
    examAdvice: "最后阶段不要频繁更换资料。围绕自己的薄弱点做小范围、高频率的复盘更有效。",
    applicationAdvice: "提前了解中外合作办学的学费、课程语言和升学路径，确认它是否与你的家庭规划和学习习惯匹配。",
    majorAdvice: "应用数学不只是做题，也会接触编程、统计与建模。可以先试听公开课，感受自己是否喜欢抽象推理。",
    messageToStudents: "从枣子坡出发，不必急着证明自己见过多大的世界。保持好奇，世界会慢慢打开。",
    contact: "公开主页：zaoyou.example/zhouyu",
    showContact: true,
  },
  {
    id: "lin-zhixia",
    name: "林知夏",
    graduationYear: 2023,
    className: "高三 2006 班",
    university: "湖南大学",
    college: "信息科学与工程学院",
    major: "计算机科学",
    city: "长沙",
    country: "中国",
    stage: "本科在读",
    direction: "软件工程与人机交互",
    tags: ["计算机", "竞赛", "大学生活"],
    intro: "在写代码，也在学习如何把技术做得更易用、更有人情味。",
    gaokaoYear: 2023,
    gaokaoProvince: "湖南",
    gaokaoType: "物理类",
    gaokaoScore: 621,
    gaokaoRank: 8060,
    showScore: false,
    showRank: true,
    admittedUniversity: "湖南大学",
    admittedMajor: "计算机科学与技术",
    studyAdvice: "给每一科建立最小可执行计划。状态普通的日子也能完成，长期积累会比偶尔用力更可靠。",
    examAdvice: "考场上先确保会做的题不失分。遇到卡点时做标记并继续，别让一道题影响后面的节奏。",
    applicationAdvice: "同一专业在不同学校的培养重点可能不同，务必查看课程体系和实验室方向。",
    majorAdvice: "入门编程时卡住很正常。先学会读报错、拆问题，再逐步建立完整项目能力。",
    messageToStudents: "不需要把每一步都走成标准答案，愿你找到自己真正愿意投入的事情。",
    contact: "",
    showContact: false,
  },
  {
    id: "jiang-yan",
    name: "蒋言",
    graduationYear: 2022,
    className: "高三 1902 班",
    university: "中南大学",
    college: "湘雅医学院",
    major: "临床医学",
    city: "长沙",
    country: "中国",
    stage: "本科在读",
    direction: "临床医学",
    tags: ["医学", "高考经验", "时间管理"],
    intro: "医学学习很长，我更关注如何把长期目标拆成今天能完成的小事。",
    gaokaoYear: 2022,
    gaokaoProvince: "湖南",
    gaokaoType: "物理类",
    gaokaoScore: 628,
    gaokaoRank: 6200,
    showScore: true,
    showRank: true,
    admittedUniversity: "中南大学",
    admittedMajor: "临床医学",
    studyAdvice: "用间隔复习代替一次性背诵，尤其适合需要长期记忆的知识点。",
    examAdvice: "模考后先分析失分类型，再决定下一周的训练，不要只盯着总分。",
    applicationAdvice: "医学培养周期较长，填报前需要了解学制、规培和未来工作的真实节奏。",
    majorAdvice: "对生命科学的兴趣和与人沟通的耐心，同样重要。",
    messageToStudents: "认真生活，也认真休息。走得远的人通常懂得照顾自己的节奏。",
    contact: "",
    showContact: false,
  },
  {
    id: "song-yuan",
    name: "宋予安",
    graduationYear: 2021,
    className: "高三 1805 班",
    university: "武汉大学",
    college: "法学院",
    major: "法学",
    city: "武汉",
    country: "中国",
    stage: "硕士在读",
    direction: "民商法与公共表达",
    tags: ["法学", "人文社科", "志愿填报"],
    intro: "相信清晰表达是一种温柔的力量，也想让信息差少一点。",
    gaokaoYear: 2021,
    gaokaoProvince: "湖南",
    gaokaoType: "历史类",
    gaokaoScore: 625,
    gaokaoRank: 980,
    showScore: false,
    showRank: true,
    admittedUniversity: "武汉大学",
    admittedMajor: "法学",
    studyAdvice: "文科学习不等于机械记忆，先建立时间线和概念关系，再填充细节。",
    examAdvice: "主观题先列提纲再书写，能减少遗漏，也让阅卷者更容易看见你的逻辑。",
    applicationAdvice: "把城市资源、学校气质和学科实力放在一起判断，不要只看单一排名。",
    majorAdvice: "法学需要大量阅读与持续表达，建议提前了解课程与职业资格要求。",
    messageToStudents: "愿你既有走出去的勇气，也有理解不同选择的从容。",
    contact: "邮箱：yuan.public@example.com",
    showContact: true,
  },
  {
    id: "chen-yanqiu",
    name: "陈砚秋",
    graduationYear: 2020,
    className: "高三 1701 班",
    university: "华南理工大学",
    college: "自动化科学与工程学院",
    major: "自动化",
    city: "广州",
    country: "中国",
    stage: "硕士在读",
    direction: "机器人控制",
    tags: ["自动化", "科研", "保研"],
    intro: "从小城到实验室，慢慢学会与不确定的问题相处。",
    gaokaoYear: 2020,
    gaokaoProvince: "湖南",
    gaokaoType: "理科",
    gaokaoScore: 641,
    gaokaoRank: 5400,
    showScore: true,
    showRank: false,
    admittedUniversity: "华南理工大学",
    admittedMajor: "自动化",
    studyAdvice: "理科错题要追问：是概念不清、计算失误，还是题型陌生。不同原因需要不同处理。",
    examAdvice: "保持固定作息，让大脑在考试时段自然进入工作状态。",
    applicationAdvice: "工科专业要关注实验条件、培养方向和所在城市的产业环境。",
    majorAdvice: "自动化覆盖面很广，大学前两年打牢数学和编程基础会很有帮助。",
    messageToStudents: "不用害怕起点普通，持续把眼前的事情做扎实，路会越走越宽。",
    contact: "",
    showContact: false,
  },
  {
    id: "he-qing",
    name: "何清",
    graduationYear: 2019,
    className: "高三 1604 班",
    university: "香港中文大学（深圳）",
    college: "数据科学学院",
    major: "数据科学",
    city: "深圳",
    country: "中国",
    stage: "数据分析师",
    direction: "商业分析与数据产品",
    tags: ["数据科学", "实习", "职业成长"],
    intro: "在数据和真实业务之间做翻译，也持续记录职业选择中的得失。",
    gaokaoYear: 2019,
    gaokaoProvince: "湖南",
    gaokaoType: "理科",
    gaokaoScore: 630,
    gaokaoRank: 6900,
    showScore: false,
    showRank: false,
    admittedUniversity: "香港中文大学（深圳）",
    admittedMajor: "数据科学",
    studyAdvice: "把知识讲给别人听，是检验自己是否真正理解的好方法。",
    examAdvice: "复习后期优先稳住优势科目，再集中解决一两个最影响总分的问题。",
    applicationAdvice: "新兴专业尤其需要查看具体课程，而不是只凭名称和热度判断。",
    majorAdvice: "数据科学需要统计、编程和业务理解，三者都值得持续积累。",
    messageToStudents: "世界不只奖励最早找到答案的人，也奖励愿意持续提问的人。",
    contact: "公开主页：zaoyou.example/heqing",
    showContact: true,
  },
];

export const stats = [
  { value: "12", label: "经验文章" },
  { value: "8", label: "枣友名片" },
  { value: "6", label: "覆盖大学" },
];

export const articleCategories = ["全部", "高中学习", "志愿填报", "大学专业", "大学成长"];
export const alumniFilters = ["全部", "数学", "计算机", "医学", "留学", "志愿填报"];
