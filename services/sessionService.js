const Session = require("../models/Session");

async function getSession(phoneNumber) {
  let session = await Session.findOne({ phoneNumber });
  if (!session) {
    session = await Session.create({ phoneNumber, state: "idle" });
  }
  return session;
}

async function updateSession(phoneNumber, updates) {
  return await Session.findOneAndUpdate(
    { phoneNumber },
    { ...updates, updatedAt: new Date() },
    { upsert: true, new: true }
  );
}

async function resetSession(phoneNumber) {
  return await Session.findOneAndUpdate(
    { phoneNumber },
    {
      state: "idle",
      selectedItem: undefined,
      quantity: undefined,
      address: undefined,
      location: undefined,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
}

module.exports = { getSession, updateSession, resetSession };