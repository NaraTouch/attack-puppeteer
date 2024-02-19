import { IsNotEmpty } from 'class-validator';

export class Req {
    @IsNotEmpty({ message: 'accounts is required' })
    accounts: string;
}
