import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

//niche ho rhe sbhi kaam stream ke api rule book me defined hai

//stream ke andar ye shakti/function hai jo hmm use kr rhe
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

//upsertUser means update or insert User whi User jo hmne define kra
//ha User.js me but ye stream me chhedchhaz ho rha hai
//const createStreamUser bhi ho skta tha but upsertUser is more appropriate
export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

//dekh basu frontend ko to stream se bhi baat karni hai so uske
//token use ho jata bcoz hm key share nhi krte frontend ke sath
//so stream se frontend baat kaise kre by using the token
export const generateStreamToken = (userId) => {
  try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
};
