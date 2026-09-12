import Staff from "./staff.model.js";

const staffRepo = {
  async create(data) {
    return Staff.create(data);
  },

  async findById(staffId) {
    return Staff.findById(staffId);
  },

  async findByIdWithUser(staffId) {
    return Staff.findById(staffId).populate("user");
  },

  async findByUserId(userId) {
    return Staff.findOne({ user: userId });
  },

  async findByRole(role) {
    return Staff.find({ role }).sort({ createdAt: -1 });
  },

  async findOne(filter = {}) {
    return Staff.findOne(filter);
  },

  async findAll(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 15,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      Staff.find(filter)
        .sort({
          [sortBy]: sortOrder === "asc" ? 1 : -1,
        })
        .skip(skip)
        .limit(limit)
        .populate("user", "email"),

      Staff.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      staff,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },

  async updateById(staffId, data) {
    return Staff.findByIdAndUpdate(
      staffId,
      { $set: data },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
  },

  async updateByUserId(userId, data) {
    return Staff.findOneAndUpdate(
      { user: userId },
      { $set: data },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
  },

  async deleteById(staffId) {
    return Staff.findByIdAndDelete(staffId);
  },

  async exists(filter = {}) {
    return Staff.exists(filter);
  },
};

export default staffRepo;
