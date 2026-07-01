import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import FollowRequest from "../models/FollowRequest.js";
import Message from '../models/Message.js';

const AVATAR_BASE = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';
const COVERS = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=900&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
  'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=900&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80',
  'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?w=900&q=80',
];
const POST_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=700&q=80',
  'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=700&q=80',
];

const USERS = [
  { name: 'Alex Rivera', username: 'alexrivera', bio: 'UI/UX Designer & Creative Director. Building beautiful digital experiences. ✨', verified: true, location: 'San Francisco, CA', website: 'alexrivera.design' },
  { name: 'Priya Sharma', username: 'priyasharma', bio: 'Full Stack Engineer | Open source contributor | Coffee addict ☕', verified: true, location: 'New York, NY', website: 'priya.dev' },
  { name: 'Marcus Chen', username: 'marcuschen', bio: 'Photographer 📸 | Traveler | Documenting life one frame at a time.', verified: false, location: 'Tokyo, Japan', website: 'marcuschen.photo' },
  { name: 'Sofia Reyes', username: 'sofiareyes', bio: 'Product Manager. Building products people love. 🚀', verified: true, location: 'Austin, TX', website: 'sofiar.com' },
  { name: 'Jamal Williams', username: 'jamalw', bio: 'AI researcher & ML engineer. Teaching machines to think since 2018 🤖', verified: true, location: 'Boston, MA', website: 'jamalwilliams.ai' },
  { name: 'Emma Larsson', username: 'emmalarsson', bio: 'Minimalist designer. Less is more. 🌿', verified: false, location: 'Stockholm, Sweden', website: 'emmadesigns.se' },
  { name: 'Ravi Patel', username: 'ravipatel', bio: 'Startup founder | Building the future of fintech 💳', verified: true, location: 'London, UK', website: 'ravipatel.co' },
  { name: 'Zoe Kim', username: 'zoekim', bio: 'Frontend dev by day, anime enthusiast by night 🌸', verified: false, location: 'Seoul, South Korea', website: 'zoekim.dev' },
  { name: 'Diego Morales', username: 'diegomorales', bio: 'Creative coder | Generative art | p5.js enthusiast 🎨', verified: false, location: 'Mexico City, MX', website: 'diegocreates.art' },
  { name: 'Aisha Johnson', username: 'aishajohnson', bio: 'Tech journalist & content creator 📝', verified: true, location: 'Chicago, IL', website: 'aishatech.com' },
];

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Notification.deleteMany({}),
    Conversation.deleteMany({}),
    FollowRequest.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing data');

  const createdUsers = [];
  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i];
    const user = await User.create({
      ...u,
      email: `${u.username}@example.com`,
      password: 'password123',
      avatar: `${AVATAR_BASE}${u.username}`,
      cover: COVERS[i % COVERS.length],
    });
    createdUsers.push(user);
  }
  console.log(`👤 Created ${createdUsers.length} users (password for all: password123)`);

  // Random follows
  for (const user of createdUsers) {
    const others = createdUsers.filter((u) => !u._id.equals(user._id));
    const shuffled = others.sort(() => 0.5 - Math.random());
    const toFollow = shuffled.slice(0, Math.floor(Math.random() * 5) + 2);
    for (const target of toFollow) {
      if (!user.following.some((id) => id.equals(target._id))) {
        user.following.push(target._id);
        target.followers.push(user._id);
        await target.save();
      }
    }
    await user.save();
  }
  console.log('🔗 Created random follow relationships');

  const samplePosts = [
    "Just shipped a massive performance improvement to our production app. Reduced API response time from 800ms to 45ms! 🚀",
    "Golden hour in Kyoto 🌅 Sometimes you just have to put the camera down and breathe it all in.",
    "Hot take: Most companies implementing AI in 2024 are doing it wrong. Data quality > model selection. 🤖",
    "New design system dropped for our client! 6 months of iteration, 200+ components. ✨",
    "Spent the week interviewing senior engineers about the future of remote work. The findings surprised me 🧵",
    "Mentorship advice I wish someone gave me at 22: say yes to uncomfortable opportunities. What would you add? 👇",
    "Product lesson of the week: the feature your users ask for is rarely the feature they need. 🔍",
    "White space is not wasted space. Let the design breathe. 🌿",
    "Rust is winning. Not because it's perfect, but because it forces you to think clearly. 🦀",
    "Accessibility isn't a feature. It's the baseline. 🌍",
  ];

  const createdPosts = [];
  for (let i = 0; i < 25; i++) {
    const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const hasImage = Math.random() > 0.5;
    const post = await Post.create({
      author: author._id,
      content: samplePosts[i % samplePosts.length],
      image: hasImage ? POST_IMAGES[i % POST_IMAGES.length] : '',
      tags: ['webdev', 'design', 'AI', 'startup'].slice(0, Math.floor(Math.random() * 3)),
      createdAt: new Date(Date.now() - i * 1000 * 60 * 90),
    });
    createdPosts.push(post);
  }
  console.log(`📝 Created ${createdPosts.length} posts`);

  // Random likes + comments
  for (const post of createdPosts) {
    const likers = createdUsers.filter(() => Math.random() > 0.5);
    post.likes = likers.map((u) => u._id);
    await post.save();

    const commentCount = Math.floor(Math.random() * 4);
    for (let j = 0; j < commentCount; j++) {
      const commenter = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const comment = await Comment.create({
        post: post._id,
        author: commenter._id,
        content: ['Great point!', 'Totally agree with this 🙌', 'Thanks for sharing!', 'This is so helpful.'][j % 4],
      });
      post.commentsCount += 1;

      if (!post.author.equals(commenter._id)) {
        await Notification.create({
          recipient: post.author,
          sender: commenter._id,
          type: 'comment',
          post: post._id,
          message: 'commented on your post',
        });
      }
    }
    await post.save();

    for (const liker of likers) {
      if (!post.author.equals(liker._id)) {
        await Notification.create({
          recipient: post.author,
          sender: liker._id,
          type: 'like',
          post: post._id,
          message: 'liked your post',
        });
      }
    }
  }
  console.log('💬 Created comments, likes, and notifications');

  // Seed a few sample conversations + messages between demo users
  const sampleConversations = [
    { a: 0, b: 1, lines: [
      [0, "Hey! Loved your last post about performance optimization 🚀"],
      [1, "Thank you! It was a fun problem to dig into."],
      [0, "Would love to pick your brain about caching strategies sometime."],
      [1, "Always happy to chat — let's set something up this week!"],
    ]},
    { a: 2, b: 3, lines: [
      [2, "That product lesson post hit close to home 😅"],
      [3, "Right?? We learn it the hard way every time."],
      [2, "Coffee sometime to swap war stories?"],
    ]},
    { a: 4, b: 9, lines: [
      [4, "Your accessibility post should be required reading honestly"],
      [9, "Appreciate that! More than happy to send you some resources."],
    ]},
  ];

  for (const conv of sampleConversations) {
    const userA = createdUsers[conv.a];
    const userB = createdUsers[conv.b];
    const conversation = await Conversation.create({ participants: [userA._id, userB._id] });

    let lastMessage = null;
    for (let i = 0; i < conv.lines.length; i++) {
      const [senderIdx, text] = conv.lines[i];
      const sender = senderIdx === conv.a ? userA : userB;
      lastMessage = await Message.create({
        conversation: conversation._id,
        sender: sender._id,
        text,
        readBy: [sender._id],
        createdAt: new Date(Date.now() - (conv.lines.length - i) * 1000 * 60 * 12),
      });
    }
    conversation.lastMessage = lastMessage._id;
    conversation.lastMessageAt = lastMessage.createdAt;
    await conversation.save();
  }
  console.log(`💌 Created ${sampleConversations.length} sample conversations`);

  console.log('\n✅ Seed complete!');
  console.log('   Sample login: alexrivera@example.com / password123\n');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
