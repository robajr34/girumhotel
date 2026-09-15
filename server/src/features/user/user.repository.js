import User from "./user.model.js";

const userRepo = {
  findAll(options = {}, filter = {}) {
    options = options || {};
    filter = filter || {};

    const sortBy = options.sortBy || "createdAt";
    const order = options.sortOrder === "asc" ? 1 : -1;

    const limit = parseInt(options.limit) || 15;
    const page = parseInt(options.page) || 1;
    const skip = (page - 1) * limit;

    const userQuery = User.find(filter)
      .sort({ [sortBy]: order })
      .limit(limit)
      .skip(skip)
      .lean();

    const totalQuery = User.countDocuments(filter);

    return Promise.all([userQuery, totalQuery]).then(([users, total]) => {
      const totalPages = Math.ceil(total / limit);

      return {
        users,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    });
  },

  findById(userId, options = {}) {
    const { session } = options;

    return User.findById(userId).session(session);
  },

  findByEmail(email, options = {}) {
    const { session } = options;

    return User.findOne({ email }).session(session);
  },

  findByEmailWithPassword(email, options = {}) {
    const { session } = options;

    return User.findOne({ email }).select("+password").session(session);
  },

  async create(data, options = {}) {
    const { session } = options;

    const [user] = await User.create([data], {
      session,
    });

    return user;
  },

  findByInvitationToken(token, options = {}) {
    const { session } = options;

    return User.findOne({
      invitationToken: token,
    }).session(session);
  },

  updateById(userId, data, options = {}) {
    const { session } = options;

    return User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
      session,
    });
  },

  deleteById(userId, options = {}) {
    const { session } = options;

    return User.findByIdAndDelete(userId, {
      session,
    }).lean();
  },

  findByRole(role, options = {}) {
    const { session } = options;

    return User.findOne({ role }).session(session);
  },
};

export default userRepo;
