
export const getInitials = (fullName: string): string => {
  const nameArray = fullName.trim().split(" ");
  const firstInitial = nameArray[0][0];
  const lastInitial = nameArray[nameArray.length - 1][0]; // get the first letter of the last name
  return `${firstInitial}${lastInitial}`; // combine the two initials into a string and return it
}
