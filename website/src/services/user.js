/**
 * Attempts to get the user's information based on login data.
 * Returns null if unsuccessful
 */
export const getUser = async () => {
  let access_token = localStorage.getItem("accessToken");
  let uuid = localStorage.getItem("userUUID");
  if (access_token && uuid) {
    const response = await fetch(`/users/${uuid}`, {
      method: "GET",
      headers: {
        Authorization: `bearer ${access_token}`,
      },
    });
    const responseData = await response.json();
    // Success
    if (response.ok) {
      return responseData;
    }
  }
  return null;
};
