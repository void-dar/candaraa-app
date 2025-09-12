import prisma from "../database/db.js";
import { calculateLevel } from "../helpers/level.js";
import { actionRewards } from "../helpers/rewards.js";


export const getGuestQuestions = async (req, res) => {
    try {
        const questions = await prisma.question.findMany({where: {}});
        
            
            // Shuffle the questions and take up to 10
            const shuffled = questions.sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffled.slice(0, 10); // remove 'answer' field
        
            res.status(200).json({ questions: selectedQuestions });
    } catch (error) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const answerQuestion = async (req, res) => {
    try {
        const { questionId, answer } = req.body;


        const question = await prisma.question.findUnique({ where: { id: questionId } });
        if (!question) return res.status(404).json({ success: false, message: "Question not found" });

       

    
    

        if (answer.toString() === question.answer) {
            let points = 0;
            

            // Assign rewards based on difficulty
            const reward = actionRewards[question.difficulty];
            
            points = reward.points;
            


            const newPoints = points;
            const newLevel = calculateLevel(newPoints);
            

            
            

            res.status(200).json({
                answer: answer === question.answer,
                points: newPoints,
                level: newLevel
                
            });

        }else {
            res.status(200).json({
                success: false,
                answer: false
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}