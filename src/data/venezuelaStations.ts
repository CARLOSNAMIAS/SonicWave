import { RadioStation } from '@/types';

export const customVenezuelaStations: RadioStation[] = [
  {
    stationuuid: "c1192563-f8bd-4f65-b1b4-d2b8ab01cd7a",
    name: "Metropolis 103.9 FM",
    url: "https://audio1stream.com/8022/stream",
    url_resolved: "https://audio1stream.com/8022/stream",
    homepage: "https://metropolis1039fm.com/",
    favicon: "/metropolis103.9.jpg", // Found a logo
    tags: "pop,news,talk,top40,local",
    country: "Venezuela",
    countrycode: "VE",
    state: "Zulia",
    language: "spanish",
    votes: 999, // High votes to appear first
    codec: "AAC", // Typical for these streams
    bitrate: 128,
    clickcount: 999, // High click count
  },
  {
    stationuuid: "2a7e2d8e-a204-4ef4-93d6-ebf6f34da3c7",
    name: "La Chiquinquireña 90.9 FM",
    url: "https://server6.globalhostla.com:8098/stream",
    url_resolved: "https://server6.globalhostla.com:8098/stream",
    homepage: "https://tufm909.com/",
    favicon: "/chiquinquierña.jpg", // Using a generic logo I uploaded
    tags: "latin,pop,salsa,merengue,local",
    country: "Venezuela",
    countrycode: "VE",
    state: "Zulia",
    language: "spanish",
    votes: 998, // High votes
    codec: "MP3", // Typical for these streams
    bitrate: 128,
    clickcount: 998,
  },
];
