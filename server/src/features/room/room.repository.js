import Room from "./room.model.js";

const roomRepo = {
  findAll(options = {}, filter = {}) {
    options = options || {};
    filter = filter || {};

    const sortBy = options.sortBy || "roomNumber";
    const order = options.sortOrder === "asc" ? 1 : -1;

    const limit = parseInt(options.limit) || 15;
    const page = parseInt(options.page) || 1;
    const skip = (page - 1) * limit;

    const roomQuery = Room.find(filter)
      .sort({ [sortBy]: order })
      .limit(limit)
      .skip(skip)
      .lean();

    const totalQuery = Room.countDocuments(filter);

    return Promise.all([roomQuery, totalQuery]).then(([rooms, total]) => {
      const totalPages = Math.ceil(total / limit);

      return {
        rooms,
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

  findById(roomId) {
    return Room.findById(roomId).lean();
  },

  findOne(query = {}) {
    return Room.findOne(query).lean();
  },

  create(data) {
    return Room.create(data);
  },

  updateById(roomId, data) {
    return Room.findByIdAndUpdate(roomId, data, {
      returnDocument: "after",
      runValidators: true,
    }).lean();
  },

  deleteById(roomId) {
    return Room.findByIdAndDelete(roomId);
  },

  search(query) {
    return Room.find({
      $or: [
        { roomNumber: { $regex: query, $options: "i" } },
        { type: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { amenities: { $regex: query, $options: "i" } },
      ],
    }).lean();
  },
};

export default roomRepo;
