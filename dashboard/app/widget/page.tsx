
import VoiceWidget from "@/components/VoiceWidget";

export default function WidgetPage() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Voice Widget Test</h1>
                <p className="text-gray-500">Click the button below to test the widget.</p>

                {/* The widget is positioned fixed bottom-right, but for this demo page we can let it be */}
                <VoiceWidget />
            </div>
        </div>
    );
}
