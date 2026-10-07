export const AvatarFallback = (name = "Builder") => 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=A04622&color=fff`;

export const getUserAvatar = (u) => { 
    if(!u || typeof u !== "object") return null;
    return (
        u.avatar_url ||
        u.avatarUrl ||
         u.avatar ||
        u.profile_image ||
        u.profile_image_url ||
        u.profilePicture ||
        u.image ||
        null
    )
}
export const getUserName = (u) =>
  u?.full_name || u?.name || u?.username || "Builder";