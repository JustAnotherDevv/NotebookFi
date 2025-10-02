import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Lock,
  Unlock,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Image,
  Video,
  FileText,
  X,
  Loader2,
  Users,
  CheckCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MotionCard = motion(Card);
const MotionButton = motion(Button);

type User = {
  uid: string;
  username: string;
  avatar?: string;
  isCreator?: boolean;
};

type AuthResult = {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
};

type PaymentDTO = {
  amount: number;
  user_uid: string;
  created_at: string;
  identifier: string;
  metadata: Object;
  memo: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  to_address: string;
  transaction: null | {
    txid: string;
    verified: boolean;
    _link: string;
  };
};

type ContentPost = {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  title: string;
  description: string;
  price: number;
  contentType: "image" | "video" | "text" | "mixed";
  thumbnailURL?: string;
  likes: number;
  comments: number;
  isPurchased: boolean;
  createdAt: string;
  tags: string[];
};

type FullContentPost = ContentPost & {
  fullContentURL?: string;
  fullContent?: string;
};

type Creator = {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  postsCount: number;
  totalEarnings: number;
  verified: boolean;
  specialization: string;
};

interface WindowWithEnv extends Window {
  __ENV?: {
    backendURL: string;
    sandbox: "true" | "false";
  };
  Pi?: {
    init: (config: { version: string; sandbox: boolean }) => Promise<void>;
    authenticate: (
      scopes: string[],
      onIncompletePaymentFound: (payment: PaymentDTO) => void
    ) => Promise<AuthResult>;
    createPayment: (paymentData: any, callbacks: any) => Promise<any>;
  };
}

const _window: WindowWithEnv = window as WindowWithEnv;
const backendURL = _window.__ENV?.backendURL || "http://localhost:8000";

const axiosClient = axios.create({
  baseURL: `${backendURL}`,
  timeout: 20000,
  withCredentials: true,
});

const config = {
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};

const mockCreators: Creator[] = [
  {
    id: "1",
    username: "ArtisticMind",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArtisticMind",
    bio: "Digital artist specializing in cyberpunk and futuristic themes. Creating unique NFT collections.",
    followers: 12500,
    postsCount: 47,
    totalEarnings: 3420,
    verified: true,
    specialization: "Digital Art",
  },
  {
    id: "2",
    username: "TechGuru",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechGuru",
    bio: "Senior developer sharing advanced programming tutorials and real-world coding solutions.",
    followers: 28900,
    postsCount: 156,
    totalEarnings: 8750,
    verified: true,
    specialization: "Programming",
  },
  {
    id: "3",
    username: "MusicVibes",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MusicVibes",
    bio: "Independent musician offering exclusive tracks and behind-the-scenes content.",
    followers: 15600,
    postsCount: 89,
    totalEarnings: 5200,
    verified: true,
    specialization: "Music",
  },
  {
    id: "4",
    username: "FitnessCoach",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FitnessCoach",
    bio: "Certified personal trainer providing workout plans and nutrition guides.",
    followers: 9800,
    postsCount: 112,
    totalEarnings: 4100,
    verified: false,
    specialization: "Fitness",
  },
  {
    id: "5",
    username: "DesignMaster",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DesignMaster",
    bio: "UX/UI designer sharing premium design resources and masterclasses.",
    followers: 18200,
    postsCount: 73,
    totalEarnings: 6890,
    verified: true,
    specialization: "Design",
  },
  {
    id: "6",
    username: "CryptoExpert",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoExpert",
    bio: "Blockchain analyst providing market insights and trading strategies.",
    followers: 34500,
    postsCount: 201,
    totalEarnings: 12400,
    verified: true,
    specialization: "Crypto",
  },
];

function AppHeader({
  user,
  onSignIn,
  onSignOut,
}: {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 py-4">
        <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          {/* Pi Social */}
          <img className="w-12 h-12" src="/_notebookfi.png" alt="logo" />
        </h1>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <>
              {user.isCreator && (
                <Dialog
                  open={createDialogOpen}
                  onOpenChange={setCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <MotionButton
                      className="bg-purple-600 hover:bg-purple-700 h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Create</span>
                    </MotionButton>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <CreatePostForm
                      user={user}
                      onSuccess={() => setCreateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-purple-500">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-purple-600 text-xs">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs sm:text-sm text-gray-300">
                  @{user.username}
                </span>
              </div>
              <MotionButton
                variant="ghost"
                onClick={onSignOut}
                className="text-gray-300 hover:text-white h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Out
              </MotionButton>
            </>
          ) : (
            <MotionButton
              onClick={onSignIn}
              className="bg-purple-600 hover:bg-purple-700 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </MotionButton>
          )}
        </div>
      </div>
    </motion.header>
  );
}

function CreatePostForm({
  user,
  onSuccess,
}: {
  user: User;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [thumbnailURL, setThumbnailURL] = useState("");
  const [fullContentURL, setFullContentURL] = useState("");
  const [tags, setTags] = useState("");
  const [contentType, setContentType] = useState<
    "image" | "video" | "text" | "mixed"
  >("text");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !price || !fullContent) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/posts/create", {
        title,
        description,
        price: parseFloat(price),
        fullContent,
        thumbnailURL:
          thumbnailURL ||
          "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400",
        fullContentURL,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        contentType,
      });

      alert("Post created successfully!");
      onSuccess();

      setTitle("");
      setDescription("");
      setPrice("");
      setFullContent("");
      setThumbnailURL("");
      setFullContentURL("");
      setTags("");
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to create post:", error);
      alert(
        "Failed to create post: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogHeader>
      <DialogTitle className="text-xl sm:text-2xl mb-4">
        Create New Post
      </DialogTitle>
      <DialogDescription asChild>
        <div className="space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-2 block">
              Title *
            </label>
            <Input
              placeholder="Give your content a catchy title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-2 block">
              Preview Description *
            </label>
            <Textarea
              placeholder="Short description shown to everyone..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white min-h-[60px] text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-2 block">
              Full Content * (Locked)
            </label>
            <Textarea
              placeholder="Full content only shown after purchase..."
              value={fullContent}
              onChange={(e) => setFullContent(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white min-h-[100px] text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-2 block">
              Price (π) *
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-2 block">
              Thumbnail Image URL
            </label>
            <Input
              placeholder="https://example.com/thumbnail.jpg"
              value={thumbnailURL}
              onChange={(e) => setThumbnailURL(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-2 block">
              Full Content Image URL
            </label>
            <Input
              placeholder="https://example.com/full-image.jpg"
              value={fullContentURL}
              onChange={(e) => setFullContentURL(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-2 block">
              Tags (comma separated)
            </label>
            <Input
              placeholder="art, digital, nft"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-2 block">
              Content Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              <MotionButton
                type="button"
                variant={contentType === "image" ? "default" : "outline"}
                onClick={() => setContentType("image")}
                className={
                  contentType === "image"
                    ? "bg-purple-600"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white text-xs"
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Image
              </MotionButton>
              <MotionButton
                type="button"
                variant={contentType === "video" ? "default" : "outline"}
                onClick={() => setContentType("video")}
                className={
                  contentType === "video"
                    ? "bg-purple-600"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white text-xs"
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Video
              </MotionButton>
              <MotionButton
                type="button"
                variant={contentType === "text" ? "default" : "outline"}
                onClick={() => setContentType("text")}
                className={
                  contentType === "text"
                    ? "bg-purple-600"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white text-xs"
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Text
              </MotionButton>
              <MotionButton
                type="button"
                variant={contentType === "mixed" ? "default" : "outline"}
                onClick={() => setContentType("mixed")}
                className={
                  contentType === "mixed"
                    ? "bg-purple-600"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700 text-white text-xs"
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mixed
              </MotionButton>
            </div>
          </div>

          <MotionButton
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 mt-4 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Publish Content"
            )}
          </MotionButton>
        </div>
      </DialogDescription>
    </DialogHeader>
  );
}

function ContentViewModal({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const [post, setPost] = useState<FullContentPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullContent = async () => {
      try {
        const response = await axiosClient.get(`/posts/${postId}/full`);
        setPost(response.data);
      } catch (error) {
        console.error("Failed to fetch full content:", error);
        alert("Failed to load content. You may not own this post.");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchFullContent();
  }, [postId]);

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!post) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl">
              {post.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription asChild>
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.creatorAvatar} />
                  <AvatarFallback>{post.creatorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {post.creatorName}
                  </p>
                  <p className="text-xs text-gray-400">{post.createdAt}</p>
                </div>
              </div>

              {post.fullContentURL && (
                <img
                  src={post.fullContentURL}
                  alt={post.title}
                  className="w-full rounded-lg"
                />
              )}

              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-200 text-sm sm:text-base whitespace-pre-wrap">
                  {post.fullContent}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-gray-800 text-gray-300 text-xs"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                <button className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function ContentCard({
  post,
  onPurchase,
  onViewContent,
}: {
  post: ContentPost;
  onPurchase: (postId: string, price: number) => void;
  onViewContent: (postId: string) => void;
}) {
  const handleCardClick = () => {
    if (post.isPurchased) {
      onViewContent(post.id);
    }
  };

  return (
    <MotionCard
      className={`bg-primary border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all relative shine-effect ${
        post.isPurchased ? "cursor-pointer" : ""
      }`}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <img
          src={post.thumbnailURL}
          alt={post.title}
          className={`w-full h-48 sm:h-64 object-cover ${
            !post.isPurchased && "blur-sm"
          }`}
        />
        {!post.isPurchased && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center px-4">
              <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-semibold text-base sm:text-lg">
                Unlock for {post.price}π
              </p>
            </div>
          </div>
        )}
        {post.isPurchased && (
          <Badge className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-600 text-xs">
            <Unlock className="w-3 h-3 mr-1" />
            Purchased
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={post.creatorAvatar} />
            <AvatarFallback className="text-xs">
              {post.creatorName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-white text-sm sm:text-base">
              {post.creatorName}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400">
              {post.createdAt}
            </p>
          </div>
        </div>
        <CardTitle className="text-base sm:text-xl text-white leading-tight">
          {post.title}
        </CardTitle>
        <CardDescription className="text-gray-400 text-xs sm:text-sm line-clamp-2">
          {post.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-gray-800 text-gray-300 text-[10px] sm:text-xs"
            >
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-800">
          <div className="flex gap-3 sm:gap-4 text-gray-400">
            <motion.button
              className="flex items-center gap-1 hover:text-pink-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{post.likes}</span>
            </motion.button>
            <motion.button
              className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{post.comments}</span>
            </motion.button>
            <motion.button
              className="flex items-center gap-1 hover:text-green-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>
          </div>

          {!post.isPurchased ? (
            <MotionButton
              onClick={(e) => {
                e.stopPropagation();
                onPurchase(post.id, post.price);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {post.price}π
            </MotionButton>
          ) : (
            <MotionButton
              variant="outline"
              className="border-gray-700 text-gray-300 h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View
            </MotionButton>
          )}
        </div>
      </CardContent>
    </MotionCard>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <MotionCard
      className="bg-primary border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all relative shine-effect"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-purple-500">
              <AvatarImage src={creator.avatar} />
              <AvatarFallback className="text-lg">
                {creator.username[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  @{creator.username}
                </h3>
                {creator.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <Badge className="bg-purple-600/20 text-purple-300 text-xs mt-1">
                {creator.specialization}
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm mt-3">{creator.bio}</p>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-white">
              {(creator.followers / 1000).toFixed(1)}K
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-white">
              {creator.postsCount}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-xl font-bold text-purple-400">
              {(creator.totalEarnings / 1000).toFixed(1)}K π
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400">Earned</p>
          </div>
        </div>

        <MotionButton
          className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Users className="w-4 h-4 mr-2" />
          Follow
        </MotionButton>
      </CardContent>
    </MotionCard>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserPurchases();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const response = await axiosClient.get("/posts/list");
      setPosts(response.data.posts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const response = await axiosClient.get("/payments/purchases");
      const purchasedPostIds = response.data.purchases.map(
        (p: any) => p.product_id
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          isPurchased: purchasedPostIds.includes(post.id),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
    }
  };

  const onIncompletePaymentFound = (payment: PaymentDTO) => {
    console.log("onIncompletePaymentFound", payment);
    return axiosClient.post("/payments/incomplete", { payment });
  };

  const onReadyForServerApproval = (paymentId: string) => {
    console.log("onReadyForServerApproval", paymentId);
    axiosClient.post("/payments/approve", { paymentId }, config);
  };

  const onReadyForServerCompletion = (
    paymentId: string,
    txid: string,
    postId: string
  ) => {
    console.log("onReadyForServerCompletion", paymentId, txid);
    axiosClient
      .post("/payments/complete", { paymentId, txid }, config)
      .then(() => {
        fetchUserPurchases();
      });
  };

  const onCancel = (paymentId: string) => {
    console.log("onCancel", paymentId);
    return axiosClient.post("/payments/cancelled_payment", { paymentId });
  };

  const onError = (error: Error, payment?: PaymentDTO) => {
    console.log("onError", error);
    if (payment) {
      console.log(payment);
    }
  };

  const handleSignIn = async () => {
    try {
      console.log("Pi SDK available:", !!_window.Pi);

      if (!_window.Pi) {
        const mockUser = {
          uid: "dev_user_" + Date.now(),
          username: "developer",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=developer",
          isCreator: true,
        };
        setUser(mockUser);
        console.log("Using mock authentication:", mockUser);
        return;
      }

      console.log("Initializing Pi SDK...");
      await _window.Pi.init({
        version: "2.0",
        sandbox: _window.__ENV?.sandbox === "true",
      });
      console.log("Pi SDK initialized successfully");

      const scopes = ["username", "payments"];
      console.log("Calling Pi.authenticate with scopes:", scopes);

      const authResult: AuthResult = await _window.Pi.authenticate(
        scopes,
        onIncompletePaymentFound
      );
      console.log("Authentication successful:", authResult);

      try {
        await axiosClient.post("/user/signin", { authResult });
        console.log("Backend signin successful");
      } catch (backendError) {
        console.error(
          "Backend signin error (continuing anyway):",
          backendError
        );
      }

      setUser({
        ...authResult.user,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authResult.user.username}`,
        isCreator: true,
      });

      console.log("User signed in:", authResult.user);
    } catch (error: any) {
      console.error("Sign in error:", error);
      alert(
        `Failed to sign in with Pi.\n\nError: ${
          error.message || "Unknown error"
        }`
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await axiosClient.get("/user/signout");
      setUser(null);
      fetchPosts();
      console.log("User signed out");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handlePurchase = async (postId: string, price: number) => {
    if (!user) {
      alert("Please sign in to purchase content");
      return;
    }

    console.log("Attempting purchase:", { postId, price });

    if (!_window.Pi) {
      console.log("Pi SDK not available, using mock payment");
      alert(`Mock Payment: Would pay ${price}π for post ${postId}`);

      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, isPurchased: true } : post
        )
      );
      return;
    }

    try {
      const post = posts.find((p) => p.id === postId);
      const paymentData = {
        amount: price,
        memo: `Unlock: ${post?.title || postId}`,
        metadata: { productId: postId, contentType: post?.contentType },
      };

      console.log("Creating payment with data:", paymentData);

      const callbacks = {
        onReadyForServerApproval,
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          onReadyForServerCompletion(paymentId, txid, postId);
        },
        onCancel,
        onError,
      };

      const payment = await _window.Pi.createPayment(paymentData, callbacks);
      console.log("Payment created:", payment);
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(
        `Failed to create payment.\n\nError: ${
          error.message || "Unknown error"
        }`
      );
    }
  };

  const handleViewContent = (postId: string) => {
    setViewingPostId(postId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 w-screen">
      <style>{`
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        .shine-effect::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.03) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(45deg);
          animation: shine 4s infinite;
        }
        @keyframes shine {
          0% {
            transform: translateX(-200%) translateY(-200%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
          }
        }
      `}</style>

      <AppHeader
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <motion.div
          className="relative h-48 sm:h-60 bg-primary overflow-hidden rounded-md border border-gray-700 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "relative",
            isolation: "isolate",
          }}
        >
          <div
            style={{
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage:
                'url("https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.3,
              zIndex: -1,
            }}
          />
          <motion.div
            className="absolute inset-0 bg-gray-800"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
              opacity: [0.2, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-6">
            <motion.h1
              className="text-3xl sm:text-4xl font-bold mb-2 text-gray-200"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Welcome to Pi Social */}
              Welcome to NotebookFi
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Discover exclusive content, powered by Pi Network
            </motion.p>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-900 border border-gray-800 mb-4 sm:mb-8 w-full sm:w-auto">
            <TabsTrigger
              value="feed"
              className="data-[state=active]:bg-purple-600 text-xs sm:text-sm flex-1 sm:flex-none"
            >
              Feed
            </TabsTrigger>
            <TabsTrigger
              value="purchased"
              className="data-[state=active]:bg-purple-600 text-xs sm:text-sm flex-1 sm:flex-none"
            >
              Purchased
            </TabsTrigger>
            <TabsTrigger
              value="creators"
              className="data-[state=active]:bg-purple-600 text-xs sm:text-sm flex-1 sm:flex-none"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Creators
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-4 sm:space-y-6">
            <motion.div
              className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {posts.map((post) => (
                <ContentCard
                  key={post.id}
                  post={post}
                  onPurchase={handlePurchase}
                  onViewContent={handleViewContent}
                />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="purchased" className="space-y-4 sm:space-y-6">
            <motion.div
              className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <AnimatePresence>
                {posts
                  .filter((post) => post.isPurchased)
                  .map((post) => (
                    <ContentCard
                      key={post.id}
                      post={post}
                      onPurchase={handlePurchase}
                      onViewContent={handleViewContent}
                    />
                  ))}
              </AnimatePresence>
            </motion.div>
            {posts.filter((post) => post.isPurchased).length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-base sm:text-lg">
                  No purchased content yet
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Start exploring and unlock amazing content!
                </p>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="creators" className="space-y-4 sm:space-y-6">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Top Creators
              </h2>
              <p className="text-gray-400 text-sm">
                Discover talented creators and support their work
              </p>
            </motion.div>
            <motion.div
              className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {mockCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {viewingPostId && (
        <ContentViewModal
          postId={viewingPostId}
          onClose={() => setViewingPostId(null)}
        />
      )}
    </div>
  );
}
