import Post from '../models/Post.js';
import User from '../models/User.js';

// Loads a post and checks whether the given viewer (or null, if anonymous) is
// allowed to see it, based on the author's private-account setting.
// Returns { post, author, canView } — post/author are null if the post doesn't exist.
export const checkPostVisibility = async (postId, viewerId) => {
  const post = await Post.findById(postId);
  if (!post) return { post: null, author: null, canView: false };

  const author = await User.findById(post.author).select('preferences followers');
  if (!author) return { post, author: null, canView: false };

  const isOwnPost = viewerId ? author._id.equals(viewerId) : false;
  const isFollowing = viewerId ? author.followers.some((id) => id.equals(viewerId)) : false;
  const canView = isOwnPost || !author.preferences?.privateAccount || isFollowing;

  return { post, author, canView };
};
