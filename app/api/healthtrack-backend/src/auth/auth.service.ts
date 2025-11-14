import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from '@core/services/user.service';
import type { GoogleProfileDto } from '@core/services/user.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Initialize Google OAuth client
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (clientId) {
      this.googleClient = new OAuth2Client(clientId);
    }
  }

  /**
   * Generate JWT tokens for a user
   */
  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '7d',
    });

    // For refresh token, use a longer expiration
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify Google OAuth token and extract user profile
   */
  async verifyGoogleToken(credential: string): Promise<GoogleProfileDto> {
    if (!this.googleClient) {
      throw new UnauthorizedException(
        'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in environment variables.',
      );
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      // Extract user information from Google payload
      return {
        googleId: payload.sub,
        email: payload.email || '',
        firstName: payload.given_name,
        lastName: payload.family_name,
        profileImage: payload.picture,
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid Google token. Please try again.',
      );
    }
  }
}

