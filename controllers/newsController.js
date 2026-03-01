const News = require('../models/News');
const Reaction = require('../models/Reaction');

const createNews = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const authorName = req.user?.fullName || req.user?.email || req.body.author;

    const news = new News({
      title,
      content,
      author: authorName || 'Unknown',
    });
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Helper to sync embedded reactions on a News document from the Reaction collection
const syncNewsReactions = async (newsId) => {
  const [news, reactions] = await Promise.all([
    News.findById(newsId),
    Reaction.find({ news: newsId }).select('user type reactedAt'),
  ]);

  if (!news) return null;

  news.reactions = reactions.map((r) => ({
    user: r.user,
    type: r.type,
    reactedAt: r.reactedAt,
  }));

  await news.save();
  return news;
};

const getAllNews = async (req, res) => {
  try {
    const newsList = await News.find().sort({ pinned: -1, publishedAt: -1, createdAt: -1 });
    res.json(newsList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPinnedNews = async (req, res) => {
  try {
    const newsList = await News.find({ pinned: true }).sort({ pinnedAt: -1, publishedAt: -1, createdAt: -1 });
    res.json(newsList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyNews = async (req, res) => {
  try {
    const authorName = req.user?.fullName || req.user?.email;
    if (!authorName) {
      return res.status(400).json({ error: 'Unable to determine current user name' });
    }
    const newsList = await News.find({ author: authorName }).sort({ pinned: -1, publishedAt: -1, createdAt: -1 });
    res.json(newsList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const publishNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { published: true, publishedAt: Date.now() },
      { new: true }
    );
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const pinNews = async (req, res) => {
  try {
    const { pinned = true } = req.body;
    const update = {
      pinned,
      pinnedBy: pinned ? req.user?.id : null,
      pinnedAt: pinned ? Date.now() : null,
    };
    const news = await News.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get reactions for a news item with user details
const getReactions = async (req, res) => {
  try {
    const reactions = await Reaction.find({ news: req.params.id })
      .populate('user', 'fullName firstName lastName email')
      .select('type reactedAt user');

    const mapped = reactions.map((r) => {
      const user = r.user || {};
      const name =
        user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Unknown user';
      return {
        id: r._id,
        type: r.type,
        reactedAt: r.reactedAt,
        user: {
          id: user._id || user.id,
          name,
          email: user.email || null,
        },
      };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a reaction to a news item
const addReaction = async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user?._id || req.body.user; // support both auth and direct
    if (!type || !userId) {
      return res.status(400).json({ error: 'Reaction type and user required' });
    }
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });

    // Upsert reaction in separate collection
    await Reaction.findOneAndUpdate(
      { news: news._id, user: userId },
      { type, reactedAt: Date.now() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Synchronize embedded reactions on the News document for compatibility
    const updatedNews = await syncNewsReactions(news._id);
    res.json(updatedNews || news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove a reaction from a news item
const removeReaction = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.user;
    if (!userId) {
      return res.status(400).json({ error: 'User required' });
    }
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });

    await Reaction.findOneAndDelete({ news: news._id, user: userId });

    const updatedNews = await syncNewsReactions(news._id);
    res.json(updatedNews || news);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createNews,
  getAllNews,
  getPinnedNews,
  getMyNews,
  getNewsById,
  updateNews,
  deleteNews,
  publishNews,
  pinNews,
  addReaction,
  removeReaction,
  getReactions,
};
