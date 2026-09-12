import Guest from "./guest.model.js";

const guestRepo = {
  create(data) {
    return Guest.create(data);
  },

  findAll(query = {}, filter = {}) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit) || 15, 1), 100);
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const sort = {
      [sortBy]: sortOrder,
    };

    return Promise.all([
      Guest.find(filter).sort(sort).skip(skip).limit(limit),

      Guest.countDocuments(filter),
    ]).then(([guests, total]) => ({
      guests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    }));
  },

  updateById(guestId, updatedData) {
    return Guest.findByIdAndUpdate(guestId, updatedData, {
      returnDocument: "after",
      runValidators: true,
    });
  },

  findById(guestId) {
    return Guest.findById(guestId);
  },

  findByPhone(phone) {
    return Guest.findOne({ phone });
  },

  deleteById(guestId) {
    return Guest.findByIdAndDelete(guestId);
  },

  findByIdAndUser({ userId, guestId }) {
    return Guest.findOne({
      user: userId,
      _id: guestId,
    });
  },
};

export default guestRepo;
