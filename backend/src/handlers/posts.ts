import { Router } from "express";
import { ObjectId } from "mongodb";
import "../types/session";

export default function mountPostsEndpoints(router: Router) {
  // Create a new post
  router.post("/create", async (req, res) => {
    if (!req.session.currentUser) {
      return res
        .status(401)
        .json({
          error: "unauthorized",
          message: "User needs to sign in first",
        });
    }

    const {
      title,
      description,
      price,
      fullContent,
      thumbnailURL,
      fullContentURL,
      tags,
      contentType,
    } = req.body;

    if (!title || !description || !price || !fullContent) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const app = req.app;
    const postsCollection = app.locals.postsCollection;
    const currentUser = req.session.currentUser;

    try {
      const newPost = {
        creatorId: currentUser.uid,
        creatorName: currentUser.username,
        creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
        title,
        description,
        price: parseFloat(price),
        fullContent,
        thumbnailURL:
          thumbnailURL ||
          "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400",
        fullContentURL: fullContentURL || null,
        tags: tags || [],
        contentType: contentType || "text",
        likes: 0,
        comments: 0,
        createdAt: new Date(),
      };

      const result = await postsCollection.insertOne(newPost);

      return res.status(201).json({
        message: "Post created successfully",
        postId: result.insertedId,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ error: "Failed to create post" });
    }
  });

  // List all posts (preview data only - no full content)
  router.get("/list", async (req, res) => {
    const app = req.app;
    const postsCollection = app.locals.postsCollection;

    try {
      const posts = await postsCollection
        .find({})
        .project({
          _id: 1,
          creatorId: 1,
          creatorName: 1,
          creatorAvatar: 1,
          title: 1,
          description: 1,
          price: 1,
          contentType: 1,
          thumbnailURL: 1,
          likes: 1,
          comments: 1,
          tags: 1,
          createdAt: 1,
        })
        .sort({ createdAt: -1 })
        .toArray();

      const formattedPosts = posts.map((post: any) => ({
        id: post._id.toString(),
        creatorId: post.creatorId,
        creatorName: post.creatorName,
        creatorAvatar: post.creatorAvatar,
        title: post.title,
        description: post.description,
        price: post.price,
        contentType: post.contentType,
        thumbnailURL: post.thumbnailURL,
        likes: post.likes,
        comments: post.comments,
        tags: post.tags,
        createdAt: getTimeAgo(post.createdAt),
        isPurchased: false,
      }));

      return res.status(200).json({ posts: formattedPosts });
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get full content for a post (only if user purchased it or is the creator)
  router.get("/:postId/full", async (req, res) => {
    if (!req.session.currentUser) {
      return res
        .status(401)
        .json({
          error: "unauthorized",
          message: "User needs to sign in first",
        });
    }

    const { postId } = req.params;
    const app = req.app;
    const postsCollection = app.locals.postsCollection;
    const orderCollection = app.locals.orderCollection;
    const currentUser = req.session.currentUser;

    try {
      const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Check if user is the creator
      const isCreator = post.creatorId === currentUser.uid;

      // Check if user has purchased the post
      const hasPurchased = await orderCollection.findOne({
        product_id: postId,
        user: currentUser.uid,
        paid: true,
        cancelled: false,
      });

      if (!isCreator && !hasPurchased) {
        return res
          .status(403)
          .json({ error: "forbidden", message: "You don't own this content" });
      }

      // Return full post data
      const fullPost = {
        id: post._id.toString(),
        creatorId: post.creatorId,
        creatorName: post.creatorName,
        creatorAvatar: post.creatorAvatar,
        title: post.title,
        description: post.description,
        price: post.price,
        contentType: post.contentType,
        thumbnailURL: post.thumbnailURL,
        fullContentURL: post.fullContentURL,
        fullContent: post.fullContent,
        likes: post.likes,
        comments: post.comments,
        tags: post.tags,
        createdAt: getTimeAgo(post.createdAt),
        isPurchased: true,
      };

      return res.status(200).json(fullPost);
    } catch (error) {
      console.error("Error fetching full post:", error);
      return res.status(500).json({ error: "Failed to fetch post" });
    }
  });
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval}${unit[0]} ago`;
    }
  }

  return "just now";
}
