export type WorkspaceIconName = "welcome" | "profile" | "research" | "experience" | "leadership" | "photos" | "journal" | "music" | "chess" | "basketball" | "collections";
export type CollectionGroup = "workbench" | "off-duty";
export const publicCollections = [
 { href: "/", label: "Home", title: "Kondwani Phiri", group: "workbench", icon: "welcome" },
 { href: "/about", label: "About", title: "About Kondwani", group: "workbench", icon: "profile" },
 { href: "/research", label: "Research", title: "Research", group: "workbench", icon: "research" },
 { href: "/experience", label: "Experience", title: "Experience", group: "workbench", icon: "experience" },
 { href: "/leadership", label: "Leadership", title: "Leadership", group: "workbench", icon: "leadership" },
 { href: "/gallery", label: "Photographs", title: "Photographs", group: "workbench", icon: "photos" },
 { href: "/journal", label: "Journal", title: "Journal", group: "workbench", icon: "journal" },
 { href: "/extras", label: "Extras", title: "Comics, music & the rest", group: "off-duty", icon: "collections" },
] as const;
export const publicDestinations = publicCollections.map(collection => [collection.href, collection.label] as const);
export function collectionForPath(pathname: string) {
 const match = publicCollections.find(collection => collection.href === pathname || (collection.href !== "/" && pathname.startsWith(collection.href + "/")));
 return match ?? { label: "Extras", title: "Comics, music & the rest", group: "off-duty" as const, icon: "collections" as const };
}
