import { metadataRadice, Radice, viewportRadice } from "@/components/Radice";

export const metadata = metadataRadice;
export const viewport = viewportRadice;

export default function LayoutEn({ children }: { children: React.ReactNode }) {
	return <Radice lingua="en">{children}</Radice>;
}
