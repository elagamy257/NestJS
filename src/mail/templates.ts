// Generated copy of src/mail/templates/*.ejs, embedded so they ship with the Vercel bundle.
export const mailTemplates: Record<string, string> = {
  "login": "<div style=\"font-family: sans-serif;\">\n  <h2 style=\"color: blue;\">Hello <span style=\"color: black;\"> <%= email %> </span></h2>\n  <p style=\"color: gray;\">\n    U logged in to your account in <%= today.toDateString() %> at <%= today.toLocaleDateString() %>\n  </p>\n  thanks\n</div>",
  "reset-password": "<div style=\"font-family: sans-serif;\">\n  <h2 style=\"color: #555;\">\n    reset your password\n  </h2>\n\n  <a href=\"<%= resetPasswordLink %>\">\n    click here to reset password\n  </a>\n</div>",
  "verify-email": "<div style=\"font-family: sans-serif;\">\n  <h2 style=\"color: #555;\">\n    verify your email address\n  </h2>\n  <p style=\"color: gray;\">\n    click on the link in the below to activate your account\n  </p>\n\n  <a href=\"<%= link %>\">\n    verify your account\n  </a>\n</div>",
};
