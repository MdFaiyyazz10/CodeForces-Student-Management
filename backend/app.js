import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/database.js'

import  './utils/cron-job.js'


dotenv.config({
    path: './config/config.env'
})
const app = express()

connectDB()

// midddleware
app.use(cookieParser())
app.use(express.json())

app.use(cors({
    origin: [process.env.FRONTEND_URL , process.env.BACKEND_URL],
    methods: ["GET", "POST","PUT" ,"DELETE"],
    credentials: true,
}))

app.get('/' , (req,res,next) => {
    res.send('<h1>Working</h1>')
})

//  Routes

import studentRoutes from './routes/student.js'

app.use('/api/v1/student' , studentRoutes)


app.listen(process.env.PORT , ()=> {
    console.log(`Server is Running on PORT:${process.env.PORT}`)
})