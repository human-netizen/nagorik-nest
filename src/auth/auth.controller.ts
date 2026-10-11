
import { Body, Controller, Post, UseGuards, Get, Req } from '@nestjs/common';

import type { Request } from 'express';

import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
	@Post('login')
	login(@Body() loginDto: LoginDto) {
	return this.authService.login(loginDto);
	}
	@UseGuards(JwtAuthGuard)
	@Get('me')
	getMe(@Req() request: Request) {
		return request.user;
	}
}
