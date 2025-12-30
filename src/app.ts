import express from 'express'
import { router } from './router';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors'
import { errorHandler } from './middleware/error';

export const app = express();

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/v1',router)

app.use(errorHandler)