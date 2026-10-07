// Default avatar built from a name (shown when a user has no picture)
export const AvatarFallback = (name = "Builder") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=A04622&color=fff`;

// Best display name we can find on a user object
export const getUserName = (u) =>
  u?.full_name ||
  u?.author_name ||
  u?.name ||
  u?.authorName ||
  u?.username ||
  u?.author_username ||
  "Builder";

// Returns a usable image URL, or null when the user has no real picture.
// (Placeholder / junk values are treated as "no picture" so the UI can show AvatarFallback.)
export const getUserAvatar = (u) => {
  if (!u || typeof u !== "object") return null;
  const url =
    u.avatar_url ||
    u.author_avatar_url ||
    u.avatarUrl ||
    u.avatar ||
    u.author_avatar ||
    u.profile_image ||
    u.profile_image_url ||
    u.profilePicture ||
    u.image ||
    null;
  if (typeof url !== "string") return null;
  const clean = url.trim();
  if (
    !clean ||
    clean === "https://google.com" ||
    clean.includes("via.placeholder.com")
  ) {
    return null;
  }
  return clean;
};