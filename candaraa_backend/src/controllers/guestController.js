import prisma from "../database/db.js";


export const getGuestQuestions = async (req, res) => {
    try {
        const questions = await prisma.question.findMany({where: {}});
        
            
            // Shuffle the questions and take up to 10
            const shuffled = questions.sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffled.slice(0, 10).map(({ answer, ...q }) => q); // remove 'answer' field
        
            res.status(200).json({ questions: selectedQuestions });
    } catch (error) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}