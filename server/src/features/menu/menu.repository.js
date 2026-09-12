import Menu from "./menu.model.js";

const menuRepo = {
  async create(data) {
    return Menu.create(data);
  },

  async findById(menuId) {
    return Menu.findById(menuId);
  },

  async findOne(filter = {}) {
    return Menu.findOne(filter);
  },

  async findAll(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 15,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    const sort = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [menus, total] = await Promise.all([
      Menu.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),

      Menu.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      menus,
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

  async updateById(menuId, data) {
    return Menu.findByIdAndUpdate(
      menuId,
      { $set: data },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
  },

  async deleteById(menuId) {
    return Menu.findByIdAndDelete(menuId);
  },

  async exists(filter = {}) {
    return Menu.exists(filter);
  },
};

export default menuRepo;
