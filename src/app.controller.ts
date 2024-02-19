import { Controller, Get, Post, HttpCode, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Req } from './models/req'; 

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('/attack')
  @HttpCode(200)
  attack(@Body() body: Req) {
      return this.appService.attack(body);
  }

}
