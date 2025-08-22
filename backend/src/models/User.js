import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      default: "",
    },
    learningLanguage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// pre-save hook to hash password before saving user
userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return next();

  // hashing the password before saving
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();

  } catch (error) {
    next(error);
  }
});

//ye normal fuction jaisa hai but with some superpowers which is bina newUser model pass kiye bhi apun current document
//data access kar sakta hai; eg:- this.password; ye special funcion hai to defining bhi alag hai
userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
  return isPasswordCorrect;//returning bollean value
};

//userSchema ka dacha dekh ke User bhi waisa hi bna, userSchema ki shaktiyo ko transfer kr de User me 
const User = mongoose.model("User", userSchema);

export default User;
