const { createUser, verifyUser } = require("./userModel");

async function main() {
  try {
    await createUser("JERK", "slop123");

    const loginSuccess = await verifyUser("JERK", "slop123");
    console.log(loginSuccess ? "Login success!" : "Login failed!");
  } catch (err) {
    console.error(err.message);
  }
}

main();