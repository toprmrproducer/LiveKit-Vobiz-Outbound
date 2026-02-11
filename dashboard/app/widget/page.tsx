import VoiceWidget from "@/components/VoiceWidget";

export default function WidgetPage() {
    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            {/* The widget is positioned fixed bottom-right, this page is just a transparent container for the iframe */}
            <VoiceWidget />
        </div>
    );
}
