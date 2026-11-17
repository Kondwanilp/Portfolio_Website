export type WorkspaceIconName = "welcome" | "profile" | "research" | "experience" | "leadership" | "photos" | "journal" | "music" | "chess" | "basketball" | "collections";
export type CollectionGroup = "workbench" | "off-duty";
export const publicCollections = [
 { href: "/", label: "Welcome", title: "Your way into Fieldwork", group: "workbench", icon: "welcome" },
 { href: "/about", label: "About Kondwani", title: "Personal field notes", group: "workbench", icon: "profile" },
 { href: "/research", label: "Research notebooks", title: "Questions, methods & evidence", group: "workbench", icon: "research" },
 { href: "/experience", label: "Experience", title: "A path through the work", group: "workbench", icon: "experience" },
 { href: "/leadership", label: "Leadership", title: "Community & mentorship", group: "workbench", icon: "leadership" },
 { href: "/gallery", label: "Photographs", title: "From the field", group: "workbench", icon: "photos" },
 { href: "/journal", label: "Journal", title: "Writing & recent work", group: "workbench", icon: "journal" },
 { href: "/extras/listening", label: "Listening Room", title: "A record of this week", group: "off-duty", icon: "music" },
 { href: "/extras/chess", label: "Chess Corner", title: "A personal chess study", group: "off-duty", icon: "chess" },
 { href: "/extras/basketball", label: "Court Vision", title: "The basketball journal", group: "off-duty", icon: "basketball" },
] as const;
export const publicDestinations = publicCollections.map(collection => [collection.href, collection.label] as const);
export function collectionForPath(pathname: string) {
 const match = publicCollections.find(collection => collection.href === pathname || (collection.href !== "/" && pathname.startsWith(collection.href + "/")));
 return match ?? { label: "Off duty", title: "A collection of personal interests", group: "off-duty" as const, icon: "collections" as const };
}
