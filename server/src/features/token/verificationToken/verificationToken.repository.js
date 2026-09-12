import VToken from "./verificationToken.model.js";

const vTokenRepo = {
  findById(tokenId) {
    return VToken.findById(tokenId);
  },
  create(data) {
    return VToken.create(data);
  },
  findByToken(tokenHash) {
    return VToken.findOne({ tokenHash });
  },
  findByUserId(user) {
    return VToken.findOne({ user });
  },
  updateByToken(token, data) {
    return VToken.findOneAndUpdate(
      { token },
      { data },
      { returnDocument: "after", runValidators: true },
    );
  },
};

export default vTokenRepo;
