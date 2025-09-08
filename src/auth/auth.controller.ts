import { AuthService } from './auth.service';
import { SignInUserDto } from './dto/signIn.dto';
import { RegisterUserDto } from './dto/register.dto';
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDTO: SignInUserDto) {
    return this.authService.signIn(signInDTO);
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerDTO: RegisterUserDto) {
    return this.authService.register(registerDTO);
  }
}
