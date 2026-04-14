import { OctCanvas, OctLabelPanel, OctToolbar } from "@/components/oct";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <OctToolbar />
      <div className="flex min-h-0 flex-1 flex-row">
        <OctCanvas />
        <OctLabelPanel />
      </div>
    </div>
  );
}
