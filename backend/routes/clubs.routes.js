const express= require('express');
const router=express.Router();
const db=require('../config/db');
const verifyToken=require('../middleware/auth.middleware');

//=================== GET ALL CLUBS =================
router.get('/',async(req,res)=>{
    try{
        const [clubs]=await db.query('select * from clubs');
        return res.status(200).json({
            message:'clubs feched successfully',
            clubs: clubs
        })
    }catch(error){
        console.error('get clubs error', error);
        return res.status(500).json({
            message: 'Server error'
        });
    }       
        })
//========create a new club=================
router.post('/',verifyToken,async(req,res)=>{
    try{
        const {name, description}=req.body;
        if(!name){
            return res.status(400).json({
                message:'name is required'
            })
        }
        const [result]=await db.query(
            'insert into clubs (name, description) values (?,?)',
            [name, description]
        );
        return res.status(201).json({
            message: 'Club created successfully',
            club: result
        });
    } catch (error) {
        console.error('create club error', error);
        return res.status(500).json({
            message: 'Server error'
        });
    }
});
//======join a club=================
router.post('/:clubId/join',verifyToken,async(req,res)=>{
    try{
        const clubId=req.params.clubId;
        const userId=req.user.id;
        //check if club exists
        const [clubs]=await db.query(
            'select * from clubs where id=?',
            [clubId]
        );
        if (clubs.length===0){
            return res.status(404).json({
                message:'clubs not found'
            })
        }
        //add user to club
        await db.query(
            'insert into club_members (club_id, user_id) values(?,?)',
            [clubId, userId]
        );
        return res.status(201).json({
            message: 'successfully joined the club'
        });} catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    message: 'User already joined the club'
                });
            }   
        console.error('join club error', error);
        return res.status(500).json({
            message: 'Server error'
        });
    }

    
});
//======get my clubs=================
router.get('/myclubs',verifyToken,async(req,res)=>{
    try{
        const userId=req.user.id;
        const [clubs]=await db.query(
            'select clubs.id, clubs.name, clubs.description, club_members.joined_at from clubs join club_members on clubs.id = club_members.club_id where club_members.user_id = ?',
            [userId]
        );
        return res.status(200).json({
            message: 'My clubs fetched successfully',
            clubs: clubs
        });
    } catch (error) {
        console.error('get my clubs error', error);
        return res.status(500).json({
            message: 'Server error'
        });
    }
});
//========leave a club=================
router.delete('/:clubId/leave',verifyToken,async(req,res)=>{
    try{
        const clubId=req.params.clubId;
        const userId=req.user.id;
        const[result]=await db.query(
            'delete from club_members where club_id=? and user_id=?',
            [clubId, userId]
        );
        if (result.affectedRows===0){
            return res.status(404).json({
                message: 'User is not a member of this club'
            });
        }
        return res.status(200).json({
            message: 'Successfully left the club'
        });
    } catch (error) {
        console.error('leave club error', error);
        return res.status(500).json({
            message: 'Server error'
        });
    }
});


module.exports=router;

