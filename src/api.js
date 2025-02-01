import axios from "axios";

// Use another CORS proxy URL
const API_URL =
  "https://api.allorigins.win/get?url=" +
  encodeURIComponent("https://api.jsonserve.com/Uw5CrX");

export async function fetchQuizData() {
  try {
    const response = await axios.get(API_URL);
    const data = JSON.parse(response.data.contents); // Parse the returned JSON data
    console.log("Quiz Data:", data); // Check output in console
    return data;
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return [];
  }
}
