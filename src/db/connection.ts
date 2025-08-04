import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    'rhsoft_db',
    'db_jgarcia',
    '990327abc', 
    {
        host: 'localhost',
        port: 5432, 
        dialect: 'postgres'
    }
);

export default sequelize;