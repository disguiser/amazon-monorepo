// 肉眼不可见的字符确实是网页抓取中常见的陷阱，尤其是在处理从 HTML 复制或提取的文本时。
export function removeInvisible(str) {
  return str.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]+/g, '');
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
