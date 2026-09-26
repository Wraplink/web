import type {Metadata} from "next";

import ProfileContent from "@/components/profile/ProfileContent";

export const metadata: Metadata = {
    title: "Profile & Security",
};

export default function ProfilePage() {
    return (
        <ProfileContent locale="fa"/>
    );
}