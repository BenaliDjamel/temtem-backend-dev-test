import { AuthService } from './auth.service';
import { SignInUserDto } from './dto/signIn.dto';
import { RegisterUserDto } from './dto/register.dto';
import { Public } from '../common/metadata/public.decorator';
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return JWT' })
  signIn(@Body() signInDTO: SignInUserDto) {
    return this.authService.signIn(signInDTO);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() registerDTO: RegisterUserDto) {
    return this.authService.register(registerDTO);
  }
}
