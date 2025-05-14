import { Injectable, Logger } from '@nestjs/common';
import puppeteer, {
  type Browser,
  type Page,
  type ElementHandle,
} from 'puppeteer';
import { ConfigService } from '@nestjs/config';
import { readFile, writeFile, copyFile, stat } from 'fs/promises';
import xlsx from 'node-xlsx';
import { removeInvisible, sleep } from './utils';
import path from 'path';
import { getAmazonHighResImgs } from './spider-img';
import { DoSpiderDto } from './dto/do-spider.dto';
import { execSync } from 'child_process';
import { checkFileExists } from 'src/utils';
import { join } from 'path';

// 自定义错误类
class ScrapingError extends Error {
  constructor(message: string | null) {
    super(message || 'Scraping error occurred');
    this.name = 'ScrapingError';
  }
}

@Injectable()
export class SpiderService {
  private processDone: () => void = () => {};
  private browser: Browser | null = null;
  private sendLog: (message: string) => void = () => {};
  private readonly logger = new Logger(SpiderService.name);
  private excelDir: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.excelDir = this.configService.get<string>('EXCEL_DIR');
  }

  setProcessDone(fn) {
    this.processDone = fn;
  }

  setSendLog(fn) {
    this.sendLog = fn;
  }

  /**
   * 执行爬虫
   * @param {string} url 产品页面URL
   */
  async doSpider({ urls, headless, sleepSecond }: DoSpiderDto) {
    this.browser = await puppeteer.launch({
      headless, // false表示显示浏览器窗口
      userDataDir: this.configService.get<string>('CHROME_USER_DATA_DIR'), // 用户目录,会缓存cookie
      args: [
        // --no-sandbox: 禁用 Chromium 沙箱。
        // 警告：这会降低安全性。仅在完全受信任的环境中或沙箱导致启动失败时使用。
        '--no-sandbox',
        // --disable-setuid-sandbox: 禁用 setuid 沙箱。
        // 通常与 --no-sandbox 一起在 Linux 系统上使用，以解决沙箱相关的启动问题。
        '--disable-setuid-sandbox',
      ],
      // executablePath: 指定 Puppeteer 使用的 Chrome/Chromium 可执行文件的路径。
      // 如果该环境变量未设置或为空，则表达式结果为 undefined，
      // 此时 Puppeteer 将使用其默认下载并捆绑的 Chromium 版本。
      executablePath: (await this.findChromeExecutablePath()) ?? undefined,
    });

    this.browser.on('disconnected', () => {
      this.sendLog('browser is closed');
      this.processDone();
    });

    this.sendLog('Browser launched successfully');

    const page = await this.browser.newPage();

    // 设置视口大小
    await page.setViewport({ width: 1280, height: 800 });
    // 设置用户代理以避免被检测为爬虫
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    );
    // 使用puppeteer获取动态加载的内容
    for (const url of urls) {
      this.sendLog(`------------- ${url} -------------`);
      try {
        const { title, description, imgs, others, specification } =
          await this.getPuppeteerData(page, url);
        const nineImgsArr = [...imgs, ...new Array(9 - imgs.length).fill('')];
        // 构建产品数据
        const product = [
          '',
          title,
          description,
          '',
          '',
          specification?.specName,
          specification?.specValue,
          specification ? nineImgsArr[0] : '',
          '',
          '',
          '10',
          '10',
          url,
          ...nineImgsArr,
          '',
          '',
          others['Item Weight'] ? others['Item Weight'] : others['Weight'],
          others['L'],
          others['W'],
          others['H'],
          '2',
          '0',
          '',
          '中国大陆',
          '无保修',
          others['Colour'],
          others['Material'],
        ];
        // 保存到Excel
        await this.addInExcel(product);
        this.sendLog('Scraping complete. Results saved to Excel');
        await sleep(sleepSecond * 1000);
      } catch (error) {
        if (error instanceof ScrapingError) {
          this.sendLog('Error during Puppeteer scraping.');
        } else {
          this.sendLog('Error adding product to Excel');
        }
        console.error(error);
        continue;
      }
    }
    await this.browser.close();
  }

  /**
   * 使用puppeteer获取需要动态加载的内容
   * @param {string} url 产品页面URL
   */
  async getPuppeteerData(page: Page, url: string) {
    try {
      // 导航到目标页面
      this.sendLog('Loading page...');
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 40000,
      });
      if (response?.status() !== 200) {
        this.sendLog('Page load failed: ' + response?.status());
        throw new ScrapingError(null);
      }
      // 等待页面主要内容加载完成
      await page.waitForSelector('#productTitle', { timeout: 40000 });

      this.sendLog('Page load complete. Initiating scroll...');

      // 滚动页面以加载动态内容
      await this.autoScroll(page);

      this.sendLog('Scroll complete. Extracting content...');

      // 提取产品标题
      const title = await page.$eval('#productTitle', (el) =>
        el?.textContent?.trim(),
      );
      if (!title) {
        throw new ScrapingError('title is undefined');
      }

      let description: string | undefined = await this.getDescription(page);
      if (!description || description.length < 20) {
        description = title;
      }

      const feature = await this.buildFeature(page);

      const detail = await this.buildDetail(page);

      // 获取规格
      const specification = await this.getSpecification(page);

      const imgs = await getAmazonHighResImgs(page);

      const others = { ...feature, ...detail };
      return {
        title: title.length > 180 ? title.substring(0, 180) : title,
        description,
        imgs,
        others,
        specification,
      };
    } catch (error) {
      console.error(error);
      throw new ScrapingError('Scraping error');
    }
  }

  /**
   * 自动滚动页面以加载动态内容
   * @param {Page} page Puppeteer页面对象
   */
  async autoScroll(page: Page) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          // 如果已经滚动到底部或滚动了足够多的距离，则停止
          if (totalHeight >= scrollHeight || totalHeight > 10000) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // 等待一段时间，确保动态内容加载完成
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  async getDescription(page: Page) {
    const aboutThisItem = await page.$('#feature-bullets');
    if (aboutThisItem) {
      return await aboutThisItem.$eval('ul', (el) => el.innerText);
    }
    return '';
  }

  rebuildKeyValue(keys, values) {
    const res = {};
    for (let i = 0; i < keys.length; i++) {
      if (
        /Item dimensions L x W x H|Product dimensions|Package Dimensions/i.test(
          keys[i],
        )
      ) {
        values[i] = removeInvisible(values[i]);
        // 5"L x 3"W
        const regex1 = /(\d+(?:\.\d+)?)"?L x (\d+(?:\.\d+)?)"?W/;
        if (regex1.test(values[i])) {
          const match = values[i].match(regex1);
          res['L'] = (parseFloat(match[1]) * 2.54).toFixed(2);
          res['W'] = (parseFloat(match[2]) * 2.54).toFixed(2);
        }
        // 9.72 x 5.87 x 0.75 inches; 2.89 xxx
        const regex2 =
          /(\d+(?:\.\d+)?) x (\d+(?:\.\d+)?) x (\d+(?:\.\d+)?) inches;\s*([^;]+)/i;
        if (regex2.test(values[i])) {
          const match = values[i].match(regex2);
          res['L'] = (parseFloat(match[1]) * 2.54).toFixed(2);
          res['W'] = (parseFloat(match[2]) * 2.54).toFixed(2);
          res['H'] = (parseFloat(match[3]) * 2.54).toFixed(2);
          res['Weight'] = this.dealWeight(match[4]);
        }
        // 10.2 x 6.1 x 0.7 cm; 100 xxx
        const regex3 =
          /(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)(?:\s*)cm;\s*([^;]+)/i;
        if (regex3.test(values[i])) {
          const match = values[i].match(regex3);
          res['L'] = parseFloat(match[1]).toFixed();
          res['W'] = parseFloat(match[2]).toFixed();
          res['H'] = parseFloat(match[3]).toFixed();
          res['Weight'] = this.dealWeight(match[4]);
        }
      }
      if (/item weight/i.test(keys[i])) {
        res['Item Weight'] = this.dealWeight(values[i]);
      }
      if (keys[i] == 'Material' || keys[i] == 'Colour') {
        res[keys[i]] = values[i];
      }
    }
    return res;
  }

  dealWeight(weightStr) {
    weightStr = removeInvisible(weightStr);
    if (/ Grams$| g$/i.test(weightStr)) {
      return (parseInt(weightStr.replace(/ Grams| g/, '')) / 1000).toFixed(2);
    } else if (/ Kilograms| kg$/i.test(weightStr)) {
      return parseInt(weightStr.replace(/ Kilograms| kg/, ''));
    } else if (/ ounces$/i.test(weightStr)) {
      return (
        parseInt(weightStr.replace(/ ounces/, '')) * 0.028349523125
      ).toFixed(2);
    } else if (/ pounds$/i.test(weightStr)) {
      return (parseInt(weightStr.replace(/ pounds/, '')) * 0.45359237).toFixed(
        2,
      );
    } else {
      this.sendLog(`不存在的重量单位: ${weightStr}`);
      return '';
    }
  }
  async buildDetail(page: Page) {
    let detailKeys: string[] = [];
    let detailValues: string[] = [];
    const prodInfo = await page.$('#productDetails_detailBullets_sections1');
    if (prodInfo) {
      detailKeys = await prodInfo.$$eval('th', (els: Element[]) =>
        els.map((e) => e.textContent?.trim() || ''),
      );
      detailValues = await prodInfo.$$eval('td', (els: Element[]) =>
        els.map((e) => e.textContent?.trim() || ''),
      );
    }
    const techDetail = await page.$('#productDetails_techSpec_section_1');
    if (techDetail) {
      const techKeys = await techDetail.$$eval(
        '.prodDetSectionEntry',
        (els: Element[]) => els.map((e) => e.textContent?.trim() || ''),
      );
      detailKeys = [...detailKeys, ...techKeys];

      const techValues = await techDetail.$$eval(
        '.prodDetAttrValue',
        (els: Element[]) => els.map((e) => e.textContent?.trim() || ''),
      );
      detailValues = [...detailValues, ...techValues];
    }
    const productDetail = await page.$('#detailBulletsWrapper_feature_div');
    if (productDetail) {
      // 获取列表项，并断言其类型为字符串数组
      const productDetailKV = (await productDetail.$$eval(
        '.a-list-item',
        (els: Element[]) => els.map((e) => e.textContent || ''),
      )) as string[];

      productDetailKV.forEach((e: string) => {
        if (e.includes(':')) {
          const [key, value] = e.split(':');
          detailKeys.push(removeInvisible(key).trim());
          detailValues.push(removeInvisible(value).trim());
        }
      });
    }
    return this.rebuildKeyValue(detailKeys, detailValues);
  }

  async buildFeature(page: Page) {
    const featureDiv = await page.$('#productOverview_feature_div');
    if (featureDiv) {
      type KeyValue = { keys: string[]; values: string[] };

      // 使用类型断言处理 evaluate 返回值
      const result = await page.evaluate((div) => {
        const featureKeys = Array.from(
          div.querySelectorAll('.a-text-bold'),
        ).map((el) => (el.textContent ?? '').trim());

        const featureValues = Array.from(
          div.querySelectorAll('.po-break-word'),
        ).map((el) => (el.textContent ?? '').trim());

        return {
          keys: featureKeys,
          values: featureValues,
        };
      }, featureDiv);

      // 使用类型断言确保类型安全
      const { keys, values } = result as KeyValue;
      return this.rebuildKeyValue(keys, values);
    } else {
      return null;
    }
  }

  /**
   * 获取规格
   * @param {Page} page Puppeteer页面对象
   */
  async getSpecification(page: Page) {
    const specificationContainer = await page.$(
      '.inline-twister-dim-title-value-truncate-expanded',
    );
    if (specificationContainer) {
      // 使用直接断言确保返回类型是字符串
      const temp = (await specificationContainer.evaluate(
        (el) => el.textContent?.trim() || '',
      )) as string;

      // 处理可能没有冒号的情况
      if (!temp.includes(':')) {
        return {
          specName: temp,
          specValue: '',
        };
      }

      const _temp = temp.split(':');
      const specName = _temp[0].trim();
      const specValue = _temp.length > 1 ? _temp[1].trim() : '';
      return {
        specName,
        specValue,
      };
    } else {
      return null;
    }
  }

  /**
   * 将产品数据添加到Excel文件
   * @param {Array} product 产品数据数组
   */
  async addInExcel(product) {
    if (!this.excelDir) {
      this.logger.error('EXCEL_DIR is not set');
      return;
    }
    const templateFilePath = path.join(this.excelDir, 'template.xlsx');
    const outputFilePath = path.join(this.excelDir, 'output.xlsx');
    if (!(await checkFileExists(this.excelDir))) {
      this.logger.error('template.xlsx does not exist');
      return;
    }
    try {
      await stat(outputFilePath);
    } catch (error) {
      this.sendLog('Output file does not exist. Creating new file...');
      await copyFile(templateFilePath, outputFilePath);
    }
    const workSheetsFromFile = xlsx.parse(outputFilePath);

    const buffer = xlsx.build([
      {
        name: workSheetsFromFile[0].name,
        data: [...workSheetsFromFile[0].data, product],
        options: {},
      },
    ]);
    await writeFile(outputFilePath, buffer);
    this.sendLog('Excel processing complete.');
  }
  async findChromeExecutablePath(): Promise<string | null> {
    const commonPaths: string[] = [
      // 64-bit Chrome on 64-bit Windows
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      // 32-bit Chrome on 64-bit Windows (or 32-bit Chrome on 32-bit Windows)
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      // 用户 AppData 目录下的 Chrome (例如通过非管理员权限安装)
      process.env.LOCALAPPDATA
        ? path.join(
            process.env.LOCALAPPDATA,
            'Google\\Chrome\\Application\\chrome.exe',
          )
        : '',
    ];

    for (const chromePath of commonPaths) {
      if (chromePath && (await checkFileExists(chromePath))) {
        console.log(`Chrome found at default path: ${chromePath}`);
        return chromePath;
      }
    }

    // 尝试从注册表获取路径
    const registryPaths: string[] = [
      'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe',
      'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe',
      'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe',
    ];

    for (const regPath of registryPaths) {
      try {
        // 构建查询命令，注意转义和空格
        const command = `reg query "${regPath}" /ve`; // /ve 查询默认值
        const stdout = execSync(command, { encoding: 'utf8' });

        // 解析输出，例如:
        // ! REG.EXE VERSION 3.0
        //
        // HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe
        //     <NO NAME>    REG_SZ    C:\Program Files\Google\Chrome\Application\chrome.exe
        //
        const match = stdout.match(/REG_SZ\s+(.+)/);
        if (match && match[1]) {
          const chromePathFromReg = match[1].trim();
          if (await checkFileExists(chromePathFromReg)) {
            console.log(
              `Chrome found via registry (${regPath}): ${chromePathFromReg}`,
            );
            return chromePathFromReg;
          }
        }
      } catch (error) {
        // console.warn(`Failed to query registry path ${regPath}:`, error.message);
        // 忽略错误，继续尝试下一个注册表路径
      }
    }

    console.warn(
      'Google Chrome executable not found at common locations or in registry.',
    );
    return null; // 或返回 puppeteer.executablePath() 作为备用
  }

  async downloadExcel() {
    if (!this.excelDir) {
      return null;
    }
    const filePath = join(this.excelDir, 'output.xlsx');
    // 异步读取文件 Buffer
    return await readFile(filePath);
  }
}
