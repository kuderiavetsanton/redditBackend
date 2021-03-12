import { Router } from "express";
import { createSub, fetchSub, fetchSubPosts, searchSub, uploadSubImage } from "../controllers/subController";
import auth from "../middleware/auth";
import user from "../middleware/user";

import { upload, ownSub} from '../middleware/subMiddlware'

const router = Router()

router.route('/')
    .post(user,auth,createSub)
    
router.get('/search/:name',user,searchSub)
router.get('/:name',user,fetchSub)
router.get('/:name/posts',user,fetchSubPosts)
router.post('/:name/image',user,auth,upload.single('file'),ownSub,uploadSubImage)



export default router