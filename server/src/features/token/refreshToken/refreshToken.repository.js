import RefreshToken from "./refreshToken.model.js";

const refTokenRepo = {
  findById(tokenId) {
    return RefreshToken.findById(tokenId);
  },
  findByToken(token) {
    return RefreshToken.findOne({ token });
  },
  create(data) {
    return RefreshToken.create({ ...data });
  },
  updateById(tokenId, data) {
    return RefreshToken.findByIdAndUpdate(
      tokenId,
      { ...data },
      { returnDocument: "after", runValidators: true },
    );
  },
  updateByToken(token, data) {
    return RefreshToken.findOneAndUpdate(
      { token },
      { ...data },
      { returnDocument: "after", runValidators: true },
    );
  },
  deleteById(tokenId) {
    return RefreshToken.findByIdAndDelete(tokenId);
  },
  deleteAllByUserId(userId) {
    return RefreshToken.deleteMany({ user: userId });
  },
};
export default refTokenRepo;
