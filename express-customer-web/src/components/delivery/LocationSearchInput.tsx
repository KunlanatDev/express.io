import React, { useState, useEffect } from "react";
import {
  Autocomplete as GoogleMapsAutocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import { TextField, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";
import type { AddressInfo } from "../../types";

const mapLibraries: "places"[] = ["places"];

interface LocationSearchInputProps {
  value: AddressInfo;
  onChange: (val: AddressInfo) => void;
  placeholder: string;
  hasError?: boolean;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  value,
  onChange,
  placeholder,
  hasError,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: mapLibraries,
  });

  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [text, setText] = useState(value.address);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(value.address);
  }, [value.address]);

  // If map script not loaded, fallback to native TextField
  if (!isLoaded) {
    return (
      <TextField
        fullWidth
        value={text}
        disabled
        placeholder="Loading Map Services..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "#94A3B8" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: "48px",
            borderRadius: "12px",
            bgcolor: "#fff",
          },
        }}
      />
    );
  }

  return (
    <GoogleMapsAutocomplete
      onLoad={setAutocomplete}
      onPlaceChanged={() => {
        if (autocomplete) {
          const place = autocomplete.getPlace();
          if (place && place.geometry && place.geometry.location) {
            const newAddr = {
              ...value,
              address: place.formatted_address || place.name || text,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              place_id: place.place_id,
            };
            setText(newAddr.address);
            onChange(newAddr);
          }
        }
      }}
      options={{
        fields: ["formatted_address", "name", "geometry", "place_id"],
        componentRestrictions: { country: "th" },
      }}
    >
      <TextField
        fullWidth
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange({ ...value, address: e.target.value });
        }}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: "#94A3B8" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: "48px",
            borderRadius: "12px",
            bgcolor: "#fff",
          },
          "& fieldset": { borderColor: hasError ? "#EF4444" : "#D8E2F1" },
          "& .MuiOutlinedInput-root:hover fieldset": {
            borderColor: hasError ? "#EF4444" : "#C9D7EE",
          },
          "& .MuiOutlinedInput-root.Mui-focused fieldset": {
            borderColor: hasError ? "#EF4444" : "#2563EB",
          },
        }}
      />
    </GoogleMapsAutocomplete>
  );
};

export default LocationSearchInput;
