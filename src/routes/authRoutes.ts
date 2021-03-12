import Router from 'express'
import { login, logout, me, register } from '../controllers/authController'
import user from '../middleware/user'

const router = Router()

router.route('/')
    .post(register)

router.route('/login')
    .post(login)

router.get('/me',user,me)
router.get('/logout',logout)

export default router