import { Router } from "express"
import user from "../middleware/user";

import { getUser } from '../controllers/userController'


const router = Router()


router.get('/:username',user, getUser)




export default router