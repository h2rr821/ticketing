import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {

    // clear the cookies session
    req.session = null;
    res.send({});
});

export { router as signoutRouter };