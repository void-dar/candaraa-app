import twilio from "twilio";
import prisma from "../database/db.js";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);


export async function sendOtp(phoneNumber, user) {
  const code = Math.floor(100000 + Math.random() * 900000); 
  let numCheck = await prisma.user.findFirst({where: {phoneNumber: phoneNumber}});
  if(numCheck){
    return "Phone number already exists"
  }

  await prisma.authProvider.create({
    data: {
      provider: "PHONE",
      providerId: code.toString(),
      userId: user.id,
    },
  });
  

  await client.messages.create({
    body: `Your OTP code is ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });

  return code;
}


export async function verifyOtp(phoneNumber,code, user) {
  let userId = user.id;
  const record = await prisma.authProvider.findFirst({
    where: { provider: "PHONE", providerId: code, userId: {userId} },
  });
  
  if (!record) return null;
  await prisma.user.update({
    where: {id: user.id},
    data: {
      phoneNumber: phoneNumber
    },
  });
  

  
  await prisma.authProvider.delete({ where: { id: record.id } });
  return true;
}
