import { Router } from "express";
import { createComment, createPost, fetchComments, fetchPosts, getPost } from "../controllers/postController";
import auth from "../middleware/auth";
import user from "../middleware/user";

const router = Router()

router.route('/')
    .post(user,auth,createPost)
    .get(user,fetchPosts)

router.get('/:postId/:slug',user,getPost)

router.get('/:postId/:slug/comment',user,fetchComments)
router.post('/:postId/:slug/comment',user,auth,createComment)
export default router