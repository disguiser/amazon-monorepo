class ScrapingError extends Error {
  constructor(message) {
    super(message); // 调用父类构造函数
    this.name = 'ScrapingError'; // 设置错误名称
    // 保持正确的堆栈跟踪 (V8引擎)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ScrapingError);
    }
  }
}
