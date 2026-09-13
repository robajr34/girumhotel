import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import userRepo from "../user/user.repository.js";
import vTokenRepo from "../token/verificationToken/verificationToken.repository.js";
import {
  generateBothTokens,
  generateToken,
  hashToken,
  verifyRefreshToken,
} from "../../utils/token.js";
import env from "../../configs/env.js";
import sendEmail from "../../utils/email.js";
import refTokenRepo from "../token/refreshToken/refreshToken.repository.js";
import staffRepo from "../staff/staff.repository.js";

export const guestLoginService = async ({ email, password }) => {
  const userExist = await userRepo.findByEmailWithPassword(email);

  if (!userExist) {
    logger.warn("Guest login failed", {
      email,
      reason: "User not found",
    });

    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (userExist.isBlackListed) {
    logger.warn("Guest login failed", {
      email,
      reason: "User is currently blocked",
    });

    throw new AppError("Email is currently blocked", 403, "EMAIL_BLOCKED");
  }

  const passwordIsMatch = await comparePassword(password, userExist.password);

  if (!passwordIsMatch) {
    logger.warn("Guest login failed", {
      userId: userExist._id,
      reason: "Invalid password",
    });

    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const { password: _, ...user } = userExist.toObject();

  const { accessToken, refreshToken } = generateBothTokens({
    userId: user._id,
    role: user.role,
    accountType: user.role === "guest" ? "guest" : "staff",
  });

  const hashedRefreshToken = hashToken(refreshToken);

  await refTokenRepo.create({
    token: hashedRefreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    isRevoked: false,
  });

  logger.info("Guest login successful", {
    userId: user._id,
    role: user.role,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const guestSignupService = async ({ email, password }) => {
  const userExist = await userRepo.findByEmail(email);

  if (userExist) {
    logger.warn("Guest signup failed", {
      email,
      reason: "Email already exists",
    });

    throw new AppError("Email already exists.", 409, "EMAIL_EXISTS");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await userRepo.create({
    email,
    password: hashedPassword,
    role: "guest",
  });

  const { password: _, ...user } = newUser.toObject();

  const { accessToken, refreshToken } = generateBothTokens({
    userId: user._id,
    role: user.role,
    accountType: user.role === "guest" ? "guest" : "staff",
  });

  const hashedRefreshToken = hashToken(refreshToken);

  await refTokenRepo.create({
    token: hashedRefreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    isRevoked: false,
  });

  logger.info("Guest account created", {
    userId: newUser._id,
    role: newUser.role,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const refreshTokenService = async (refToken) => {
  if (!refToken) {
    logger.warn("Refresh token request failed", {
      reason: "Token not provided",
    });

    throw new AppError("Token not provided.", 400, "TOKEN_NOT_GIVEN");
  }

  const hashedToken = hashToken(refToken);

  const token = await refTokenRepo.findByToken(hashedToken);

  if (!token) {
    logger.warn("Refresh token rejected", {
      reason: "Token not found",
    });

    throw new AppError("Invalid or expired token.", 401, "INVALID_TOKEN");
  }

  // Detect refresh-token reuse
  if (token.isRevoked) {
    logger.warn("Refresh token reuse detected", {
      userId: token.user,
      tokenId: token._id,
    });

    await refTokenRepo.deleteAllByUserId(token.user);

    throw new AppError("Token reuse detected.", 401, "TOKEN_REUSE_DETECTION");
  }

  // Check database expiration
  if (token.expiresAt < new Date()) {
    logger.warn("Expired refresh token used", {
      userId: token.user,
      tokenId: token._id,
    });

    throw new AppError("Invalid or expired token.", 401, "EXPIRED_TOKEN");
  }

  // Verify JWT
  let decoded;

  try {
    decoded = verifyRefreshToken(refToken);
  } catch (err) {
    logger.warn("Refresh token verification failed", {
      error: err.message,
    });

    throw new AppError("Invalid or expired token.", 401, "INVALID_TOKEN");
  }

  // Make sure JWT belongs to DB token
  if (decoded.userId !== token.user.toString()) {
    logger.warn("Refresh token identity mismatch", {
      tokenId: token._id,
      userId: token.user,
    });

    throw new AppError("Invalid refresh token.", 401, "INVALID_TOKEN");
  }

  // Find user
  const user = await userRepo.findById(token.user);

  if (!user) {
    logger.warn("User associated with refresh token not found", {
      tokenId: token._id,
      userId: token.user,
    });

    throw new AppError(
      "Invalid or expired token.",
      401,
      "USER_WITH_TOKEN_NOT_FOUND",
    );
  }

  // Check account status
  if (user.isBlackListed) {
    logger.warn("Blacklisted user attempted token refresh", {
      userId: user._id,
      role: user.role,
    });

    throw new AppError("User is currently banned.", 401, "USER_IS_BANNED");
  }

  // Revoke current refresh token
  token.isRevoked = true;
  await token.save();

  // Generate new token pair
  const { accessToken, refreshToken } = generateBothTokens({
    userId: user._id,
    role: user.role,
    accountType: user.role === "guest" ? "guest" : "staff",
  });

  // Hash new refresh token
  const hashedRefreshToken = hashToken(refreshToken);

  await refTokenRepo.create({
    token: hashedRefreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    isRevoked: false,
  });

  logger.info("Refresh token rotated successfully", {
    userId: user._id,
    role: user.role,
    oldTokenId: token._id,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const getMeService = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) {
    logger.error(`User with ID-${userId} not found.`, {
      userId: userId,
    });

    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  return user;
};

export const setupOwnerService = async ({ email, password }) => {
  const ownerExist = await userRepo.findByEmail(email);

  const adminExist = await userRepo.findByRole("owner");

  if (adminExist) {
    logger.warn("Owner already exist.", {
      ownerId: adminExist._id,
      requestedEmail: email,
    });

    throw new AppError("Owner already exist.", 409, "USER_EXIST");
  }

  if (ownerExist) {
    logger.warn("Owner setup failed", {
      email,
      reason: "Email already exists",
    });

    throw new AppError("Email already exist.", 409, "EMAIL_EXIST");
  }

  const hashedPassword = await hashPassword(password);

  const owner = await userRepo.create({
    email,
    password: hashedPassword,
    role: "owner",
    requireSetup: true,
  });

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);

  await vTokenRepo.create({
    user: owner._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  });

  const verificationUrl = `${env.frontendUrl}/setup/owner/verify?token=${rawToken}`;
  logger.info("Token", {
    rawToken: rawToken,
  });

  try {
    await sendEmail({
      to: owner.email,
      subject: "Verify your owner account — Girum Hotel",

      html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Verify your Girum Hotel account</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f5f5f4;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Helvetica, Arial, sans-serif;
          color: #1c1917;
        "
      >

        <!-- Preheader -->
        <div
          style="
            display: none;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
          "
        >
          Verify your owner account and access your Girum Hotel dashboard.
        </div>

        <!-- Outer wrapper -->
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="background-color: #f5f5f4;"
        >
          <tr>
            <td align="center" style="padding: 48px 16px;">

              <!-- Email card -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  max-width: 560px;
                  background-color: #ffffff;
                  border: 1px solid #e7e5e4;
                  border-radius: 18px;
                  overflow: hidden;
                "
              >

                <!-- Brand -->
                <tr>
                  <td
                    style="
                      padding: 30px 40px 24px;
                      border-bottom: 1px solid #f0efed;
                    "
                  >
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>
                        <td>

                          <div
                            style="
                              font-size: 11px;
                              font-weight: 700;
                              letter-spacing: 1.8px;
                              text-transform: uppercase;
                              color: #a16207;
                              margin-bottom: 5px;
                            "
                          >
                            GIRUM HOTEL
                          </div>

                          <div
                            style="
                              font-size: 13px;
                              color: #78716c;
                            "
                          >
                            Hotel Management System
                          </div>

                        </td>

                        <td
                          align="right"
                          style="
                            font-size: 22px;
                          "
                        >
                          🏨
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Main content -->
                <tr>
                  <td
                    style="
                      padding: 44px 40px 40px;
                    "
                  >

                    <!-- Small icon -->
                    <div
                      style="
                        width: 48px;
                        height: 48px;
                        line-height: 48px;
                        text-align: center;
                        background-color: #fffbeb;
                        border: 1px solid #fde68a;
                        border-radius: 14px;
                        font-size: 21px;
                        margin-bottom: 26px;
                      "
                    >
                      ✉
                    </div>

                    <!-- Heading -->
                    <h1
                      style="
                        margin: 0 0 12px;
                        font-size: 30px;
                        line-height: 1.2;
                        font-weight: 700;
                        letter-spacing: -0.7px;
                        color: #1c1917;
                      "
                    >
                      Welcome to Girum Hotel.
                    </h1>

                    <p
                      style="
                        margin: 0 0 28px;
                        font-size: 16px;
                        line-height: 1.7;
                        color: #57534e;
                      "
                    >
                      Your owner account is almost ready.
                      Verify your email address to securely activate
                      your account and access your hotel dashboard.
                    </p>

                    <!-- CTA -->
                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      width="100%"
                    >
                      <tr>
                        <td>

                          <a
                            href="${verificationUrl}"
                            target="_blank"
                            style="
                              display: block;
                              width: 100%;
                              box-sizing: border-box;
                              background-color: #a16207;
                              color: #ffffff;
                              text-decoration: none;
                              text-align: center;
                              padding: 15px 20px;
                              border-radius: 10px;
                              font-size: 15px;
                              font-weight: 700;
                              line-height: 1.4;
                            "
                          >
                            Verify email address
                            &nbsp;&nbsp;→
                          </a>

                        </td>
                      </tr>
                    </table>

                    <div
                      style="
                        margin-top: 22px;
                        padding: 14px 16px;
                        background-color: #fafaf9;
                        border: 1px solid #e7e5e4;
                        border-radius: 10px;
                      "
                    >
                      <table
                        role="presentation"
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                      >
                        <tr>
                          <td
                            style="
                              font-size: 13px;
                              color: #57534e;
                            "
                          >
                            <strong style="color: #292524;">
                              Link expires
                            </strong>
                          </td>

                          <td
                            align="right"
                            style="
                              font-size: 13px;
                              font-weight: 700;
                              color: #a16207;
                            "
                          >
                            In 1 hour
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div
                      style="
                        height: 1px;
                        background-color: #e7e5e4;
                        margin: 32px 0;
                      "
                    ></div>

                    <p
                      style="
                        margin: 0 0 8px;
                        font-size: 12px;
                        font-weight: 700;
                        color: #44403c;
                      "
                    >
                      Having trouble with the button?
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 12px;
                        line-height: 1.6;
                        color: #78716c;
                        word-break: break-all;
                      "
                    >
                      Copy and paste this link into your browser:
                    </p>

                    <div
                      style="
                        margin-top: 10px;
                        padding: 12px;
                        background-color: #fafaf9;
                        border: 1px solid #e7e5e4;
                        border-radius: 8px;
                        font-family: monospace;
                        font-size: 11px;
                        line-height: 1.5;
                        color: #57534e;
                        word-break: break-all;
                      "
                    >
                      ${verificationUrl}
                    </div>
                    <div
                      style="
                        margin-top: 24px;
                        padding: 15px 16px;
                        background-color: #f0fdf4;
                        border: 1px solid #dcfce7;
                        border-radius: 10px;
                      "
                    >
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                      >
                        <tr>
                          <td
                            valign="top"
                            style="
                              font-size: 16px;
                              padding-right: 10px;
                            "
                          >
                            🔒
                          </td>

                          <td
                            style="
                              font-size: 12px;
                              line-height: 1.6;
                              color: #166534;
                            "
                          >
                            <strong>Your account is protected.</strong><br />
                            Never share this verification link with anyone.
                            Girum Hotel will never ask for your password by email.
                          </td>
                        </tr>
                      </table>
                    </div>

                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 24px 40px;
                      background-color: #fafaf9;
                      border-top: 1px solid #e7e5e4;
                    "
                  >

                    <p
                      style="
                        margin: 0;
                        font-size: 12px;
                        line-height: 1.6;
                        color: #78716c;
                        text-align: center;
                      "
                    >
                      Didn't create this account?
                      <a
                        href="mailto:support@girumhotel.com"
                        style="
                          color: #a16207;
                          font-weight: 600;
                          text-decoration: none;
                        "
                      >
                        Contact support
                      </a>
                    </p>

                    <p
                      style="
                        margin: 12px 0 0;
                        font-size: 11px;
                        line-height: 1.5;
                        color: #a8a29e;
                        text-align: center;
                      "
                    >
                      © ${new Date().getFullYear()} Girum Hotel
                      · Fiche, Ethiopia
                    </p>

                  </td>
                </tr>

              </table>

              <!-- Bottom branding -->
              <p
                style="
                  margin: 20px 0 0;
                  font-size: 11px;
                  color: #a8a29e;
                  text-align: center;
                "
              >
                Secure account verification
              </p>

            </td>
          </tr>
        </table>

      </body>
    </html>
  `,
    });
  } catch (err) {
    await userRepo.deleteById(owner._id);
    logger.error("Error sendind email.");
    throw err;
  }

  logger.info("Owner setup verification email sent", {
    userId: owner._id,
    role: owner.role,
  });

  const { password: _, ...user } = owner.toObject();

  return user.email;
};

export const verifyOwnerEmailService = async (token) => {
  const tokenHash = hashToken(token);

  const tokenExist = await vTokenRepo.findByToken(tokenHash);

  if (!tokenExist) {
    logger.warn("Owner email verification failed", {
      reason: "Token not found",
    });

    throw new AppError("Invalid or expired token.", 401, "INVALID_TOKEN");
  }

  if (tokenExist.expiresAt < new Date()) {
    logger.warn("Owner email verification failed", {
      userId: tokenExist.user,
      reason: "Token expired",
    });

    throw new AppError("Invalid or expired token.", 401, "INVALID_TOKEN");
  }

  if (tokenExist.usedAt) {
    logger.warn("Owner email verification failed", {
      userId: tokenExist.user,
      reason: "Token already used",
    });

    throw new AppError("Token is already used.", 401, "INVALID_TOKEN");
  }

  const ownerExist = await userRepo.findById(tokenExist.user);

  if (!ownerExist) {
    logger.warn("Owner email verification failed", {
      userId: tokenExist.user,
      reason: "Owner not found",
    });

    throw new AppError("Invalid or expired token.", 401, "INVALID_TOKEN");
  }

  ownerExist.isVerified = true;
  await ownerExist.save();

  tokenExist.usedAt = new Date();
  await tokenExist.save();

  ownerExist.lastLoginAt = new Date();
  await ownerExist.save();

  const { password: _, ...user } = ownerExist.toObject();

  const { accessToken, refreshToken } = generateBothTokens({
    userId: user._id,
    role: user.role,
    accountType: user.role === "guest" ? "guest" : "staff",
  });

  logger.info("Owner email verified successfully", {
    userId: ownerExist._id,
    role: ownerExist.role,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// TODO: To complete this service first create staff model and repository.
export const completeSetupService = async (data, userId) => {
  const staffExist = await staffRepo.findOne({ phone: data.phone });
  if (staffExist) {
    throw new AppError("Staff already exist.", 409, "STAFF_EXIST");
  }
  const user = await userRepo.findById(userId);

  const newStaff = await staffRepo.create({
    user: userId,
    firstName: data.firstName,
    lastName: data.lastName,
    role: user.role,
    phone: data.phone,
  });

  user.requireSetup = false;
  await user.save();

  return newStaff;
};

export const setupStaffService = async (data, ownerId) => {
  const owner = await userRepo.findById(ownerId);

  if (!owner) {
    throw new AppError("Owner doesn't exist.", 404, "OWNER_NOT_FOUND");
  }

  if (owner.role !== "owner") {
    throw new AppError(
      "Only an owner can set up staff.",
      403,
      "OWNER_REQUIRED",
    );
  }

  const staffExist = await userRepo.findByEmail(data.email);

  if (staffExist) {
    throw new AppError("Email already exists.", 409, "USER_EXISTS");
  }

  const rawToken = generateToken();
  const hashedToken = hashToken(rawToken);

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const newStaffUser = await userRepo.create({
    email: data.email,
    password: "12345678",
    role: data.role,
    requireSetup: true,
    isVerified: false,

    invitationToken: hashedToken,
    invitationTokenExpiresAt: expiresAt,
  });

  const verificationUrl = `${env.frontendUrl}/setup/staff/verify?token=${rawToken}`;

  try {
    await sendEmail({
      subject: "Complete your staff account setup",
      to: data.email,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Complete your account setup</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: Arial, Helvetica, sans-serif;
        color: #17202a;
      ">

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="background-color: #f4f6f8; padding: 40px 16px;"
        >
          <tr>
            <td align="center">

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  max-width: 560px;
                  background-color: #ffffff;
                  border-radius: 20px;
                  overflow: hidden;
                "
              >

                <tr>
                  <td
                    align="center"
                    style="
                      padding: 36px 32px 24px;
                      background-color: #111827;
                    "
                  >
                    <div style="
                      font-size: 14px;
                      font-weight: 700;
                      letter-spacing: 2px;
                      text-transform: uppercase;
                      color: #ffffff;
                    ">
                      HOTEL MANAGEMENT
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 44px 40px 36px;">

                    <div style="
                      width: 64px;
                      height: 64px;
                      line-height: 64px;
                      margin: 0 auto 24px;
                      text-align: center;
                      border-radius: 50%;
                      background-color: #eef2ff;
                      font-size: 28px;
                    ">
                      ✉️
                    </div>

                    <h1 style="
                      margin: 0 0 16px;
                      text-align: center;
                      font-size: 30px;
                      line-height: 1.2;
                      font-weight: 700;
                      color: #111827;
                    ">
                      Complete your account setup
                    </h1>

                    <p style="
                      margin: 0 auto 28px;
                      max-width: 420px;
                      text-align: center;
                      font-size: 16px;
                      line-height: 1.7;
                      color: #6b7280;
                    ">
                      You have been invited to join the hotel management
                      system. Verify your email and create your password
                      to activate your staff account.
                    </p>

                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      <tr>
                        <td align="center">

                          <a
                            href="${verificationUrl}"
                            style="
                              display: inline-block;
                              padding: 16px 32px;
                              background-color: #111827;
                              color: #ffffff;
                              text-decoration: none;
                              font-size: 16px;
                              font-weight: 700;
                              border-radius: 10px;
                            "
                          >
                            Verify Email →
                          </a>

                        </td>
                      </tr>
                    </table>

                    <div style="
                      margin-top: 28px;
                      padding: 14px 16px;
                      background-color: #f9fafb;
                      border-radius: 10px;
                      text-align: center;
                    ">
                      <p style="
                        margin: 0;
                        font-size: 13px;
                        line-height: 1.5;
                        color: #6b7280;
                      ">
                        ⏱ This invitation expires in
                        <strong style="color: #374151;">
                          1 day.
                        </strong>
                      </p>
                    </div>

                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 24px 32px;
                    background-color: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                  ">
                    <p style="
                      margin: 0;
                      text-align: center;
                      font-size: 12px;
                      line-height: 1.6;
                      color: #9ca3af;
                    ">
                      If you didn't expect this invitation,
                      you can safely ignore this email.
                    </p>
                  </td>
                </tr>

              </table>

              <p style="
                margin: 24px 0 0;
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
              ">
                © ${new Date().getFullYear()} Hotel Management System
              </p>

            </td>
          </tr>
        </table>

      </body>
      </html>
    `,
    });
  } catch (error) {
    await userRepo.deleteById(newStaffUser._id);
    throw error;
  }

  return newStaffUser.email;
};

//Staff will send new password with verification token.
export const verifyStaffEmailService = async (data, token) => {
  if (!token) {
    throw new AppError(
      "Verification token is required.",
      400,
      "TOKEN_REQUIRED",
    );
  }

  if (!data.password) {
    throw new AppError("Password is required.", 400, "PASSWORD_REQUIRED");
  }

  const tokenHash = hashToken(token);

  const staff = await userRepo.findByInvitationToken(tokenHash);

  if (!staff) {
    logger.warn("Staff email verification failed", {
      reason: "Token not found",
    });

    throw new AppError("Invalid or expired invitation.", 401, "INVALID_TOKEN");
  }

  if (
    !staff.invitationTokenExpiresAt ||
    staff.invitationTokenExpiresAt < new Date()
  ) {
    logger.warn("Staff email verification failed", {
      userId: staff._id,
      reason: "Token expired",
    });

    throw new AppError("Invalid or expired invitation.", 401, "INVALID_TOKEN");
  }

  if (!staff.requireSetup) {
    logger.warn("Staff account setup attempted again", {
      userId: staff._id,
      reason: "Setup already completed",
    });

    throw new AppError(
      "Staff account setup has already been completed.",
      409,
      "SETUP_ALREADY_COMPLETED",
    );
  }

  staff.password = data.password;
  staff.isVerified = true;
  staff.requireSetup = true;

  // Invalidate invitation token
  staff.invitationToken = null;
  staff.invitationTokenExpiresAt = null;

  staff.lastLoginAt = new Date();

  await staff.save();

  const user = staff.toObject();

  delete user.password;
  delete user.invitationToken;
  delete user.invitationTokenExpiresAt;

  const { accessToken, refreshToken } = generateBothTokens({
    userId: user._id,
    role: user.role,
    accountType: "staff",
  });

  logger.info("Staff email verified successfully", {
    userId: staff._id,
    role: staff.role,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
