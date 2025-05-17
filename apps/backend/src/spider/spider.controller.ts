import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Param,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { SpiderService } from './spider.service';
import { DoSpiderDto } from './dto/do-spider.dto';
import { SpiderAsinDto } from './dto/spider-asin.dto';

@Controller('spider')
export class SpiderController {
  constructor(private readonly spiderService: SpiderService) {}

  private readonly logger = new Logger(SpiderController.name);
  private dtoMap = new Map<string, DoSpiderDto>();

  @Get('sse/:taskId')
  async sse(@Res() res: FastifyReply, @Param('taskId') taskId: string) {
    // 设置 SSE 所需的响应头
    res.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*', // 允许跨域访问
    });

    // 保持连接不自动关闭
    res.raw.flushHeaders();

    // 使用服务设置日志发送函数
    this.spiderService.setSendLog((message: string) => {
      this.logger.log(message);
      // 按照 SSE 格式发送数据
      res.raw.write(`data: ${message}\n\n`);
      // Node.js 的 ServerResponse 会自动处理数据发送
    });

    // 设置流程结束的回调
    this.spiderService.setProcessDone(() => {
      this.logger.log('爬虫任务结束');
      // 发送流程结束消息
      res.raw.write(`data: 爬虫任务结束\n\n`);
      // 关闭连接
      res.raw.end();
    });

    try {
      await this.spiderService.doSpider(this.dtoMap.get(taskId)!);
    } catch (error) {
      // 发送错误信息
      res.raw.write(`data: 爬虫过程发生错误: ${error.message}\n\n`);
      // 关闭连接
      res.raw.end();
    } finally {
      this.dtoMap.delete(taskId);
    }
    // 开始爬虫任务
  }

  @Post('doSpider')
  postSpiderData(@Body() doSpiderDto: DoSpiderDto) {
    const taskId = Date.now().toString();
    this.dtoMap.set(taskId, doSpiderDto);
    return { taskId };
  }

  @Post('spiderAsinFromStoreUrl')
  spiderAsinFromStoreUrl(@Body() spiderAsinDto: SpiderAsinDto) {
    return this.spiderService.spiderAsinFromStoreUrl(spiderAsinDto);
  }

  @Get('download')
  async downloadExcel(@Res() reply: FastifyReply) {
    try {
      const fileBuffer = await this.spiderService.downloadExcel();
      if (!fileBuffer) {
        throw new Error('文件读取失败');
      }
      reply
        .header(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ) // Excel MIME 类型
        .header('Content-Disposition', 'attachment; filename=output.xlsx') // 强制下载并指定文件名
        .header('Content-Length', fileBuffer.length) // 可选：文件大小
        .send(fileBuffer); // 发送文件内容
    } catch (error) {
      reply.code(500).send({ error: '文件读取失败' });
    }
  }
}
