import prisma from "../database/db.js";
import fetch from "node-fetch"
import { Provider } from "../../generated/prisma/index.js";




async function sendSms(phone, otp) {
  const resp = await fetch("https://v3.api.termii.com/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      to: phone,
      from: "Prosking",
      sms: `Your OTP is ${otp}`,
      type: "plain",
      channel: "generic"
    })
  });

    if (!resp.ok) {
      throw new Error(`Termii API error: ${resp.status}`);
    }

  return resp.json();
}


export async function sendOtp(phoneNumber) {
  const code = Math.floor(100000 + (Math.random() * 900000)); 
  let numCheck = await prisma.user.findFirst({where: {phoneNumber: phoneNumber}});
  if(!numCheck){
    throw new Error("Phone Number doesn't exist");
    
  }

  let authCheck = await prisma.authProvider.findFirst({
    where: {
      provider: Provider["PHONE"],
      userId: numCheck.id,
    },
  });

  if (authCheck){
    await prisma.authProvider.update({
    where: {id: authCheck.id, provider: Provider["PHONE"]}  ,
    data: {
      provider: Provider["PHONE"],
      providerId: code.toString(),
     
    },
  });
  }else {
    await prisma.authProvider.create({
      data: {
        provider: Provider["PHONE"],
        providerId: code.toString(),
        userId: numCheck.id,
      },
  });
  }
 
  

 setImmediate(async ()=>{
      await sendSms(phoneNumber, code)
 })

  return code;
}


export async function verifyOtp(phoneNumber,code) {
  
  const record = await prisma.authProvider.findFirst({
    where: { provider: Provider["PHONE"], providerId: code },
  });
  
  if (!record) throw new Error("OTP not found");
  
  await prisma.user.update({
    where: {id: record.id},
    data: {
      phoneNumber: phoneNumber
    },
  });
  
  let getUser = await prisma.user.findFirst({
      where: {phoneNumber: phoneNumber},
      
    });
    
  await prisma.authProvider.update({ where: { id: record.id },
  data: {
    providerId: null
  } });
  return {success: true, user: getUser};
}
