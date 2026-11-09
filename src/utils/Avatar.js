export const getUserName = (user) => {
    user?.full_name || user?.author_name || user?.name || user?.authorName || user?.username || user?.author_username || "Unknown User"
}
export const AvatarFallback = (name = "Builder") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=A04622&color=fff`;

export const getUserAvatar = (user) => {
   const url =  user?.avatar_url || user?.author_avatar_url || user?.avatar || user?.author_avatar || "https://via.placeholder.com/150"
   if(!url || url === "https://google.com") return "null"
   return url
}
