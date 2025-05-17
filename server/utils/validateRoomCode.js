function validateRoomCode(code, maxLen = 8) {
  // Allow 2–8 uppercase letters / digits, no spaces.
  const regex = /^[A-Z0-9]{2,8}$/;
  return regex.test(code) && code.length <= maxLen;
}

module.exports = { validateRoomCode };
