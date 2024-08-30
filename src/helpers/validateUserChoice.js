module.exports.validateUsersChoice = (choice, options) => {
  if (!choice) {
    return {
      isValid: false,
      message: "User Choice is mandatory",
    };
  }

  if (!options.includes(choice)) {
    return {
      isValid: false,
      message: `Invalid choice, Please choose one of the options: ${options.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
};
