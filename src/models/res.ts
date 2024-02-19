
export class Res {
    private _statusCode: number;
    private _message: string;
    private _data: {};

    public getRes(): object {
       return {
            statusCode: this._statusCode || 200,
            message: this._message || 'internal error',
            data: this._data || {},
        }
    }

    public get statusCode(): number {
        return this._statusCode;
    }
    
    public set statusCode(statusCode: number) {
        this._statusCode = statusCode;
    }

    public set message(message: string) {
        this._message = message;
    }

    public set data(data: object) {
        this._data = data;
    }
}