import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util"; // Node.js built-in util module

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
