import TabBar from "@/components/Tab-bar";

export default function TabLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            {children}
            <TabBar />
        </div>
    );
}
