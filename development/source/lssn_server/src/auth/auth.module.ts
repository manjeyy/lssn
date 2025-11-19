import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            useFactory: () => {
                const secret = process.env.JWT_SECRET;
                const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

                if (!secret) {
                    throw new Error(
                        'JWT_SECRET is missing! Set it in .env or environment variables.',
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
    providers: [AuthService, JwtStrategy, JwtAuthGuard, PermissionsGuard],
    exports: [AuthService, JwtAuthGuard, PermissionsGuard, JwtModule],
})
export class AuthModule { }
