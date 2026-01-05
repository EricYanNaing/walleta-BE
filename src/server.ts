import {app} from './app'
import dotenv from 'dotenv'

dotenv.config();
const port = Number(process.env.PORT)|| 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    console.log("DB host:", new URL(process.env.DATABASE_URL!).host);
console.log("Direct host:", new URL(process.env.DIRECT_URL!).host);
})