import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: `"Chat App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
  <div style="
    margin: 0;
    padding: 40px 16px;
    background-color: #f4f7fb;
    font-family: Arial, Helvetica, sans-serif;
  ">
    <div style="
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    ">

      <!-- Header -->
      <div style="
        padding: 28px 24px;
        text-align: center;
        background-color: #2563eb;
      ">
        <h1 style="
          margin: 0;
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
        ">
          Chat App
        </h1>
      </div>

      <!-- Content -->
      <div style="
        padding: 36px 28px;
        text-align: center;
      ">

        <div style="
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background-color: #eff6ff;
          line-height: 64px;
          font-size: 30px;
        ">
          🔐
        </div>

        <h2 style="
          margin: 0 0 12px;
          color: #111827;
          font-size: 24px;
          font-weight: 700;
        ">
          Reset Your Password
        </h2>

        <p style="
          margin: 0 0 20px;
          color: #111827;
          font-size: 16px;
          line-height: 1.5;
        ">
          Hi <strong>${name}</strong>,
        </p>

        <p style="
          margin: 0 auto 24px;
          max-width: 400px;
          color: #6b7280;
          font-size: 15px;
          line-height: 1.6;
        ">
          We received a request to reset the password for your
          Chat App account. Click the button below to create a new password.
        </p>

        <!-- Reset Button -->
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 14px 28px;
            background-color: #2563eb;
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 8px;
          "
        >
          Reset Password
        </a>

        <p style="
          margin: 24px 0 0;
          color: #9ca3af;
          font-size: 13px;
          line-height: 1.5;
        ">
          This password reset link will expire in
          <strong style="color: #6b7280;">
            15 minutes
          </strong>.
        </p>

        <div style="
          height: 1px;
          margin: 28px 0;
          background-color: #e5e7eb;
        "></div>

        <p style="
          margin: 0;
          color: #9ca3af;
          font-size: 13px;
          line-height: 1.6;
        ">
          If you didn't request a password reset, you can safely ignore
          this email. Your password will remain unchanged.
        </p>

      </div>

      <!-- Footer -->
      <div style="
        padding: 20px 24px;
        text-align: center;
        background-color: #f9fafb;
        border-top: 1px solid #f3f4f6;
      ">
        <p style="
          margin: 0;
          color: #9ca3af;
          font-size: 12px;
        ">
          © ${new Date().getFullYear()} Chat App. All rights reserved.
        </p>
      </div>

    </div>
  </div>
    `,
  });
};

const sendFriendRequestEmail = async (email, name, senderName) => {
  await transporter.sendMail({
    from: `"Chat App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "New Friend Request",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello ${name},</h2>
        <p>You have received a new friend request from <strong>${senderName}</strong>.</p>
        <p>Log in to your account to accept or decline the request.</p>
        <a href="${process.env.FRONTEND_URL}/friend-requests" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px;">View Friend Requests</a>
        <p>If you did not expect this request, you can ignore this email.</p>
      </div>
    `,
  });
};

export { sendPasswordResetEmail, sendFriendRequestEmail };
