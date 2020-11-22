import mongoose from 'mongoose';
import Config from './config';

const config = new Config()
class Database {
    constructor() {
        this.connect()
    }
    connect() {
        mongoose.connect(config.getDbURI(), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
            .then(() => {
                console.log('Mongodb connected');
            }).catch((err) => {
                console.log('error when connecting to mongodb ' + err);
            })
    }
}
export default Database