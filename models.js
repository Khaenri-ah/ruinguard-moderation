import mongoose from 'mongoose';

export default {
  Mute: new mongoose.Schema({
    guild: String,
    user: String,
    until: Number,
  }),
  Config: new mongoose.Schema({
    guild: String,
    muterole: String,
  }),
};
