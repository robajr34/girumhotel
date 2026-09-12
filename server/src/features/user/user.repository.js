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

  findById(userId) {
    return User.findById(userId);
  },
  findByEmail(email) {
    return User.findOne({ email });
  },
  findByEmailWithPassword(email) {
    return User.findOne({ email }).select("+password");
  },

  create(data) {
    return User.create(data);
  },
  findByInvitationToken(token) {
    return User.findOne({ invitationToken: token });
  },
  updateById(userId, data) {
    return User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    });
  },

  deleteById(userId) {
    return User.findByIdAndDelete(userId).lean();
  },

  findByRole(role) {
    return User.findOne({ role });
  },
};

export default userRepo;
