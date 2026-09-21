import type {Metadata} from "next";

import ProfileContent from "@/components/profile/ProfileContent";

export const metadata: Metadata = {
    title: "Profile",
};

export default function ProfilePage() {
    return <ProfileContent locale="en"/>;
}