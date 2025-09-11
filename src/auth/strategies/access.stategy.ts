import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JWTPayload = {
    sub:number;
    email:string;
    role:string;
}

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
            passReqToCallback: false,// to pass the request object in validate method
        });
    }

    // This method is called after the token is verified
    async validate (payload: JWTPayload): Promise<any> {
        return {
            user_id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}