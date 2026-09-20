import { metadataRadice, Radice, viewportRadice } from "@/components/Radice";

export const metadata = metadataRadice;
export const viewport = viewportRadice;

export default function LayoutIt({ children }: { children: React.ReactNode }) {
	return <Radice lingua="it">{children}</Radice>;
}
