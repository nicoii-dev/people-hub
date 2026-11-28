interface ReverseGeocodeResponse {
  display_name?: string;
  address?: Record<string, string>;
}

interface CurrentLocation {
  address: string;
}

/**
 * Resolves the device's current position into a human-readable address.
 * Coordinates are used only for the lookup — they are never sent to the
 * time-clock API or displayed in the UI.
 */
export const locationService = {
  async getCurrentAddress(): Promise<CurrentLocation> {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      throw new Error("Location is unavailable. Enter your current address manually.");
    }

    const coordinates = await new Promise<GeolocationCoordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        () => reject(new Error("Location access was denied. Enter your current address manually.")),
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
      );
    });

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(coordinates.latitude));
    url.searchParams.set("lon", String(coordinates.longitude));
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error("Could not resolve your address. Enter it manually.");
    }

    const data = (await response.json()) as ReverseGeocodeResponse;
    const fallbackAddress = Object.values(data.address ?? {})
      .filter(Boolean)
      .join(", ");
    const address = data.display_name?.trim() || fallbackAddress.trim();
    if (!address) {
      throw new Error("No address was found. Enter your current address manually.");
    }

    return { address };
  },
};
