export async function getLocationFromLatLng(lat: number, lng: number) {
  // Use reverse geocoding to get the location from the coordinates

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location data");
  }

  const data = await response.json();
  // console.log(data);

  // Extract the location from the response
  // const location = data.display_name;
  // const { display_name } = data;

  // return location;
  return data;
}
