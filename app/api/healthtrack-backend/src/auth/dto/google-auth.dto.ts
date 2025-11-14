import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsNotEmpty({ message: 'Google credential token is required' })
  @IsString({ message: 'Google credential must be a string' })
  credential: string;
}

