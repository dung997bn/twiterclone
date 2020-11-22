class Config {
    private MONGO_URI: string;
    private SECRET: string;
    constructor() {
        this.MONGO_URI = 'mongodb://localhost:27017/twiter-clone?readPreference=primary&appname=MongoDB%20Compass&ssl=false'
        this.SECRET = 'secret'
    }

    public getDbURI(): string {
        return this.MONGO_URI
    }

    public getSecret(): string {
        return this.SECRET
    }

}

export default Config