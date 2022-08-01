import {DataSource} from "typeorm";
import {Input} from "../entities/input";

let Connection: DataSource;

async function setupConnection(): Promise<DataSource> {
    return new Promise(async (resolve, reject) => {
        let dataSource = new DataSource({
            type: "mysql",
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [
                Input
            ],
            synchronize: true,
        });

        let connection = await dataSource.initialize();
        if (connection) {
            resolve(connection);
            Connection = connection;
        };
    });
};

export {setupConnection as setup, Connection};