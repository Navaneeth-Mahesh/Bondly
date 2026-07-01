import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/,
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    bio: { type: String, default: '', maxlength: 160 },
    avatar: { type: String, default: '' },
    cover: { type: String, default: '' },
    location: { type: String, default: '', maxlength: 50 },
    website: { type: String, default: '', maxlength: 100 },
    verified: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    preferences: {
      theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
      privateAccount: { type: Boolean, default: false },
      showActivityStatus: { type: Boolean, default: true },
      allowTagging: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true },
      reduceMotion: { type: Boolean, default: false },
      notifyLikes: { type: Boolean, default: true },
      notifyComments: { type: Boolean, default: true },
      notifyFollows: { type: Boolean, default: true },
      notifyMentions: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    bio: this.bio,
    avatar: this.avatar,
    cover: this.cover,
    location: this.location,
    website: this.website,
    verified: this.verified,
    followersCount: this.followers?.length || 0,
    followingCount: this.following?.length || 0,
    createdAt: this.createdAt,
    preferences: this.preferences,
  };
};

export default mongoose.model('User', userSchema);
