export const RECEIPT_PHRASES = [
  '今日份快乐已到账',
  '钱不是万能的，但到账是真的快乐',
  '你值得被这个世界温柔以待',
  '搞钱使人快乐，摸鱼使人清醒',
  '离自由又近了一步',
  '这一笔，是给认真生活的你',
  '账户余额 +1，心情 +100',
  '保持热爱，继续搞钱',
  '带薪发呆，合理合法',
  '老板没看见，钱已经到账',
  '今天的努力，正在变成数字',
  '别急，慢慢来，都会有的',
  '收到请微笑，这笔是奖励',
  '工作的意义，具象化了',
  '打工人续命补贴已发放',
  '再坚持一下，就快下班了',
  '每次到账，都是一次小型庆祝',
  '先收下，再去把生活过好',
  '你很棒，这件事无需证明',
  '据说点赞这笔钱会翻倍',
]

let lastIndex = -1

export function pickPhrase(): string {
  if (RECEIPT_PHRASES.length === 0) return ''
  let index = Math.floor(Math.random() * RECEIPT_PHRASES.length)
  if (index === lastIndex) index = (index + 1) % RECEIPT_PHRASES.length
  lastIndex = index
  return RECEIPT_PHRASES[index]
}
