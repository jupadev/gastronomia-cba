import {
  Client,
  PlaceInputType,
  FindPlaceFromTextRequest,
  Language,
} from "@googlemaps/google-maps-services-js";
import * as dotenv from "dotenv";

import { ENV } from "../types";

dotenv.config();

const client = new Client({});

export const searchPlaces = async (input: string) => {
  const params: FindPlaceFromTextRequest["params"] = {
    input,
    inputtype: PlaceInputType.textQuery,
    key: (process.env as ENV).GOOGLE_API_KEY!,
    fields: ["place_id", "name", "formatted_address", "rating"],
    locationbias: (process.env as ENV).LOCATION_LAT_LONG,
    language: Language.es,
  };
  const r = await client.findPlaceFromText({ params });
  return r;
};
