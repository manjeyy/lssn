import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            useFactory: () => {
                const secret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET;
                const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';

                if (!secret) {
                    throw new Error(
                        'JWT_ACCESS_SECRET or JWT_SECRET is missing! Set it in .env or environment variables.',
                    );
                }

                return {
                    secret,
                    signOptions: {
                        expiresIn: expiresIn as any,
                    },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
    exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule { }
