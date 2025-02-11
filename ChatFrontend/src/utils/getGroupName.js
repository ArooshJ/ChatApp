export const getGroupName = (group, currentUser) => {
  return group.is_dm
    ? // Extract the other person's name for DM rooms
      group.name
        .split(" ") // Split the name by " & "
        .find((username) => username !== currentUser.username) // Find the other person's name
    : // Display the group name for non-DM rooms
      group.name;
};
