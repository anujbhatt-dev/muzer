export const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;


export function extractYoutubeId(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
  
      // Case 1: Standard format (youtube.com/watch?v=VIDEO_ID)
      if (parsedUrl.hostname.includes("youtube.com")) {
        return parsedUrl.searchParams.get("v");
      }
  
      // Case 2: Shortened format (youtu.be/VIDEO_ID)
      if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.split("/")[1] || null;
      }
  
      return null;
    } catch {
      return null;
    }
  }
  