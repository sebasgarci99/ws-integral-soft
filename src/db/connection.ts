import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    'rhsoft_db',
    'db_jgarcia',
    '990327abc', 
    {
        host: '72.60.24.55',
        port: 5432, 
        dialect: 'postgres'
    }
);

export default sequelize;